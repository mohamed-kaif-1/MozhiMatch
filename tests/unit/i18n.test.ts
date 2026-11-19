import { describe, it, expect } from "vitest";
import enMessages from "../../src/messages/en.json";
import taMessages from "../../src/messages/ta.json";

function getLeafKeys(obj: Record<string, unknown>, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const childLeaves = getLeafKeys(value as Record<string, unknown>, fullPath);
      for (const [childPath, childVal] of childLeaves.entries()) {
        result.set(childPath, childVal);
      }
    } else if (typeof value === "string") {
      result.set(fullPath, value);
    }
  }
  return result;
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{[A-Za-z0-9_]+\}/g);
  return matches ? matches.sort() : [];
}

describe("Internationalisation and Locale Keys", () => {
  const enKeys = getLeafKeys(enMessages as Record<string, unknown>);
  const taKeys = getLeafKeys(taMessages as Record<string, unknown>);

  it("has exact symmetric key coverage between English and Tamil dictionaries", () => {
    const missingInTa: string[] = [];
    const missingInEn: string[] = [];

    for (const key of enKeys.keys()) {
      if (!taKeys.has(key)) missingInTa.push(key);
    }

    for (const key of taKeys.keys()) {
      if (!enKeys.has(key)) missingInEn.push(key);
    }

    expect(missingInTa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("preserves identical template placeholders across languages", () => {
    const placeholderMismatches: string[] = [];

    for (const [key, enText] of enKeys.entries()) {
      const taText = taKeys.get(key);
      if (!taText) continue;

      const enPlaceholders = extractPlaceholders(enText);
      const taPlaceholders = extractPlaceholders(taText);

      if (enPlaceholders.join(",") !== taPlaceholders.join(",")) {
        placeholderMismatches.push(
          `${key}: EN [${enPlaceholders.join(",")}] vs TA [${taPlaceholders.join(",")}]`
        );
      }
    }

    expect(placeholderMismatches).toEqual([]);
  });
});
