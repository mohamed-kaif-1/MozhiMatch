"use client";

import React from "react";
import {
  AnalyzeResponseItem,
  QuestionItem,
  ReviewDecisionType,
  ValidatedComparison,
} from "../../lib/contracts/types";
import { CorrectionResponse } from "../../lib/contracts/correction";
import { CorrectionSuggestion } from "./CorrectionSuggestion";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Sparkles } from "lucide-react";

export interface CorrectionFieldState {
  isLoading: boolean;
  suggestion: CorrectionResponse | null;
  error: string | null;
  appliedOriginalText: string | null;
  appliedSuggestedText?: string;
}

interface EvidencePanelProps {
  item: QuestionItem;
  analysisItem: AnalyzeResponseItem | null;
  decisions: Record<string, ReviewDecisionType>;
  onSetDecision: (fieldKey: string, decision: ReviewDecisionType) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isStale?: boolean;
  correctionState?: Record<string, CorrectionFieldState>;
  onSuggestCorrection?: (fieldKey: string, comp: ValidatedComparison) => void;
  onApplyCorrection?: (fieldKey: string, text: string) => void;
  onUndoCorrection?: (fieldKey: string) => void;
  onRejectCorrection?: (fieldKey: string) => void;
  onCloseCorrection?: (fieldKey: string) => void;
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
    return <span className={isTamil ? "font-tamil leading-[1.72]" : "leading-relaxed"}>{fullText}</span>;
  }

  const before = fullText.slice(0, start);
  const target = fullText.slice(start, end);
  const after = fullText.slice(end);

  return (
    <span className={isTamil ? "font-tamil leading-[1.72]" : "leading-relaxed"}>
      {before}
      <mark className="bg-[#FEF08A] text-slate-900 px-1 py-0.5 rounded-[2px] font-semibold">
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
  isStale = false,
  correctionState = {},
  onSuggestCorrection,
  onApplyCorrection,
  onUndoCorrection,
  onRejectCorrection,
  onCloseCorrection,
}) => {
  if (!analysisItem) {
    return (
      <div className="bg-[#F8FAFC] border-[1.5px] border-slate-900 rounded-[6px] p-6 text-center text-slate-500 space-y-2.5">
        <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
        <h3 className="font-bold text-sm text-slate-800">{t("status.editing")}</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">{t("editor.empty")}</p>
      </div>
    );
  }

  const getStatusBadge = (status: AnalyzeResponseItem["status"]) => {
    switch (status) {
      case "meaning_changed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF2F2] text-[#DC2626] border border-red-200 font-mono font-bold text-[11px] rounded-[4px] uppercase tracking-tight">
            <XCircle className="w-3.5 h-3.5" />
            {t("status.meaning_changed")}
          </span>
        );
      case "no_issue_found":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#ECFDF5] text-[#047857] border border-emerald-200 font-mono font-bold text-[11px] rounded-[4px] uppercase tracking-tight">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t("status.no_issue_found")}
          </span>
        );
      case "needs_review":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFBEB] text-[#B45309] border border-amber-200 font-mono font-bold text-[11px] rounded-[4px] uppercase tracking-tight">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t("status.needs_review")}
          </span>
        );
    }
  };

  const getRelationBadge = (relation: ValidatedComparison["relation"]) => {
    switch (relation) {
      case "different":
        return (
          <span className="px-1.5 py-0.5 bg-[#FEF2F2] text-[#DC2626] border border-red-200 rounded-[4px] text-[10px] font-mono font-bold uppercase">
            DIFFERENT
          </span>
        );
      case "equivalent":
        return (
          <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#047857] border border-emerald-200 rounded-[4px] text-[10px] font-mono font-bold uppercase">
            EQUIVALENT
          </span>
        );
      case "uncertain":
      default:
        return (
          <span className="px-1.5 py-0.5 bg-[#FFFBEB] text-[#B45309] border border-amber-200 rounded-[4px] text-[10px] font-mono font-bold uppercase">
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
    <div className="bg-[#F8FAFC] border-[1.5px] border-slate-900 rounded-[6px] p-3 sm:p-4 space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto rail-scroll">
      {/* Findings Header */}
      <div className="bg-white border border-slate-200 rounded-[6px] p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold bg-[#EEF3FF] text-[#1435AD] border border-blue-200 px-2 py-0.5 rounded-[4px] text-xs">
            {item.id}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">Findings & Evidence</h3>
        </div>
        <div>{getStatusBadge(analysisItem.status)}</div>
      </div>

      {/* Stale / Draft Notice if edited since analysis */}
      {isStale && (
        <div className="bg-[#FFFBEB] border border-amber-200 rounded-[6px] p-2.5 text-[#B45309] text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
          <span className="font-medium leading-relaxed">{t("status.stale")}</span>
        </div>
      )}

      {/* Structural Differences Alerts */}
      {analysisItem.structuralFindings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Structural Differences ({analysisItem.structuralFindings.length})
            </span>
          </div>
          {analysisItem.structuralFindings.map((finding, idx) => (
            <div
              key={idx}
              className="bg-[#FFFBEB] border border-amber-200 rounded-[6px] p-3 text-[#B45309] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[10px] uppercase bg-slate-900 text-white px-1.5 py-0.5 rounded-[3px]">
                  {finding.code}
                </span>
                <span className="text-[11px] font-medium text-slate-700">
                  Field: <strong>{finding.field.kind} {finding.field.label ? `(${finding.field.label})` : ""}</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-800">
                <div className="bg-white/80 p-1.5 rounded-[4px] border border-amber-100">
                  <span className="font-bold text-[10px] uppercase text-slate-500 block">English:</span>
                  {finding.enTokens.length > 0 ? finding.enTokens.join(", ") : "—"}
                </div>
                <div className="bg-white/80 p-1.5 rounded-[4px] border border-amber-100 font-tamil">
                  <span className="font-bold text-[10px] uppercase text-slate-500 block font-sans">Tamil:</span>
                  {finding.taTokens.length > 0 ? finding.taTokens.join(", ") : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules-Only / Pending Semantic Review Banner */}
      {analysisItem.comparisons.length === 0 && (
        <div className="bg-[#FFFBEB] border border-amber-200 rounded-[6px] p-3 text-[#B45309] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
            <h4 className="font-bold text-xs">
              {analysisItem.structuralFindings.length === 0
                ? t("review.noFindings")
                : t("status.needs_review")}
            </h4>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-700">
            {analysisItem.structuralFindings.length === 0
              ? t("review.noFindings")
              : t("review.bounded")}
          </p>
        </div>
      )}

      {/* Manual Field Review Rows when no semantic comparisons exist */}
      {analysisItem.comparisons.length === 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Manual Field Decisions
            </span>
          </div>

          {/* Stem row */}
          <div className="bg-white border border-slate-200 rounded-[6px] p-3 space-y-2 border-l-[3.5px] border-l-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
              <span className="font-mono font-bold text-xs text-slate-900">
                Stem (Question)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSetDecision("stem", "keep")}
                  className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                    decisions["stem"] === "keep"
                      ? "bg-[#ECFDF5] text-[#047857] border-emerald-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t("actions.keep")}
                </button>
                <button
                  type="button"
                  onClick={() => onSetDecision("stem", "fix")}
                  className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                    decisions["stem"] === "fix"
                      ? "bg-[#FEF2F2] text-[#DC2626] border-red-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t("actions.fix")}
                </button>
                <button
                  type="button"
                  onClick={() => onSetDecision("stem", "escalate")}
                  className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                    decisions["stem"] === "escalate"
                      ? "bg-[#FFFBEB] text-[#B45309] border-amber-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t("actions.escalate")}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs bg-slate-50 p-2 rounded-[4px] border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">EN:</span>
                <p className="text-slate-800 text-[12px] leading-snug">{item.en.stem}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">TA:</span>
                <p className="font-tamil text-slate-800 text-[13px] leading-[1.72]">{item.ta.stem}</p>
              </div>
            </div>
          </div>

          {/* Option rows */}
          {item.en.options.map((opt) => {
            const fieldKey = `option:${opt.label}`;
            const taOpt = item.ta.options.find((o) => o.label === opt.label);
            return (
              <div key={opt.label} className="bg-white border border-slate-200 rounded-[6px] p-3 space-y-2 border-l-[3.5px] border-l-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    Option {opt.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "keep")}
                      className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                        decisions[fieldKey] === "keep"
                          ? "bg-[#ECFDF5] text-[#047857] border-emerald-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("actions.keep")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "fix")}
                      className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                        decisions[fieldKey] === "fix"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-red-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("actions.fix")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "escalate")}
                      className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                        decisions[fieldKey] === "escalate"
                          ? "bg-[#FFFBEB] text-[#B45309] border-amber-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("actions.escalate")}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-[4px] border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">EN:</span>
                    <p className="text-slate-800 text-[12px] leading-snug">{opt.text}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">TA:</span>
                    <p className="font-tamil text-slate-800 text-[13px] leading-[1.72]">{taOpt ? taOpt.text : "—"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Semantic Comparisons List */}
      {analysisItem.comparisons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Semantic Comparisons ({analysisItem.comparisons.length})
            </span>
          </div>

          {analysisItem.comparisons.map((comp, idx) => {
            const fieldKey = comp.field.kind === "stem" ? "stem" : `option:${comp.field.label}`;
            const currentDecision = decisions[fieldKey];
            const enFull = getFieldTextForComp(comp.field.kind, comp.field.label, "en");
            const taFull = getFieldTextForComp(comp.field.kind, comp.field.label, "ta");

            const borderAccent =
              comp.relation === "different"
                ? "border-l-[#DC2626]"
                : comp.relation === "uncertain"
                ? "border-l-[#B45309]"
                : "border-l-[#047857]";

            return (
              <div
                key={idx}
                className={`bg-white border border-slate-200 rounded-[6px] p-3.5 space-y-3 border-l-[4px] ${borderAccent}`}
              >
                {/* Header & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {comp.field.kind === "stem"
                        ? "Stem"
                        : `Option ${comp.field.label}`}
                    </span>
                    {getRelationBadge(comp.relation)}
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-[4px] border border-slate-200">
                      {t(`reason.${comp.reasonCode}` as any) || comp.reasonCode.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Reviewer Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "keep")}
                      className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                        currentDecision === "keep"
                          ? "bg-[#ECFDF5] text-[#047857] border-emerald-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("actions.keep")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "fix")}
                      className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                        currentDecision === "fix"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-red-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("actions.fix")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetDecision(fieldKey, "escalate")}
                      className={`text-[11px] px-2 py-1 rounded-[4px] border font-bold transition-all ${
                        currentDecision === "escalate"
                          ? "bg-[#FFFBEB] text-[#B45309] border-amber-300"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t("actions.escalate")}
                    </button>
                  </div>
                </div>

                {/* Evidence In Context */}
                <div className="space-y-2 text-xs bg-slate-50 p-2.5 rounded-[4px] border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                      English Source with Evidence:
                    </span>
                    <HighlightedText
                      fullText={enFull}
                      start={comp.en.start}
                      end={comp.en.end}
                    />
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5 font-sans">
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
                <div className="text-xs text-slate-700 bg-blue-50/50 p-2 rounded-[4px] border border-blue-100">
                  <span className="font-bold text-slate-900 block text-[11px] mb-0.5">Explanation:</span>
                  <p className="leading-relaxed">{comp.explanation}</p>
                </div>

                {/* AI Correction Proposal Section (only for non-equivalent findings) */}
                {(comp.relation === "different" || comp.relation === "uncertain") && onSuggestCorrection && (
                  <div className="pt-0.5">
                    {!correctionState[fieldKey]?.suggestion &&
                      !correctionState[fieldKey]?.isLoading &&
                      !correctionState[fieldKey]?.appliedOriginalText &&
                      !correctionState[fieldKey]?.error && (
                        <button
                          type="button"
                          onClick={() => onSuggestCorrection(fieldKey, comp)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#2154F4] bg-[#EEF3FF] hover:bg-[#E0EAFF] border border-[#2154F4]/30 rounded-[4px] transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#2154F4]" />
                          <span>{t("correction.suggest")}</span>
                        </button>
                      )}

                    {correctionState[fieldKey] && (
                      <CorrectionSuggestion
                        isLoading={correctionState[fieldKey].isLoading}
                        suggestion={correctionState[fieldKey].suggestion}
                        error={correctionState[fieldKey].error}
                        appliedOriginalText={correctionState[fieldKey].appliedOriginalText}
                        onApply={(text) => onApplyCorrection?.(fieldKey, text)}
                        onUndo={() => onUndoCorrection?.(fieldKey)}
                        onReject={() => onRejectCorrection?.(fieldKey)}
                        onClose={() => onCloseCorrection?.(fieldKey)}
                        t={t}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
