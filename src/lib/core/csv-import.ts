import Papa from "papaparse";
import { QuestionItem } from "../contracts/types";
import { QuestionItemSchema } from "../contracts/schemas";
import { APP_LIMITS } from "../contracts/config";

export const MAX_CSV_FILE_BYTES = 512 * 1024; // 512 KB limit

export interface CsvFileMeta {
  name: string;
  size: number;
  type?: string;
}

/**
 * Validates metadata for dropped or selected CSV files (extension, mime type, size).
 */
export function validateCsvFileMeta(file: CsvFileMeta): { valid: boolean; error?: string } {
  const isCsvExtension = file.name.toLowerCase().endsWith(".csv");
  const isCsvMime =
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "text/plain";

  if (!isCsvExtension && !isCsvMime) {
    return { valid: false, error: "Only CSV files (.csv) are supported." };
  }

  if (file.size > MAX_CSV_FILE_BYTES) {
    return {
      valid: false,
      error: `File size (${Math.round(file.size / 1024)} KB) exceeds the maximum allowed limit of 512 KB.`,
    };
  }

  return { valid: true };
}

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

  // Collect PapaParse parse-level errors (malformed quoting, inconsistent field counts, etc.)
  const papaRowErrors = new Map<number, string[]>();
  if (parsed.errors && parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      const msg = `CSV parse error on line ${err.row !== undefined ? err.row + 2 : "unknown"}: ${err.message} (${err.code || err.type}).`;
      if (err.row !== undefined) {
        if (!papaRowErrors.has(err.row)) {
          papaRowErrors.set(err.row, []);
        }
        papaRowErrors.get(err.row)!.push(msg);
      } else {
        fileErrors.push(msg);
      }
    }
  }

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length === 0) {
    return {
      success: false,
      fileErrors: fileErrors.length > 0 ? fileErrors : ["CSV file contains no question data rows."],
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

    // Attach any PapaParse parse-level error recorded for this row
    if (papaRowErrors.has(idx)) {
      rowErrors.push(...papaRowErrors.get(idx)!);
    }

    const rawId = (row["id"] ?? "").trim();
    // Preserve original source wording without silent trimming
    const rawEnStem = row["en_stem"] ?? "";
    const rawTaStem = row["ta_stem"] ?? "";

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

    // Validate Stems (check trimmed length for emptiness, but preserve original text)
    if (rawEnStem.trim().length === 0) {
      rowErrors.push("English question text (en_stem) cannot be empty.");
    } else if (rawEnStem.length > APP_LIMITS.MAX_STEM_LENGTH) {
      rowErrors.push(
        `English question text exceeds maximum ${APP_LIMITS.MAX_STEM_LENGTH} characters (${rawEnStem.length}).`
      );
    }

    if (rawTaStem.trim().length === 0) {
      rowErrors.push("Tamil question text (ta_stem) cannot be empty.");
    } else if (rawTaStem.length > APP_LIMITS.MAX_STEM_LENGTH) {
      rowErrors.push(
        `Tamil question text exceeds maximum ${APP_LIMITS.MAX_STEM_LENGTH} characters (${rawTaStem.length}).`
      );
    }

    // Validate Options (preserving original source wording)
    const enOptions: { label: "A" | "B" | "C" | "D" | "E"; text: string }[] = [];
    const taOptions: { label: "A" | "B" | "C" | "D" | "E"; text: string }[] = [];

    for (const label of optionLabels) {
      const rawEnVal = row[`en_${label}`] ?? "";
      const rawTaVal = row[`ta_${label}`] ?? "";

      if (rawEnVal.length > APP_LIMITS.MAX_OPTION_LENGTH) {
        rowErrors.push(
          `English option ${label} exceeds maximum ${APP_LIMITS.MAX_OPTION_LENGTH} characters (${rawEnVal.length}).`
        );
      }
      if (rawTaVal.length > APP_LIMITS.MAX_OPTION_LENGTH) {
        rowErrors.push(
          `Tamil option ${label} exceeds maximum ${APP_LIMITS.MAX_OPTION_LENGTH} characters (${rawTaVal.length}).`
        );
      }

      // If text exists, preserve original wording
      if (rawEnVal.trim().length > 0) {
        enOptions.push({ label, text: rawEnVal });
      }
      if (rawTaVal.trim().length > 0) {
        taOptions.push({ label, text: rawTaVal });
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

    // Candidate item for schema validation
    const candidateItem: QuestionItem = {
      id: rawId,
      en: { stem: rawEnStem, options: enOptions },
      ta: { stem: rawTaStem, options: taOptions },
    };

    // Validate candidate item against shared production schema
    const schemaValidation = QuestionItemSchema.safeParse(candidateItem);
    if (!schemaValidation.success) {
      for (const issue of schemaValidation.error.issues) {
        rowErrors.push(`Schema validation: ${issue.path.join(".")}: ${issue.message}`);
      }
    }

    // Preview snippet truncation (first 60 characters)
    const enSnippet = rawEnStem.length > 60 ? rawEnStem.slice(0, 57) + "..." : rawEnStem;
    const taSnippet = rawTaStem.length > 60 ? rawTaStem.slice(0, 57) + "..." : rawTaStem;

    rowPreviews.push({
      rowNumber: rowNum,
      id: rawId || `Row ${rowNum}`,
      enStemSnippet: enSnippet || "(empty)",
      taStemSnippet: taSnippet || "(empty)",
      enOptionCount: enOptions.length,
      taOptionCount: taOptions.length,
      errors: rowErrors,
    });

    if (rowErrors.length === 0 && schemaValidation.success) {
      validItems.push(candidateItem);
    }
  });

  // Check if any row has errors
  const hasRowErrors = rowPreviews.some((r) => r.errors.length > 0);

  // 5. Total payload size check (including full serialized request envelope) using TextEncoder
  if (!hasRowErrors && fileErrors.length === 0 && validItems.length > 0) {
    const sampleEnvelope = {
      requestId: "00000000-0000-0000-0000-000000000000",
      revision: 0,
      locale: "en",
      mode: "ai",
      sourceKind: "synthetic",
      consent: true,
      items: validItems,
    };
    const serializedRequest = JSON.stringify(sampleEnvelope);
    const payloadBytes = new TextEncoder().encode(serializedRequest).length;

    if (payloadBytes > APP_LIMITS.MAX_REQUEST_BYTES) {
      fileErrors.push(
        `Total batch request size (${payloadBytes} bytes with envelope) exceeds the ${APP_LIMITS.MAX_REQUEST_BYTES}-byte analysis limit. Reduce text length or number of items.`
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
