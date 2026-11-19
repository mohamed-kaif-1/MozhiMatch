import Papa from "papaparse";
import {
  QuestionItem,
  AnalyzeResponse,
  ReviewDecisionType,
} from "../contracts/types";

export const EXPORT_CSV_COLUMNS = [
  "item_id",
  "item_status",
  "analysis_mode",
  "provider_status",
  "model",
  "field_kind",
  "option_label",
  "finding_type",
  "reason_code",
  "en_source",
  "ta_source",
  "en_quote",
  "ta_quote",
  "explanation",
  "reviewer_decision",
  "analyzed_at",
] as const;

export type ExportCsvColumn = (typeof EXPORT_CSV_COLUMNS)[number];

export interface ExportCsvRow {
  item_id: string;
  item_status: string;
  analysis_mode: string;
  provider_status: string;
  model: string;
  field_kind: "stem" | "option";
  option_label: string;
  finding_type: "structural" | "semantic" | "none";
  reason_code: string;
  en_source: string;
  ta_source: string;
  en_quote: string;
  ta_quote: string;
  explanation: string;
  reviewer_decision: string;
  analyzed_at: string;
}

/**
 * Formula injection protection:
 * If a cell string begins with dangerous prefix characters (=, +, -, @, \t, \r),
 * prepend a single quote (') so spreadsheet applications (Excel, LibreOffice) treat it as pure text.
 * Applied ONLY to the export representation without mutating original text.
 */
export function sanitizeCellForSpreadsheet(val: string): string {
  if (typeof val !== "string" || val.length === 0) return "";
  const firstChar = val.charAt(0);
  if (
    firstChar === "=" ||
    firstChar === "+" ||
    firstChar === "-" ||
    firstChar === "@" ||
    firstChar === "\t" ||
    firstChar === "\r"
  ) {
    return `'${val}`;
  }
  return val;
}

/**
 * Generates an RFC 4180 CSV export report with UTF-8 BOM, formula protection, and complete findings.
 */
