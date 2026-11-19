import { NextRequest, NextResponse } from "next/server";
import { CorrectionRequestSchema } from "../../../lib/contracts/correction";
import {
  validateOrigin,
  validateCorrectionAIAccess,
} from "../../../lib/server/access";
import { enforceRateLimit, enforceGlobalAIBudget } from "../../../lib/server/ratelimit";
import { generateCorrection } from "../../../lib/ai/correction";
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
  const rateLimitCheck = await enforceRateLimit(request, "correction");
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
  const parsed = await parseAndValidateJsonBody(request, CorrectionRequestSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  const reqData = parsed.data;
  const { requestId, consent } = reqData;

  // 4. Origin check
  const originCheck = validateOrigin(request.headers.get("origin"));
  if (!originCheck.authorized && originCheck.errorCode && originCheck.messageKey) {
    return createErrorResponse(403, originCheck.errorCode, originCheck.messageKey, requestId);
  }

  // 5. Security authorization & consent gate
  if (!consent) {
    return createErrorResponse(422, "CONSENT_REQUIRED", "errors.consentRequired", requestId);
  }

  // Step 5a: AI access authorization check BEFORE budget consumption
  // Unauthorized requests must never exhaust the judge demo allowance.
  const aiAccessCheck = validateCorrectionAIAccess(reqData, request.headers.get("x-demo-code"));
  if (!aiAccessCheck.authorized && aiAccessCheck.errorCode && aiAccessCheck.messageKey) {
    const status = aiAccessCheck.errorCode === "UNAUTHORIZED_DEMO" ? 401 : 403;
    return createErrorResponse(status, aiAccessCheck.errorCode, aiAccessCheck.messageKey, requestId);
  }

  // Step 5b: Shared quota requirement for anonymous public Gemini inference
  const isAnonymousPublic =
    process.env.DEPLOYMENT_MODE === "public_demo" && !aiAccessCheck.isOperator;

  // Step 5c: Global AI Request Budget check
  const budgetCheck = await enforceGlobalAIBudget("correction", {
    requireSharedQuota: isAnonymousPublic,
  });
  if (!budgetCheck.allowed) {
    return createErrorResponse(429, "RATE_LIMITED", "errors.rateLimited", requestId, {
      "Retry-After": String(budgetCheck.retryAfterSeconds ?? 3600),
      "X-RateLimit-Limit": String(budgetCheck.limit),
      "X-RateLimit-Remaining": "0",
    });
  }

  // 6. Generate correction
  const result = await generateCorrection(reqData);

  return NextResponse.json(result, {
    status: 200,
    headers: rateLimitHeaders,
  });
}
