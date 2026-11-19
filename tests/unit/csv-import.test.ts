import { describe, it, expect } from "vitest";
import {
  parseAndValidateCsv,
  generateCsvTemplate,
  generateSampleCsv,
} from "../../src/lib/core/csv-import";

describe("CSV Import Module", () => {
  it("generates a valid CSV template that parses without errors", () => {
    const template = generateCsvTemplate();
    const result = parseAndValidateCsv(template);
    expect(result.success).toBe(true);
    expect(result.fileErrors).toHaveLength(0);
    expect(result.validItems).toHaveLength(1);
    expect(result.validItems[0].id).toBe("Q1");
    expect(result.validItems[0].en.options).toHaveLength(4);
    expect(result.validItems[0].ta.options).toHaveLength(4);
  });

  it("generates and parses a multi-case synthetic sample CSV", () => {
    const sample = generateSampleCsv();
    const result = parseAndValidateCsv(sample);
    expect(result.success).toBe(true);
    expect(result.fileErrors).toHaveLength(0);
    expect(result.validItems).toHaveLength(5);

    // Verify clean case
    expect(result.validItems[0].id).toBe("BATCH_01_CLEAN");
    expect(result.validItems[0].en.options).toHaveLength(4);
    expect(result.validItems[0].ta.options).toHaveLength(4);

    // Verify structural difference preserved (BATCH_04_STRUCT has 4 EN vs 3 TA)
    expect(result.validItems[3].id).toBe("BATCH_04_STRUCT");
    expect(result.validItems[3].en.options).toHaveLength(4);
    expect(result.validItems[3].ta.options).toHaveLength(3);
  });

  it("correctly handles UTF-8 BOM, quoted commas, escaped quotes, and multiline text", () => {
    const csv = `\uFEFFid,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q_COMPLEX,"Line 1, with comma\nLine 2, and ""quotes""","வரி 1, கமாவுடன்\nவரி 2, மற்றும் ""மேற்கோள்""","Opt A, 1","தேர்வு A, 1","Opt B","தேர்வு B","Opt C","தேர்வு C","Opt D","தேர்வு D","",""`;

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(true);
    expect(result.validItems).toHaveLength(1);
    const item = result.validItems[0];
    expect(item.id).toBe("Q_COMPLEX");
    expect(item.en.stem).toBe('Line 1, with comma\nLine 2, and "quotes"');
    expect(item.ta.stem).toBe('வரி 1, கமாவுடன்\nவரி 2, மற்றும் "மேற்கோள்"');
    expect(item.en.options[0].text).toBe("Opt A, 1");
  });

  it("rejects corrupted files with replacement character (invalid UTF-8)", () => {
    const corruptedCsv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q1,Question \uFFFD corrupt,கேள்வி,A,A,B,B,C,C,D,D,,`;

    const result = parseAndValidateCsv(corruptedCsv);
    expect(result.success).toBe(false);
    expect(result.fileErrors[0]).toContain("invalid UTF-8 encoding");
  });

  it("rejects files with missing headers or unrecognized headers", () => {
    const badHeaders = `id,en_stem,ta_stem,en_A,ta_A
Q1,What is 2+2?,2+2 என்ன?,4,4`;

    const result = parseAndValidateCsv(badHeaders);
    expect(result.success).toBe(false);
    expect(result.fileErrors.some((e) => e.includes("Missing required column"))).toBe(true);
  });

  it("rejects files with duplicate headers", () => {
    const dupHeader = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,en_E
Q1,Stem,தாள்,A,A,B,B,C,C,D,D,E,E`;

    const result = parseAndValidateCsv(dupHeader);
    expect(result.success).toBe(false);
    expect(result.fileErrors.some((e) => e.includes("Duplicate column header"))).toBe(true);
  });

  it("rejects batches with more than 10 rows", () => {
    const rows = ["id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E"];
    for (let i = 1; i <= 11; i++) {
      rows.push(`Q${i},Stem ${i},தாள் ${i},A,A,B,B,C,C,D,D,,`);
    }
    const result = parseAndValidateCsv(rows.join("\n"));
    expect(result.success).toBe(false);
    expect(result.fileErrors.some((e) => e.includes("maximum allowed is 10 questions"))).toBe(true);
  });

  it("rejects duplicate question IDs", () => {
    const csv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q_DUP,Stem 1,தாள் 1,A,A,B,B,C,C,D,D,,
Q_DUP,Stem 2,தாள் 2,A,A,B,B,C,C,D,D,,`;

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(false);
    expect(result.rowPreviews[1].errors.some((e) => e.includes("Duplicate Question ID"))).toBe(true);
  });

  it("rejects rows with fewer than 2 options on either side", () => {
    const csv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q1,Stem 1,தாள் 1,A,A,B,,,,,`; // Only 1 option in Tamil (A)

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(false);
    expect(
      result.rowPreviews[0].errors.some((e) => e.includes("Tamil version must have at least 2 non-empty options"))
    ).toBe(true);
  });

  it("is atomic: all errors are collected and validItems is empty when any row fails", () => {
    const csv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q1,Valid stem,சரியான தாள்,A,A,B,B,C,C,D,D,,
Q2,,வெற்று தாள்,A,A,B,B,C,C,D,D,,`; // Empty EN stem on Q2

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(false);
    expect(result.validItems).toHaveLength(0);
    expect(result.rowPreviews[0].errors).toHaveLength(0);
    expect(result.rowPreviews[1].errors.some((e) => e.includes("English question text"))).toBe(true);
  });
});
