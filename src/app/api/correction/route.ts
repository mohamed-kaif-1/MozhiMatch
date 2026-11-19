import { NextRequest, NextResponse } from "next/server";
import { CorrectionRequestSchema } from "../../../lib/contracts/correction";
import { ErrorResponse } from "../../../lib/contracts/types";
import { APP_LIMITS } from "../../../lib/contracts/config";
import {
  validateOrigin,
  validateCorrectionAIAccess,
} from "../../../lib/server/access";
import { enforceRateLimit, enforceGlobalAIBudget } from "../../../lib/server/ratelimit";
import { generateCorrection } from "../../../lib/ai/correction";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  const rateLimitCheck = await enforceRateLimit(request, "correction");
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

  // 4. Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "INVALID_REQUEST", "errors.invalidRequest");
  }

  // 5. Validate schema
  const validation = CorrectionRequestSchema.safeParse(parsedJson);
  if (!validation.success) {
    const reqId =
      typeof parsedJson === "object" && parsedJson !== null && "requestId" in parsedJson
        ? String((parsedJson as Record<string, unknown>).requestId)
        : null;
    return errorResponse(422, "INVALID_REQUEST", "errors.invalidRequest", reqId);
  }

  const reqData = validation.data;
  const { requestId, consent } = reqData;

  // 6. Origin check
  const originCheck = validateOrigin(request.headers.get("origin"));
  if (!originCheck.authorized && originCheck.errorCode && originCheck.messageKey) {
    return errorResponse(403, originCheck.errorCode, originCheck.messageKey, requestId);
  }

  // 7. Security authorization & consent gate
  if (!consent) {
    return errorResponse(422, "CONSENT_REQUIRED", "errors.consentRequired", requestId);
  }

  // Global AI Request Budget check
  const budgetCheck = await enforceGlobalAIBudget("correction");
  if (!budgetCheck.allowed) {
    return errorResponse(429, "RATE_LIMITED", "errors.rateLimited", requestId, {
      "Retry-After": String(budgetCheck.retryAfterSeconds ?? 3600),
      "X-RateLimit-Limit": String(budgetCheck.limit),
      "X-RateLimit-Remaining": "0",
    });
  }

  const aiAccessCheck = validateCorrectionAIAccess(reqData, request.headers.get("x-demo-code"));
  if (!aiAccessCheck.authorized && aiAccessCheck.errorCode && aiAccessCheck.messageKey) {
    const status = aiAccessCheck.errorCode === "UNAUTHORIZED_DEMO" ? 401 : 403;
    return errorResponse(status, aiAccessCheck.errorCode, aiAccessCheck.messageKey, requestId);
  }

  // 9. Generate correction
  const result = await generateCorrection(reqData);

  return NextResponse.json(result, {
    status: 200,
    headers: rateLimitHeaders,
  });
}
