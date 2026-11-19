import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ErrorResponse } from "../contracts/types";
import { APP_LIMITS } from "../contracts/config";
import { RateLimitResult } from "./ratelimit";

/**
 * Standardized error response factory conforming to the MozhiMatch API contract.
 */
export function createErrorResponse(
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

/**
 * Standardized rate limit header builder for allowed requests.
 */
export function createRateLimitHeaders(check: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(check.limit),
    "X-RateLimit-Remaining": String(check.remaining),
    "X-RateLimit-Reset": String(check.resetSeconds),
  };
}

/**
 * Standardized rate limit header builder for throttled (429) requests.
 */
export function createRateLimitBlockedHeaders(check: RateLimitResult): Record<string, string> {
  return {
    "Retry-After": String(check.retryAfterSeconds ?? 60),
    "X-RateLimit-Limit": String(check.limit),
    "X-RateLimit-Remaining": "0",
    "X-RateLimit-Reset": String(check.resetSeconds),
  };
}

/**
 * Validates that incoming request content-type is application/json.
 * Returns a 415 NextResponse if invalid, or null if valid.
 */
export function validateContentType(request: NextRequest): NextResponse | null {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return createErrorResponse(415, "UNSUPPORTED_MEDIA_TYPE", "errors.unsupportedMediaType");
  }
  return null;
}

export interface ParsedBodySuccess<T> {
  success: true;
  data: T;
  rawBody: string;
}

export interface ParsedBodyError {
  success: false;
  response: NextResponse;
}

export type ParsedBodyResult<T> = ParsedBodySuccess<T> | ParsedBodyError;

/**
 * Standardized JSON request body pipeline:
 * 1. Reads raw text body with error handling
 * 2. Enforces byte length boundary (APP_LIMITS.MAX_REQUEST_BYTES)
 * 3. Safely parses JSON
 * 4. Executes schema validation via Zod
 * 
 * Returns typed data on success, or a ready-to-return NextResponse on failure.
 */
export async function parseAndValidateJsonBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<ParsedBodyResult<T>> {
  // 1. Read body text and check length bounds
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return {
      success: false,
      response: createErrorResponse(400, "INVALID_REQUEST", "errors.invalidRequest"),
    };
  }

  const byteLength = Buffer.byteLength(rawBody, "utf8");
  if (byteLength > APP_LIMITS.MAX_REQUEST_BYTES) {
    return {
      success: false,
      response: createErrorResponse(413, "BODY_TOO_LARGE", "errors.bodyTooLarge"),
    };
  }

  // 2. Parse JSON
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return {
      success: false,
      response: createErrorResponse(400, "INVALID_REQUEST", "errors.invalidRequest"),
    };
  }

  // 3. Validate schema
  const validation = schema.safeParse(parsedJson);
  if (!validation.success) {
    const reqId =
      typeof parsedJson === "object" && parsedJson !== null && "requestId" in parsedJson
        ? String((parsedJson as Record<string, unknown>).requestId)
        : null;
    return {
      success: false,
      response: createErrorResponse(422, "INVALID_REQUEST", "errors.invalidRequest", reqId),
    };
  }

  return {
    success: true,
    data: validation.data,
    rawBody,
  };
}
