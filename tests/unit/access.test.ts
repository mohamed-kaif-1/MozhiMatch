import { describe, it, expect } from "vitest";
import {
  timingSafeStringEqual,
  validateOrigin,
  validateDemoCode,
  validateDemoAllowlist,
} from "../../src/lib/server/access";
import devFixtures from "../../src/fixtures/development.json";
import { QuestionItem } from "../../src/lib/contracts/types";

describe("Access and Security Controls", () => {
  it("timingSafeStringEqual verifies string equality accurately", () => {
    expect(timingSafeStringEqual("secret-code-123", "secret-code-123")).toBe(true);
    expect(timingSafeStringEqual("secret-code-123", "wrong-code")).toBe(false);
    expect(timingSafeStringEqual("", "")).toBe(true);
  });

  it("validateOrigin rejects origin mismatch when configured", () => {
    const res = validateOrigin("https://evil.com", "https://mozhimmatch.vercel.app");
    expect(res.authorized).toBe(false);
    expect(res.errorCode).toBe("FORBIDDEN_ORIGIN");

    const validRes = validateOrigin("https://mozhimmatch.vercel.app", "https://mozhimmatch.vercel.app");
    expect(validRes.authorized).toBe(true);
  });

  it("validateDemoCode validates capability code", () => {
    // When expected code is set
    const resFail = validateDemoCode("wrong-code", "correct-secret-123");
    expect(resFail.authorized).toBe(false);
    expect(resFail.errorCode).toBe("UNAUTHORIZED_DEMO");

    const resPass = validateDemoCode("correct-secret-123", "correct-secret-123");
    expect(resPass.authorized).toBe(true);

    // When expected code is empty/not set (e.g. open local dev)
    const resOpen = validateDemoCode(null, "");
    expect(resOpen.authorized).toBe(true);
  });

  it("validateDemoAllowlist allows development fixtures and blocks unapproved input in public_demo mode", () => {
    const devItems = devFixtures.slice(0, 2) as QuestionItem[];
    const pass = validateDemoAllowlist(devItems, "public_demo");
    expect(pass.authorized).toBe(true);

    const arbitraryItem: QuestionItem = {
      id: "CUSTOM_UNKNOWN",
      en: {
        stem: "Arbitrary stem not in allowlist?",
        options: [
          { label: "A", text: "1" },
          { label: "B", text: "2" },
        ],
      },
      ta: {
        stem: "அனுமதிக்கப்படாத வினா?",
        options: [
          { label: "A", text: "1" },
          { label: "B", text: "2" },
        ],
      },
    };

    const fail = validateDemoAllowlist([arbitraryItem], "public_demo");
    expect(fail.authorized).toBe(false);
    expect(fail.errorCode).toBe("DEMO_INPUT_RESTRICTED");
  });
});

