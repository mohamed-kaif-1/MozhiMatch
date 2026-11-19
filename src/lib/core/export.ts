import {
  QuestionItem,
  AnalyzeResponse,
  ReviewDecisionType,
} from "../contracts/types";

export function formatReviewSummary(
  items: QuestionItem[],
  analysisResponse: AnalyzeResponse | null,
  decisions: Record<string, Record<string, ReviewDecisionType>>
): string {
  const lines: string[] = [];
  lines.push("==================================================");
  lines.push("           MOZHIMATCH MCQ PREFLIGHT REVIEW        ");
  lines.push("==================================================");
  lines.push(`Generated: ${new Date().toISOString()}`);
  if (analysisResponse) {
    lines.push(`Mode: ${analysisResponse.mode} | Provider: ${analysisResponse.providerStatus}`);
    if (analysisResponse.model) lines.push(`Model: ${analysisResponse.model}`);
    if (analysisResponse.warnings.length > 0) {
      lines.push(`Warnings: ${analysisResponse.warnings.join(", ")}`);
    }
  } else {
    lines.push("Mode: Unanalyzed (Draft)");
  }
  lines.push("");

  for (const item of items) {
    const analysisItem = analysisResponse?.items.find((i) => i.id === item.id);
    const itemDecisions = decisions[item.id] || {};
    const status = analysisItem ? analysisItem.status.toUpperCase() : "NOT RUN";

    lines.push(`--------------------------------------------------`);
    lines.push(`ITEM ID: ${item.id} | STATUS: ${status}`);
    lines.push(`--------------------------------------------------`);
    lines.push(`[EN STEM]: ${item.en.stem}`);
    lines.push(`[TA STEM]: ${item.ta.stem}`);
    lines.push("");

    // Structural findings
    if (analysisItem && analysisItem.structuralFindings.length > 0) {
      lines.push("  [STRUCTURAL DIFFERENCES]:");
      for (const finding of analysisItem.structuralFindings) {
        const fieldStr = `${finding.field.kind}${finding.field.label ? `:${finding.field.label}` : ""}`;
        lines.push(`  - ${finding.code} on ${fieldStr}`);
        if (finding.enTokens.length > 0) lines.push(`    EN: ${finding.enTokens.join(", ")}`);
        if (finding.taTokens.length > 0) lines.push(`    TA: ${finding.taTokens.join(", ")}`);
      }
      lines.push("");
    }

    // Semantic comparisons & reviewer decisions
    if (analysisItem && analysisItem.comparisons.length > 0) {
      lines.push("  [COMPARISONS & DECISIONS]:");
      for (const comp of analysisItem.comparisons) {
        const fieldKey = comp.field.kind === "stem" ? "stem" : `option:${comp.field.label}`;
        const dec = itemDecisions[fieldKey] ? itemDecisions[fieldKey].toUpperCase() : "PENDING";
        const fieldName = comp.field.kind === "stem" ? "STEM" : `OPTION ${comp.field.label}`;

        lines.push(`  - ${fieldName}: [${comp.relation.toUpperCase()}] (${comp.reasonCode})`);
        lines.push(`    EN Quote: "${comp.en.text}"`);
        lines.push(`    TA Quote: "${comp.ta.text}"`);
        lines.push(`    Explanation: ${comp.explanation}`);
        lines.push(`    Reviewer Decision: ${dec}`);
        lines.push("");
      }
    } else {
      // Just list options if no comparisons
      lines.push("  [OPTIONS]:");
      for (const opt of item.en.options) {
        const taOpt = item.ta.options.find((o) => o.label === opt.label);
        const dec = itemDecisions[`option:${opt.label}`]
          ? itemDecisions[`option:${opt.label}`].toUpperCase()
          : "PENDING";
        lines.push(`  - Option ${opt.label}:`);
        lines.push(`    EN: ${opt.text}`);
        lines.push(`    TA: ${taOpt ? taOpt.text : "MISSING"}`);
        lines.push(`    Reviewer Decision: ${dec}`);
      }
      lines.push("");
    }
  }

  lines.push("==================================================");
  lines.push("End of Review Summary");
  lines.push("==================================================");

  return lines.join("\n");
}

