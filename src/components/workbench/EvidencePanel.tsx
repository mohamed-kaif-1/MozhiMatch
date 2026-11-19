"use client";

import React from "react";
import {
  AnalyzeResponseItem,
  QuestionItem,
  ReviewDecisionType,
  ValidatedComparison,
} from "../../lib/contracts/types";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

interface EvidencePanelProps {
  item: QuestionItem;
  analysisItem: AnalyzeResponseItem | null;
  decisions: Record<string, ReviewDecisionType>;
  onSetDecision: (fieldKey: string, decision: ReviewDecisionType) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function HighlightedText({
  fullText,
  start,
  end,
  isTamil = false,
}: {
  fullText: string;
  start: number;
  end: number;
  isTamil?: boolean;
}) {
  if (start < 0 || end > fullText.length || start >= end) {
    return <span className={isTamil ? "font-tamil" : ""}>{fullText}</span>;
  }

  const before = fullText.slice(0, start);
  const target = fullText.slice(start, end);
  const after = fullText.slice(end);

  return (
    <span className={`leading-relaxed ${isTamil ? "font-tamil" : ""}`}>
      {before}
      <mark className="bg-[#FFE066] text-black px-1 font-semibold border-b-2 border-black">
        {target}
      </mark>
      {after}
    </span>
  );
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  item,
  analysisItem,
  decisions,
  onSetDecision,
  t,
}) => {
  if (!analysisItem) {
    return (
      <div className="paper-panel p-8 text-center text-gray-600 space-y-3">
        <HelpCircle className="w-10 h-10 mx-auto text-gray-400" />
        <h3 className="font-bold text-lg text-black">{t("status.editing")}</h3>
        <p className="text-sm max-w-md mx-auto">{t("editor.empty")}</p>
      </div>
    );
  }

  const getStatusBadge = (status: AnalyzeResponseItem["status"]) => {
    switch (status) {
      case "meaning_changed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE0DB] text-[#8A241A] border border-black font-bold text-xs uppercase tracking-wide">
            <XCircle className="w-4 h-4" />
            {t("status.meaning_changed")}
          </span>
        );
      case "no_issue_found":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D6F3DD] text-[#18552C] border border-black font-bold text-xs uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4" />
            {t("status.no_issue_found")}
          </span>
        );
      case "needs_review":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF0B3] text-[#654800] border border-black font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4" />
            {t("status.needs_review")}
          </span>
        );
    }
  };

  const getRelationBadge = (relation: ValidatedComparison["relation"]) => {
    switch (relation) {
      case "different":
        return (
          <span className="px-2 py-0.5 bg-[#FFE0DB] text-[#8A241A] border border-black text-xs font-bold">
            DIFFERENT
          </span>
        );
      case "equivalent":
        return (
          <span className="px-2 py-0.5 bg-[#D6F3DD] text-[#18552C] border border-black text-xs font-bold">
            EQUIVALENT
          </span>
        );
      case "uncertain":
      default:
        return (
          <span className="px-2 py-0.5 bg-[#FFF0B3] text-[#654800] border border-black text-xs font-bold">
            UNCERTAIN
          </span>
        );
    }
  };

  const getFieldTextForComp = (kind: "stem" | "option", label: string | null, lang: "en" | "ta") => {
    if (kind === "stem") return item[lang].stem;
    const opt = item[lang].options.find((o) => o.label === label);
    return opt ? opt.text : "";
  };

  return (
    <div className="space-y-6">
      {/* Item Summary Header */}
      <div className="paper-panel p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold bg-[#FFE066] px-2.5 py-1 border border-black text-sm">
            {item.id}
          </span>
          <h3 className="text-lg font-bold">Evaluation Findings</h3>
        </div>
        <div>{getStatusBadge(analysisItem.status)}</div>
      </div>

      {/* Structural Findings Alerts */}
      {analysisItem.structuralFindings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Structural & Format Differences ({analysisItem.structuralFindings.length})
          </h4>
          {analysisItem.structuralFindings.map((finding, idx) => (
            <div
              key={idx}
              className="paper-panel p-4 border-2 border-black bg-[#FFF0B3] text-[#654800] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs uppercase bg-black text-white px-2 py-0.5">
                  {finding.code}
                </span>
                <span className="text-xs font-semibold">
                  Field: {finding.field.kind} {finding.field.label ? `(${finding.field.label})` : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
                <div>
                  <span className="font-bold block text-gray-800">English tokens:</span>
                  {finding.enTokens.length > 0 ? finding.enTokens.join(", ") : "—"}
                </div>
                <div>
                  <span className="font-bold block text-gray-800">Tamil tokens:</span>
                  {finding.taTokens.length > 0 ? finding.taTokens.join(", ") : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Semantic Comparisons List */}
      {analysisItem.comparisons.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-700">
            Semantic Comparisons ({analysisItem.comparisons.length})
          </h4>

          {analysisItem.comparisons.map((comp, idx) => {
            const fieldKey = comp.field.kind === "stem" ? "stem" : `option:${comp.field.label}`;
            const currentDecision = decisions[fieldKey];
            const enFull = getFieldTextForComp(comp.field.kind, comp.field.label, "en");
            const taFull = getFieldTextForComp(comp.field.kind, comp.field.label, "ta");

            return (
              <div
                key={idx}
                className={`paper-panel p-5 space-y-4 transition-all ${
                  comp.relation === "different"
                    ? "border-l-8 border-l-[#8A241A]"
                    : comp.relation === "uncertain"
                    ? "border-l-8 border-l-[#654800]"
                    : "border-l-4 border-l-[#18552C]"
                }`}
              >
                {/* Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm bg-black text-white px-2 py-0.5">
                      {comp.field.kind === "stem"
                        ? "Stem (Question)"
                        : `Option ${comp.field.label}`}
                    </span>
                    {getRelationBadge(comp.relation)}
                    <span className="text-xs font-mono bg-gray-100 border px-1.5 py-0.5">
                      {comp.reasonCode}
                    </span>
                  </div>

                  {/* Reviewer Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "keep")}
                      className={`text-xs px-2.5 py-1 border-2 border-black font-semibold transition-all ${
                        currentDecision === "keep"
                          ? "bg-[#D6F3DD] text-[#18552C] font-bold shadow-[2px_2px_0_#000]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {t("actions.keep")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "fix")}
                      className={`text-xs px-2.5 py-1 border-2 border-black font-semibold transition-all ${
                        currentDecision === "fix"
                          ? "bg-[#FFE0DB] text-[#8A241A] font-bold shadow-[2px_2px_0_#000]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {t("actions.fix")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "escalate")}
                      className={`text-xs px-2.5 py-1 border-2 border-black font-semibold transition-all ${
                        currentDecision === "escalate"
                          ? "bg-[#FFF0B3] text-[#654800] font-bold shadow-[2px_2px_0_#000]"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {t("actions.escalate")}
                    </button>
                  </div>
                </div>

                {/* Evidence In Context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-[#FFFDF5] p-3 border">
                  <div>
                    <span className="text-xs font-bold text-gray-500 block mb-1">
                      English Source with Evidence:
                    </span>
                    <HighlightedText
                      fullText={enFull}
                      start={comp.en.start}
                      end={comp.en.end}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 block mb-1 font-tamil">
                      தமிழ் மூலம் (Evidence in Tamil):
                    </span>
                    <HighlightedText
                      fullText={taFull}
                      start={comp.ta.start}
                      end={comp.ta.end}
                      isTamil
                    />
                  </div>
                </div>

                {/* Model Explanation */}
                <div className="text-xs text-gray-700 bg-gray-50 p-2.5 border">
                  <span className="font-bold block text-gray-900 mb-0.5">Explanation:</span>
                  <p>{comp.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
