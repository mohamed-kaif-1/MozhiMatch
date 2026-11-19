import { describe, it, expect } from "vitest";
import {
  parseAndValidateCsv,
  generateCsvTemplate,
  generateSampleCsv,
  validateCsvFileMeta,
  MAX_CSV_FILE_BYTES,
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

  it("handles PapaParse errors and rejects malformed quoting and inconsistent field counts with useful row errors", () => {
    // Malformed quotes
    const malformedCsv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q1,"Malformed quote stem without closing quote,தாள்,A,A,B,B,C,C,D,D,,`;

    const result = parseAndValidateCsv(malformedCsv);
    expect(result.success).toBe(false);
    expect(result.validItems).toHaveLength(0);
    // Must report quote or parsing error on the row or file
    const hasParseError =
      result.fileErrors.some((e) => /quote|parse|field/i.test(e)) ||
      result.rowPreviews.some((r) => r.errors.some((e) => /quote|parse|field/i.test(e)));
    expect(hasParseError).toBe(true);
  });

  it("preserves original source wording without silently trimming question or option content", () => {
    const csv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
Q1,"  Untrimmed stem with spaces  ","  தமிழ்த்தாள் இடைவெளி  ","  Opt A with spaces  ","  தேர்வு A  ","Opt B","தேர்வு B","Opt C","தேர்வு C","Opt D","தேர்வு D","",""`;

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(true);
    expect(result.validItems).toHaveLength(1);
    const item = result.validItems[0];
    expect(item.en.stem).toBe("  Untrimmed stem with spaces  ");
    expect(item.ta.stem).toBe("  தமிழ்த்தாள் இடைவெளி  ");
    expect(item.en.options[0].text).toBe("  Opt A with spaces  ");
  });

  describe("CSV File Metadata & Upload Limits Validation", () => {
    it("accepts valid CSV files by extension (.csv)", () => {
      const validMeta = validateCsvFileMeta({
        name: "questions_batch.csv",
        size: 1024,
      });
      expect(validMeta.valid).toBe(true);
      expect(validMeta.error).toBeUndefined();
    });

    it("accepts valid CSV files by MIME type (text/csv, application/vnd.ms-excel)", () => {
      const mimeMeta = validateCsvFileMeta({
        name: "uploaded_data",
        size: 2048,
        type: "text/csv",
      });
      expect(mimeMeta.valid).toBe(true);

      const excelCsvMeta = validateCsvFileMeta({
        name: "data",
        size: 4096,
        type: "application/vnd.ms-excel",
      });
      expect(excelCsvMeta.valid).toBe(true);
    });

    it("rejects non-CSV files (.pdf, .json, .txt without csv mime)", () => {
      const pdfMeta = validateCsvFileMeta({
        name: "exam.pdf",
        size: 1024,
        type: "application/pdf",
      });
      expect(pdfMeta.valid).toBe(false);
      expect(pdfMeta.error).toBe("Only CSV files (.csv) are supported.");

      const jsonMeta = validateCsvFileMeta({
        name: "data.json",
        size: 512,
        type: "application/json",
      });
      expect(jsonMeta.valid).toBe(false);
      expect(jsonMeta.error).toBe("Only CSV files (.csv) are supported.");
    });

    it("rejects files exceeding MAX_CSV_FILE_BYTES (512 KB limit)", () => {
      const oversized = validateCsvFileMeta({
        name: "large_batch.csv",
        size: MAX_CSV_FILE_BYTES + 1024,
      });
      expect(oversized.valid).toBe(false);
      expect(oversized.error).toContain("exceeds the maximum allowed limit of 512 KB");
    });

    it("accurately parses complex Tamil Unicode across vowels, consonants, and pulli", () => {
      const tamilCsv = `id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
TA_01,"Solar power","சூரிய மின்னாற்றல் மற்றும் புதுப்பிக்கத்தக்க ஆற்றல்","Coal","நிலக்கரி","Wind","காற்றாலை","Gas","இயற்கை எரிவாயு","Hydro","நீர் மின்சாரம்","",""`;

      const result = parseAndValidateCsv(tamilCsv);
      expect(result.success).toBe(true);
      expect(result.validItems).toHaveLength(1);
      const item = result.validItems[0];
      expect(item.ta.stem).toBe("சூரிய மின்னாற்றல் மற்றும் புதுப்பிக்கத்தக்க ஆற்றல்");
      expect(item.ta.options[0].text).toBe("நிலக்கரி");
      expect(item.ta.options[1].text).toBe("காற்றாலை");
      expect(item.ta.options[2].text).toBe("இயற்கை எரிவாயு");
      expect(item.ta.options[3].text).toBe("நீர் மின்சாரம்");
    });
  });
});
