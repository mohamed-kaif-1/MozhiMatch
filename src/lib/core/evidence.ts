import {
  QuestionItem,
  ProviderResultItem,
  ProviderComparison,
  ValidatedComparison,
  ItemReviewStatus,
  StructuralFinding,
} from "../contracts/types";

// Check if a Unicode character code point is a Tamil combining mark / vowel sign
export function isTamilCombiningMark(code: number): boolean {
  return (
    (code >= 0x0b82 && code <= 0x0b83) || // Anusvara, Visarga
    (code >= 0x0bbe && code <= 0x0bcd) || // Vowel signs and Virama (pulli)
    code === 0x0bd7                       // Length mark
  );
}

export interface QuoteValidationResult {
  valid: boolean;
  start?: number;
  end?: number;
  reason?: string;
}

export function validateQuoteInField(
  sourceText: string,
  quote: string
): QuoteValidationResult {
  if (!quote || quote.length === 0) {
    return { valid: false, reason: "Quote is empty" };
  }

  // Exact whole field match
  if (sourceText === quote) {
    return { valid: true, start: 0, end: quote.length };
  }

  const firstIndex = sourceText.indexOf(quote);
  if (firstIndex === -1) {
    return { valid: false, reason: "Quote not found in field text" };
  }

  // Require unique occurrence in the field to avoid ambiguous highlights
  const secondIndex = sourceText.indexOf(quote, firstIndex + 1);
  if (secondIndex !== -1) {
    return {
      valid: false,
      reason: "Quote occurs multiple times in field; ambiguous citation",
    };
  }

  const start = firstIndex;
  const end = start + quote.length;

  // Verify slice matches exactly (UTF-16 code units)
  if (sourceText.slice(start, end) !== quote) {
    return { valid: false, reason: "Quote slice mismatch" };
  }

  // Grapheme split check: start index must not be a combining mark
  const startCode = sourceText.charCodeAt(start);
  if (isTamilCombiningMark(startCode)) {
    return { valid: false, reason: "Quote starts with a combining mark" };
  }

  // Grapheme split check: character immediately after end must not be a combining mark
  if (end < sourceText.length) {
    const nextCode = sourceText.charCodeAt(end);
    if (isTamilCombiningMark(nextCode)) {
      return { valid: false, reason: "Quote cuts across a combining mark" };
    }
  }

  return { valid: true, start, end };
}

export function getFieldText(item: QuestionItem, lang: "en" | "ta", kind: "stem" | "option", label: string | null): string | null {
  if (kind === "stem") {
    return item[lang].stem;
  }
  if (kind === "option" && label) {
    const opt = item[lang].options.find((o) => o.label === label);
    return opt ? opt.text : null;
  }
  return null;
}

export interface ItemEvidenceValidationResult {
  valid: boolean;
  status: ItemReviewStatus;
  comparisons: ValidatedComparison[];
  errorReason?: string;
}

export function validateItemComparisons(
  item: QuestionItem,
  providerItem: ProviderResultItem,
  structuralFindings: StructuralFinding[]
): ItemEvidenceValidationResult {
  const enOptions = item.en.options;
  const taOptions = item.ta.options;

  // Expected field keys: stem (null) + all option labels
  const expectedLabels = new Set(enOptions.map((o) => o.label));
  const seenFields = new Set<string>();

  // Expected comparison count: 1 (stem) + option count
  const expectedCount = 1 + enOptions.length;
  if (providerItem.comparisons.length !== expectedCount) {
    return {
      valid: false,
      status: "needs_review",
      comparisons: [],
      errorReason: `Expected ${expectedCount} comparisons, received ${providerItem.comparisons.length}`,
    };
  }

  const validatedComparisons: ValidatedComparison[] = [];

  for (const comp of providerItem.comparisons) {
    const { field, relation, enQuote, taQuote, reasonCode, explanation } = comp;
    const fieldKey = field.kind === "stem" ? "stem" : `option:${field.label}`;

    if (seenFields.has(fieldKey)) {
      return {
        valid: false,
        status: "needs_review",
        comparisons: [],
        errorReason: `Duplicate comparison for field ${fieldKey}`,
      };
    }
    seenFields.add(fieldKey);

    if (field.kind === "stem") {
      if (field.label !== null) {
        return {
          valid: false,
          status: "needs_review",
          comparisons: [],
          errorReason: "Stem field label must be null",
        };
      }
    } else {
      if (!field.label || !expectedLabels.has(field.label)) {
        return {
          valid: false,
          status: "needs_review",
          comparisons: [],
          errorReason: `Unknown or unmapped option label: ${field.label}`,
        };
      }
    }

    const enText = getFieldText(item, "en", field.kind, field.label);
    const taText = getFieldText(item, "ta", field.kind, field.label);

    if (enText === null || taText === null) {
      return {
        valid: false,
        status: "needs_review",
        comparisons: [],
        errorReason: `Field text missing for ${fieldKey}`,
      };
    }

    const enVal = validateQuoteInField(enText, enQuote);
    if (!enVal.valid || enVal.start === undefined || enVal.end === undefined) {
      return {
        valid: false,
        status: "needs_review",
        comparisons: [],
        errorReason: `Invalid English quote in ${fieldKey}: ${enVal.reason}`,
      };
    }

    const taVal = validateQuoteInField(taText, taQuote);
    if (!taVal.valid || taVal.start === undefined || taVal.end === undefined) {
      return {
        valid: false,
        status: "needs_review",
        comparisons: [],
        errorReason: `Invalid Tamil quote in ${fieldKey}: ${taVal.reason}`,
      };
    }

    validatedComparisons.push({
      field,
      relation,
      en: {
        start: enVal.start,
        end: enVal.end,
        text: enQuote,
      },
      ta: {
        start: taVal.start,
        end: taVal.end,
        text: taQuote,
      },
      reasonCode,
      explanation,
      evidenceValid: true,
    });
  }

  // Coverage check: make sure stem and all options were seen
  if (!seenFields.has("stem")) {
    return {
      valid: false,
      status: "needs_review",
      comparisons: [],
      errorReason: "Missing stem comparison",
    };
  }

  for (const opt of enOptions) {
    if (!seenFields.has(`option:${opt.label}`)) {
      return {
        valid: false,
        status: "needs_review",
        comparisons: [],
        errorReason: `Missing comparison for option ${opt.label}`,
      };
    }
  }

  // Derive status
  const hasDifferent = validatedComparisons.some((c) => c.relation === "different");
  const hasUncertain = validatedComparisons.some((c) => c.relation === "uncertain");
  const hasStructuralIssue = structuralFindings.length > 0;

  let finalStatus: ItemReviewStatus;
  if (hasDifferent) {
    finalStatus = "meaning_changed";
  } else if (hasUncertain || hasStructuralIssue) {
    finalStatus = "needs_review";
  } else {
    finalStatus = "no_issue_found";
  }

  return {
    valid: true,
    status: finalStatus,
    comparisons: validatedComparisons,
  };
}
