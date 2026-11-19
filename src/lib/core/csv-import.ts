import Papa from "papaparse";
import { QuestionItem } from "../contracts/types";
import { APP_LIMITS } from "../contracts/config";

export const MAX_CSV_FILE_BYTES = 512 * 1024; // 512 KB limit

export const EXPECTED_CSV_COLUMNS = [
  "id",
  "en_stem",
  "ta_stem",
  "en_A",
  "ta_A",
  "en_B",
  "ta_B",
  "en_C",
  "ta_C",
  "en_D",
  "ta_D",
  "en_E",
  "ta_E",
] as const;

export type CsvColumn = (typeof EXPECTED_CSV_COLUMNS)[number];

export interface CsvRowPreview {
  rowNumber: number;
  id: string;
  enStemSnippet: string;
  taStemSnippet: string;
  enOptionCount: number;
  taOptionCount: number;
  errors: string[];
}

export interface CsvParseResult {
  success: boolean;
  fileErrors: string[];
  rowPreviews: CsvRowPreview[];
  validItems: QuestionItem[];
}

/**
 * Validates header columns against expected schema.
 */
function validateHeaders(headers: string[] | undefined): string[] {
  const errors: string[] = [];
  if (!headers || headers.length === 0) {
    return ["CSV file is missing a header row."];
  }

  // Clean BOM and trim headers
  const cleanedHeaders = headers.map((h, i) => {
    let clean = h.trim();
    if (i === 0 && clean.charCodeAt(0) === 0xfeff) {
      clean = clean.slice(1).trim();
    }
    return clean;
  });

  // Check for duplicate headers
  const seen = new Set<string>();
  for (const h of cleanedHeaders) {
    if (seen.has(h)) {
      errors.push(`Duplicate column header in CSV: "${h}".`);
    }
    seen.add(h);
  }

  // Check for missing required columns
  for (const expected of EXPECTED_CSV_COLUMNS) {
    if (!cleanedHeaders.includes(expected)) {
      errors.push(`Missing required column header: "${expected}".`);
    }
  }

  // Check for unrecognized headers
  for (const h of cleanedHeaders) {
    if (!EXPECTED_CSV_COLUMNS.includes(h as CsvColumn)) {
      errors.push(`Unrecognized column header: "${h}".`);
    }
  }

  return errors;
}

/**
 * Parses and validates CSV string content into typed QuestionItems with detailed previews and errors.
 */