export function generateReviewCsv(
  items: QuestionItem[],
  analysisResponse: AnalyzeResponse | null,
  decisions: Record<string, Record<string, ReviewDecisionType>>,
  analyzedAt: string | null
): string {
  const rows: ExportCsvRow[] = [];

  for (const item of items) {
    const analysisItem = analysisResponse?.items.find((i) => i.id === item.id) || null;
    const itemDecisions = decisions[item.id] || {};
    const itemStatus = analysisItem ? analysisItem.status : "not_analyzed";
    const mode = analysisResponse ? analysisResponse.mode : "not_analyzed";
    const providerStatus = analysisResponse ? analysisResponse.providerStatus : "";
    const model = analysisResponse?.model || "";
    const timestamp = analyzedAt || "";

    const semanticCompleted = Boolean(
      analysisResponse &&
      analysisResponse.mode === "live_ai" &&
      analysisResponse.providerStatus === "ok" &&
      analysisItem &&
      (analysisItem.comparisons.length > 0 || analysisItem.status === "no_issue_found")
    );

    const emittedFields = new Set<string>();

    // Helper to get field source text
    const getSourceText = (kind: "stem" | "option", label: string | null, lang: "en" | "ta") => {
      if (kind === "stem") return item[lang].stem;
      const opt = item[lang].options.find((o) => o.label === label);
      return opt ? opt.text : "";
    };

    // 1. Structural findings
    if (analysisItem && analysisItem.structuralFindings.length > 0) {
      for (const finding of analysisItem.structuralFindings) {
        const fieldKind = finding.field.kind;
        const optionLabel = finding.field.label || "";
        const fieldKey = fieldKind === "stem" ? "stem" : `option:${optionLabel}`;
        const decision = itemDecisions[fieldKey] || "pending";
        emittedFields.add(fieldKey);

        const explanation = semanticCompleted
          ? `Structural difference: ${finding.code}`
          : `Structural difference: ${finding.code}. Semantic review was not completed.`;

        rows.push({
          item_id: item.id,
          item_status: itemStatus,
          analysis_mode: mode,
          provider_status: providerStatus,
          model,
          field_kind: fieldKind,
          option_label: optionLabel,
          finding_type: "structural",
          reason_code: finding.code,
          en_source: getSourceText(fieldKind, optionLabel || null, "en"),
          ta_source: getSourceText(fieldKind, optionLabel || null, "ta"),
          en_quote: finding.enTokens.join(", "),
          ta_quote: finding.taTokens.join(", "),
          explanation,
          reviewer_decision: decision,
          analyzed_at: timestamp,
        });
      }
    }

    // 2. Semantic comparisons
    if (analysisItem && analysisItem.comparisons.length > 0) {
      for (const comp of analysisItem.comparisons) {
        const fieldKind = comp.field.kind;
        const optionLabel = comp.field.label || "";
        const fieldKey = fieldKind === "stem" ? "stem" : `option:${optionLabel}`;
        const decision = itemDecisions[fieldKey] || "pending";
        emittedFields.add(fieldKey);

        rows.push({
          item_id: item.id,
          item_status: itemStatus,
          analysis_mode: mode,
          provider_status: providerStatus,
          model,
          field_kind: fieldKind,
          option_label: optionLabel,
          finding_type: "semantic",
          reason_code: comp.reasonCode,
          en_source: getSourceText(fieldKind, optionLabel || null, "en"),
          ta_source: getSourceText(fieldKind, optionLabel || null, "ta"),
          en_quote: comp.en.text,
          ta_quote: comp.ta.text,
          explanation: comp.explanation,
          reviewer_decision: decision,
          analyzed_at: timestamp,
        });
      }
    }

    // 3. Export all recorded field decisions that have not yet been emitted
    for (const [fieldKey, decision] of Object.entries(itemDecisions)) {
      if (emittedFields.has(fieldKey)) continue;

      const isStem = fieldKey === "stem";
      const fieldKind: "stem" | "option" = isStem ? "stem" : "option";
      const optionLabel = isStem ? "" : fieldKey.replace(/^option:/, "");
      emittedFields.add(fieldKey);

      const explanation = semanticCompleted
        ? "No structural or semantic discrepancies flagged."
        : analysisItem
          ? "Semantic review was not completed."
          : "Question has not been analyzed yet.";

      rows.push({
        item_id: item.id,
        item_status: itemStatus,
        analysis_mode: mode,
        provider_status: providerStatus,
        model,
        field_kind: fieldKind,
        option_label: optionLabel,
        finding_type: "none",
        reason_code: analysisItem ? "none" : "not_analyzed",
        en_source: getSourceText(fieldKind, optionLabel || null, "en"),
        ta_source: getSourceText(fieldKind, optionLabel || null, "ta"),
        en_quote: "",
        ta_quote: "",
        explanation,
        reviewer_decision: decision || "pending",
        analyzed_at: timestamp,
      });
    }

    // 4. If no findings and no decisions exist, emit a summary row so no question disappears
    if (emittedFields.size === 0) {
      const decision = itemDecisions["stem"] || "pending";
      const explanation = !analysisItem
        ? "Question has not been analyzed yet."
        : semanticCompleted
          ? "No structural or semantic discrepancies flagged."
          : "Semantic review was not completed. No structural discrepancies flagged.";

      rows.push({
        item_id: item.id,
        item_status: itemStatus,
        analysis_mode: mode,
        provider_status: providerStatus,
        model,
        field_kind: "stem",
        option_label: "",
        finding_type: "none",
        reason_code: analysisItem ? "none" : "not_analyzed",
        en_source: item.en.stem,
        ta_source: item.ta.stem,
        en_quote: "",
        ta_quote: "",
        explanation,
        reviewer_decision: decision,
        analyzed_at: timestamp,
      });
    }
  }

  // Sanitize each field against formula injection and format as CSV
  const sanitizedRows = rows.map((row) => {
    const sanitizedObj: Record<string, string> = {};
    for (const col of EXPORT_CSV_COLUMNS) {
      sanitizedObj[col] = sanitizeCellForSpreadsheet(String(row[col] ?? ""));
    }
    return sanitizedObj;
  });

  const csvBody = Papa.unparse(sanitizedRows, {
    columns: [...EXPORT_CSV_COLUMNS],
    quotes: true,
    newline: "\r\n", // Standard Windows/Excel CRLF
  });

  // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
  return `\uFEFF${csvBody}\r\n`;
}
