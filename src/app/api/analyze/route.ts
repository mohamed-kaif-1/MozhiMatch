import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from "../../../lib/contracts/schemas";
import {
  AnalyzeResponse,
  AnalyzeResponseItem,
  QuestionItem,
  WarningCode,
} from "../../../lib/contracts/types";
import { checkStructuralRules, isStructurallyBlocked } from "../../../lib/core/rules";
import { validateItemComparisons } from "../../../lib/core/evidence";
import {
  validateOrigin,
  validateAnalyzeAIAccess,
} from "../../../lib/server/access";
import { enforceRateLimit, enforceGlobalAIBudget } from "../../../lib/server/ratelimit";
import { callGeminiSemanticReview } from "../../../lib/ai/gemini";
import {
  createErrorResponse,
  createRateLimitHeaders,
  createRateLimitBlockedHeaders,
  validateContentType,
  parseAndValidateJsonBody,
} from "../../../lib/server/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Content-Type check
  const contentTypeError = validateContentType(request);
  if (contentTypeError) {
    return contentTypeError;
  }

  // 2. Rate limiting enforcement
  const rateLimitCheck = await enforceRateLimit(request, "analyze");
  if (!rateLimitCheck.allowed) {
    return createErrorResponse(
      429,
      "RATE_LIMITED",
      "errors.rateLimited",
      null,
      createRateLimitBlockedHeaders(rateLimitCheck)
    );
  }

  const rateLimitHeaders = createRateLimitHeaders(rateLimitCheck);

  // 3. Read body text, check length bounds, parse JSON, and validate schema
  const parsed = await parseAndValidateJsonBody(request, AnalyzeRequestSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  const { requestId, revision, locale, mode, consent, items } = parsed.data;

  // 4. Origin check
  const originCheck = validateOrigin(request.headers.get("origin"));
  if (!originCheck.authorized && originCheck.errorCode && originCheck.messageKey) {
    return createErrorResponse(403, originCheck.errorCode, originCheck.messageKey, requestId);
  }

  // 5. If AI mode requested: check consent, AI access, and global budget
  if (mode === "ai") {
    if (!consent) {
      return createErrorResponse(422, "CONSENT_REQUIRED", "errors.consentRequired", requestId);
    }

    // Step 5a: AI access authorization check BEFORE budget consumption
    // Unauthorized requests must never exhaust the judge demo allowance.
    const aiAccessCheck = validateAnalyzeAIAccess(items, request.headers.get("x-demo-code"));
    if (!aiAccessCheck.authorized && aiAccessCheck.errorCode && aiAccessCheck.messageKey) {
      const status = aiAccessCheck.errorCode === "UNAUTHORIZED_DEMO" ? 401 : 403;
      return createErrorResponse(status, aiAccessCheck.errorCode, aiAccessCheck.messageKey, requestId);
    }

    // Step 5b: Shared quota requirement for anonymous public Gemini inference
    const isAnonymousPublic =
      process.env.DEPLOYMENT_MODE === "public_demo" && !aiAccessCheck.isOperator;

    // Step 5c: Global AI Request Budget check
    const budgetCheck = await enforceGlobalAIBudget("analyze", {
      requireSharedQuota: isAnonymousPublic,
    });
    if (!budgetCheck.allowed) {
      return createErrorResponse(429, "RATE_LIMITED", "errors.rateLimited", requestId, {
        "Retry-After": String(budgetCheck.retryAfterSeconds ?? 3600),
        "X-RateLimit-Limit": String(budgetCheck.limit),
        "X-RateLimit-Remaining": "0",
      });
    }
  }

  // 6. Structural rules for each item
  const itemFindingsMap = new Map<string, ReturnType<typeof checkStructuralRules>>();
  const structurallyBlockedSet = new Set<string>();

  for (const item of items) {
    const findings = checkStructuralRules(item);
    itemFindingsMap.set(item.id, findings);
    if (isStructurallyBlocked(findings)) {
      structurallyBlockedSet.add(item.id);
    }
  }

  // 7. If mode is "rules", return rules-only analysis directly
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

  // 8. AI mode execution
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
    return createErrorResponse(500, "INTERNAL_ERROR", "errors.internalError", requestId);
  }

  return NextResponse.json(finalCheck.data, { status: 200, headers: rateLimitHeaders });
}
