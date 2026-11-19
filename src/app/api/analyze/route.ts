import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from "../../../lib/contracts/schemas";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
import {
  AnalyzeResponse,
  AnalyzeResponseItem,
  ErrorResponse,
  QuestionItem,
  WarningCode,
} from "../../../lib/contracts/types";
import { APP_LIMITS } from "../../../lib/contracts/config";
import { checkStructuralRules, isStructurallyBlocked } from "../../../lib/core/rules";
import { validateItemComparisons } from "../../../lib/core/evidence";
import {
  validateOrigin,
  validateDemoCode,
  validateDemoAllowlist,
} from "../../../lib/server/access";
import { enforceRateLimit } from "../../../lib/server/ratelimit";
import { callGeminiSemanticReview } from "../../../lib/ai/gemini";

function errorResponse(
  status: number,
  code: ErrorResponse["error"]["code"],
  messageKey: string,
  requestId: string | null = null,
  headers?: Record<string, string>
): NextResponse {
  const body: ErrorResponse = {
    error: {
      code,
      messageKey,
      requestId,
    },
  };
  return NextResponse.json(body, { status, headers });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Content-Type check
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return errorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "errors.unsupportedMediaType");
  }

  // 2. Rate limiting enforcement
  const rateLimitCheck = await enforceRateLimit(request, "analyze");
  if (!rateLimitCheck.allowed) {
    return errorResponse(429, "RATE_LIMITED", "errors.rateLimited", null, {
      "Retry-After": String(rateLimitCheck.retryAfterSeconds ?? 60),
      "X-RateLimit-Limit": String(rateLimitCheck.limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(rateLimitCheck.resetSeconds),
    });
  }

  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rateLimitCheck.limit),
    "X-RateLimit-Remaining": String(rateLimitCheck.remaining),
    "X-RateLimit-Reset": String(rateLimitCheck.resetSeconds),
  };

  // 3. Read body text and check length bounds
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(400, "INVALID_REQUEST", "errors.invalidRequest");
  }

  const byteLength = Buffer.byteLength(rawBody, "utf8");
  if (byteLength > APP_LIMITS.MAX_REQUEST_BYTES) {
    return errorResponse(413, "BODY_TOO_LARGE", "errors.bodyTooLarge");
  }

  // 3. Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "INVALID_REQUEST", "errors.invalidRequest");
  }

  // 4. Validate schema
  const validation = AnalyzeRequestSchema.safeParse(parsedJson);
  if (!validation.success) {
    const reqId =
      typeof parsedJson === "object" && parsedJson !== null && "requestId" in parsedJson
        ? String((parsedJson as Record<string, unknown>).requestId)
        : null;
    return errorResponse(422, "INVALID_REQUEST", "errors.invalidRequest", reqId);
  }

  const reqData = validation.data;
  const { requestId, revision, locale, mode, consent, items } = reqData;

  // 5. Origin check
  const originCheck = validateOrigin(request.headers.get("origin"));
  if (!originCheck.authorized && originCheck.errorCode && originCheck.messageKey) {
    return errorResponse(403, originCheck.errorCode, originCheck.messageKey, requestId);
  }

  // 6. If AI mode requested: check consent, demo code, and demo allowlist
  if (mode === "ai") {
    if (!consent) {
      return errorResponse(422, "CONSENT_REQUIRED", "errors.consentRequired", requestId);
    }

    const demoCodeCheck = validateDemoCode(request.headers.get("x-demo-code"));
    if (!demoCodeCheck.authorized && demoCodeCheck.errorCode && demoCodeCheck.messageKey) {
      return errorResponse(401, demoCodeCheck.errorCode, demoCodeCheck.messageKey, requestId);
    }

    const allowlistCheck = validateDemoAllowlist(items);
    if (!allowlistCheck.authorized && allowlistCheck.errorCode && allowlistCheck.messageKey) {
      return errorResponse(403, allowlistCheck.errorCode, allowlistCheck.messageKey, requestId);
    }
  }

  // 7. Structural rules for each item
  const itemFindingsMap = new Map<string, ReturnType<typeof checkStructuralRules>>();
  const structurallyBlockedSet = new Set<string>();

  for (const item of items) {
    const findings = checkStructuralRules(item);
    itemFindingsMap.set(item.id, findings);
    if (isStructurallyBlocked(findings)) {
      structurallyBlockedSet.add(item.id);
    }
  }

  // 8. If mode is "rules", return rules-only analysis directly
  // In rules-only mode, all items require semantic review even if structural checks pass cleanly
  if (mode === "rules") {
    const responseItems: AnalyzeResponseItem[] = items.map((item) => {
      const findings = itemFindingsMap.get(item.id) || [];
      return {
        id: item.id,
        status: "needs_review",
        structuralFindings: findings,
        comparisons: [],
      };
    });

    const responseBody: AnalyzeResponse = {
      requestId,
      revision,
      mode: "rules_only",
      model: null,
      providerStatus: "not_requested",
      warnings: [],
      items: responseItems,
    };

    return NextResponse.json(responseBody, { status: 200, headers: rateLimitHeaders });
  }

  // 9. AI mode execution
  const eligibleItems: QuestionItem[] = items.filter(
    (item) => !structurallyBlockedSet.has(item.id)
  );

  // If no items are eligible for semantic review (all structurally blocked)
  if (eligibleItems.length === 0) {
    const responseItems: AnalyzeResponseItem[] = items.map((item) => ({
      id: item.id,
      status: "needs_review",
      structuralFindings: itemFindingsMap.get(item.id) || [],
      comparisons: [],
    }));

    const responseBody: AnalyzeResponse = {
      requestId,
      revision,
      mode: "rules_only",
      model: null,
      providerStatus: "not_requested",
      warnings: [],
      items: responseItems,
    };

    return NextResponse.json(responseBody, { status: 200, headers: rateLimitHeaders });
  }

  // Call Gemini provider
  const geminiResult = await callGeminiSemanticReview(eligibleItems, locale);

  // If Gemini provider call failed or unavailable
  if (geminiResult.status !== "ok" || !geminiResult.output) {
    const warnings: WarningCode[] = geminiResult.warning ? [geminiResult.warning] : [];
    const responseItems: AnalyzeResponseItem[] = items.map((item) => ({
      id: item.id,
      status: "needs_review",
      structuralFindings: itemFindingsMap.get(item.id) || [],
      comparisons: [],
    }));

    const responseBody: AnalyzeResponse = {
      requestId,
      revision,
      mode: "rules_only",
      model: geminiResult.model,
      providerStatus: geminiResult.status,
      warnings,
      items: responseItems,
    };

    return NextResponse.json(responseBody, { status: 200, headers: rateLimitHeaders });
  }

  // Gemini returned results: validate each item and each comparison
  const providerResultsMap = new Map(
    geminiResult.output.results.map((r) => [r.itemId, r])
  );

  let anyValidAiItem = false;
  const responseItems: AnalyzeResponseItem[] = [];

  for (const item of items) {
    const findings = itemFindingsMap.get(item.id) || [];

    // If structurally blocked, do not show semantic comparisons
    if (structurallyBlockedSet.has(item.id)) {
      responseItems.push({
        id: item.id,
        status: "needs_review",
        structuralFindings: findings,
        comparisons: [],
      });
      continue;
    }

    const providerItem = providerResultsMap.get(item.id);
    if (!providerItem) {
      // Model failed to return comparison for this item
      responseItems.push({
        id: item.id,
        status: "needs_review",
        structuralFindings: findings,
        comparisons: [],
      });
      continue;
    }

    // Validate evidence and coverage
    const valResult = validateItemComparisons(item, providerItem, findings);
    if (!valResult.valid) {
      responseItems.push({
        id: item.id,
        status: "needs_review",
        structuralFindings: findings,
        comparisons: [],
      });
    } else {
      anyValidAiItem = true;
      responseItems.push({
        id: item.id,
        status: valResult.status,
        structuralFindings: findings,
        comparisons: valResult.comparisons,
      });
    }
  }

  const responseBody: AnalyzeResponse = {
    requestId,
    revision,
    mode: anyValidAiItem ? "live_ai" : "rules_only",
    model: geminiResult.model,
    providerStatus: "ok",
    warnings: [],
    items: responseItems,
  };

  const finalCheck = AnalyzeResponseSchema.safeParse(responseBody);
  if (!finalCheck.success) {
    return errorResponse(500, "INTERNAL_ERROR", "errors.internalError", requestId);
  }

  return NextResponse.json(finalCheck.data, { status: 200, headers: rateLimitHeaders });
}