export function parseAndValidateCsv(csvText: string): CsvParseResult {
  const fileErrors: string[] = [];

  // 1. Check for invalid UTF-8 replacement characters
  if (csvText.includes("\uFFFD")) {
    return {
      success: false,
      fileErrors: [
        "File contains invalid UTF-8 encoding or corrupted characters. Ensure the file is saved as UTF-8 without corruption.",
      ],
      rowPreviews: [],
      validItems: [],
    };
  }

  // 2. Strip UTF-8 BOM if present at the very start
  let content = csvText;
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  // 3. Extract raw headers first (preview: 1) to detect duplicate headers before PapaParse auto-renames them
  const headerCheck = Papa.parse<string[]>(content, {
    preview: 1,
    header: false,
    skipEmptyLines: "greedy",
  });

  const rawHeaderRow = headerCheck.data?.[0];
  const headerErrors = validateHeaders(rawHeaderRow);
  if (headerErrors.length > 0) {
    return {
      success: false,
      fileErrors: [...fileErrors, ...headerErrors],
      rowPreviews: [],
      validItems: [],
    };
  }

  // 4. Parse full table with PapaParse
  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length === 0) {
    return {
      success: false,
      fileErrors: ["CSV file contains no question data rows."],
      rowPreviews: [],
      validItems: [],
    };
  }

  if (rawRows.length > APP_LIMITS.MAX_ITEMS) {
    fileErrors.push(
      `CSV contains ${rawRows.length} questions; maximum allowed is ${APP_LIMITS.MAX_ITEMS} questions per batch.`
    );
  }

  const rowPreviews: CsvRowPreview[] = [];
  const validItems: QuestionItem[] = [];
  const seenIds = new Set<string>();
  const idRegex = /^[A-Za-z0-9_-]{1,40}$/;
  const optionLabels: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // Line 1 is header, Line 2 is first data row
    const rowErrors: string[] = [];

    const rawId = (row["id"] || "").trim();
    const enStem = (row["en_stem"] || "").trim();
    const taStem = (row["ta_stem"] || "").trim();

    // Validate ID
    if (!rawId) {
      rowErrors.push("Question ID is required.");
    } else if (!idRegex.test(rawId)) {
      rowErrors.push("Question ID must be 1-40 alphanumeric characters, hyphens, or underscores.");
    } else if (seenIds.has(rawId)) {
      rowErrors.push(`Duplicate Question ID "${rawId}". Each question must have a unique ID.`);
    } else {
      seenIds.add(rawId);
    }

    // Validate Stems
    if (!enStem) {
      rowErrors.push("English question text (en_stem) cannot be empty.");
    } else if (enStem.length > APP_LIMITS.MAX_STEM_LENGTH) {
      rowErrors.push(
        `English question text exceeds maximum ${APP_LIMITS.MAX_STEM_LENGTH} characters (${enStem.length}).`
      );
    }

    if (!taStem) {
      rowErrors.push("Tamil question text (ta_stem) cannot be empty.");
    } else if (taStem.length > APP_LIMITS.MAX_STEM_LENGTH) {
      rowErrors.push(
        `Tamil question text exceeds maximum ${APP_LIMITS.MAX_STEM_LENGTH} characters (${taStem.length}).`
      );
    }

    // Validate Options
    const enOptions: { label: "A" | "B" | "C" | "D" | "E"; text: string }[] = [];
    const taOptions: { label: "A" | "B" | "C" | "D" | "E"; text: string }[] = [];

    for (const label of optionLabels) {
      const enVal = (row[`en_${label}`] || "").trim();
      const taVal = (row[`ta_${label}`] || "").trim();

      if (enVal.length > APP_LIMITS.MAX_OPTION_LENGTH) {
        rowErrors.push(
          `English option ${label} exceeds maximum ${APP_LIMITS.MAX_OPTION_LENGTH} characters (${enVal.length}).`
        );
      }
      if (taVal.length > APP_LIMITS.MAX_OPTION_LENGTH) {
        rowErrors.push(
          `Tamil option ${label} exceeds maximum ${APP_LIMITS.MAX_OPTION_LENGTH} characters (${taVal.length}).`
        );
      }

      // If text exists, add to respective side (preserving structural discrepancies)
      if (enVal.length > 0) {
        enOptions.push({ label, text: enVal });
      }
      if (taVal.length > 0) {
        taOptions.push({ label, text: taVal });
      }
    }

    if (enOptions.length < APP_LIMITS.MIN_OPTIONS) {
      rowErrors.push(
        `English version must have at least ${APP_LIMITS.MIN_OPTIONS} non-empty options (found ${enOptions.length}).`
      );
    }
    if (taOptions.length < APP_LIMITS.MIN_OPTIONS) {
      rowErrors.push(
        `Tamil version must have at least ${APP_LIMITS.MIN_OPTIONS} non-empty options (found ${taOptions.length}).`
      );
    }

    // Preview snippet truncation (first 60 characters)
    const enSnippet = enStem.length > 60 ? enStem.slice(0, 57) + "..." : enStem;
    const taSnippet = taStem.length > 60 ? taStem.slice(0, 57) + "..." : taStem;

    rowPreviews.push({
      rowNumber: rowNum,
      id: rawId || `Row ${rowNum}`,
      enStemSnippet: enSnippet || "(empty)",
      taStemSnippet: taSnippet || "(empty)",
      enOptionCount: enOptions.length,
      taOptionCount: taOptions.length,
      errors: rowErrors,
    });

    if (rowErrors.length === 0) {
      validItems.push({
        id: rawId,
        en: { stem: enStem, options: enOptions },
        ta: { stem: taStem, options: taOptions },
      });
    }
  });

  // Check if any row has errors
  const hasRowErrors = rowPreviews.some((r) => r.errors.length > 0);

  // 5. Total payload size check if valid items exist
  if (!hasRowErrors && fileErrors.length === 0 && validItems.length > 0) {
    const payloadBytes = Buffer.byteLength(JSON.stringify(validItems), "utf8");
    if (payloadBytes > APP_LIMITS.MAX_REQUEST_BYTES) {
      fileErrors.push(
        `Total batch data size (${payloadBytes} bytes) exceeds the ${APP_LIMITS.MAX_REQUEST_BYTES}-byte analysis limit. Reduce text length or number of items.`
      );
    }
  }

  const success = fileErrors.length === 0 && !hasRowErrors && validItems.length > 0;

  return {
    success,
    fileErrors,
    rowPreviews,
    validItems: success ? validItems : [],
  };
}

