import "server-only";
import crypto from "crypto";
import devFixtures from "../../fixtures/development.json";
import { QuestionItem, ErrorCode } from "../contracts/types";

// Constant-time string equality check using SHA-256 hashes
export function timingSafeStringEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export interface AccessCheckResult {
  authorized: boolean;
  errorCode?: ErrorCode;
  messageKey?: string;
}

export function validateOrigin(
  originHeader: string | null,
  appOriginEnv?: string
): AccessCheckResult {
  const allowedOrigin = appOriginEnv || process.env.APP_ORIGIN;
  // If no APP_ORIGIN configured (e.g. in local dev), allow localhost / same-origin
  if (!allowedOrigin) {
    return { authorized: true };
  }

  if (!originHeader) {
    // Missing origin on same-origin POST in modern browsers can occur or be blocked in hosted demo
    if (process.env.NODE_ENV === "production") {
      return {
        authorized: false,
        errorCode: "FORBIDDEN_ORIGIN",
        messageKey: "errors.forbiddenOrigin",
      };
    }
    return { authorized: true };
  }

  // Exact origin comparison
  try {
    const headerOriginUrl = new URL(originHeader).origin;
    const allowedOriginUrl = new URL(allowedOrigin).origin;
    if (headerOriginUrl !== allowedOriginUrl) {
      return {
        authorized: false,
        errorCode: "FORBIDDEN_ORIGIN",
        messageKey: "errors.forbiddenOrigin",
      };
    }
  } catch {
    return {
      authorized: false,
      errorCode: "FORBIDDEN_ORIGIN",
      messageKey: "errors.forbiddenOrigin",
    };
  }

  return { authorized: true };
}

export function validateDemoCode(
  providedCode: string | null,
  expectedCodeEnv?: string
): AccessCheckResult {
  const expectedCode = expectedCodeEnv !== undefined ? expectedCodeEnv : process.env.DEMO_ACCESS_CODE;
  // If no demo code configured on server, access is open (e.g. local development)
  if (!expectedCode || expectedCode.trim().length === 0) {
    return { authorized: true };
  }

  if (!providedCode || providedCode.trim().length === 0) {
    return {
      authorized: false,
      errorCode: "UNAUTHORIZED_DEMO",
      messageKey: "errors.unauthorizedDemo",
    };
  }

  if (!timingSafeStringEqual(providedCode, expectedCode)) {
    return {
      authorized: false,
      errorCode: "UNAUTHORIZED_DEMO",
      messageKey: "errors.unauthorizedDemo",
    };
  }

  return { authorized: true };
}

export function isItemInAllowlist(item: QuestionItem): boolean {
  // Checks if the item matches any item in the synthetic development fixtures
  return devFixtures.some((fixture) => {
    if (fixture.id !== item.id) return false;
    if (fixture.en.stem.trim() !== item.en.stem.trim()) return false;
    if (fixture.ta.stem.trim() !== item.ta.stem.trim()) return false;
    return true;
  });
}

export function validateDemoAllowlist(
  items: QuestionItem[],
  deploymentModeEnv?: string
): AccessCheckResult {
  const mode = deploymentModeEnv || process.env.DEPLOYMENT_MODE;
  // In public_demo mode, live AI can only run on server-owned allowlisted practice items
  if (mode === "public_demo") {
    const allAllowlisted = items.every(isItemInAllowlist);
    if (!allAllowlisted) {
      return {
        authorized: false,
        errorCode: "DEMO_INPUT_RESTRICTED",
        messageKey: "errors.demoInputRestricted",
      };
    }
  }
  return { authorized: true };
}