/**
 * Generates an empty CSV template with standard headers and sample placeholder comment row.
 */
export function generateCsvTemplate(): string {
  const header = EXPECTED_CSV_COLUMNS.join(",");
  const sampleRow = [
    "Q1",
    '"Which of these is NOT a fruit?"',
    '"இவற்றில் பழம் அல்லாதது எது?"',
    '"Apple"',
    '"ஆப்பிள்"',
    '"Banana"',
    '"வாழைப்பழம்"',
    '"Carrot"',
    '"கேரட்"',
    '"Mango"',
    '"மாம்பழம்"',
    '""',
    '""',
  ].join(",");

  return `\uFEFF${header}\n${sampleRow}\n`;
}

/**
 * Generates a synthetic multi-case CSV demonstrating clean, meaning-change, and structural discrepancy scenarios.
 */
export function generateSampleCsv(): string {
  const header = EXPECTED_CSV_COLUMNS.join(",");
  const rows = [
    // 1. Clean control
    [
      "BATCH_01_CLEAN",
      '"What is the square root of 64?"',
      '"64-இன் வர்க்கமூலம் என்ன?"',
      '"6"',
      '"6"',
      '"8"',
      '"8"',
      '"10"',
      '"10"',
      '"12"',
      '"12"',
      '""',
      '""',
    ].join(","),
    // 2. Meaning changed: negation dropped in Tamil
    [
      "BATCH_02_NEGATION",
      '"Which of the following is NOT an operating system?"',
      '"பின்வருவனவற்றில் இயக்க முறைமை எது?"',
      '"Linux"',
      '"லினக்ஸ்"',
      '"Windows"',
      '"விண்டோஸ்"',
      '"Google Chrome"',
      '"கூகிள் குரோம்"',
      '"macOS"',
      '"மேக் ஓஎஸ்"',
      '""',
      '""',
    ].join(","),
    // 3. Meaning changed: inverted verb direction
    [
      "BATCH_03_VERB",
      '"Who received the award from the President?"',
      '"ஜனாதிபதிக்கு விருதை வழங்கியவர் யார்?"',
      '"Dr. Raman"',
      '"டாக்டர் ராமன்"',
      '"Prof. Kumar"',
      '"பேராசிரியர் குமார்"',
      '"Ms. Selvi"',
      '"செல்வி"',
      '"Mr. Anand"',
      '"திரு. ஆனந்த்"',
      '""',
      '""',
    ].join(","),
    // 4. Structural difference: Option count mismatch (4 EN vs 3 TA)
    [
      "BATCH_04_STRUCT",
      '"Select the primary color:"',
      '"முதன்மை நிறத்தைத் தேர்ந்தெடுக்கவும்:"',
      '"Red"',
      '"சிவப்பு"',
      '"Blue"',
      '"நீலம்"',
      '"Yellow"',
      '"மஞ்சள்"',
      '"Green"',
      '""', // TA option D is missing
      '""',
      '""',
    ].join(","),
    // 5. Ambiguity: Proper noun transliteration
    [
      "BATCH_05_AMBIGUOUS",
      '"Who founded the research academy?"',
      '"ஆராய்ச்சி கழகத்தை நிறுவியவர் யார்?"',
      '"K. Arumugam"',
      '"க. ஆறுமுகம்"',
      '"S. Nathan"',
      '"எஸ். நாதன்"',
      '"M. Velu"',
      '"எம். வேலு"',
      '"R. Balan"',
      '"ஆர். பாலன்"',
      '""',
      '""',
    ].join(","),
  ];

  return `\uFEFF${header}\n${rows.join("\n")}\n`;
}
