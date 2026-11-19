"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  X,
  Undo2,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { CorrectionResponse } from "../../lib/contracts/correction";

interface CorrectionSuggestionProps {
  isLoading: boolean;
  suggestion: CorrectionResponse | null;
  error: string | null;
  appliedOriginalText: string | null;
  onApply: (suggestedText: string) => void;
  onUndo: () => void;
  onReject: () => void;
  onClose: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const CorrectionSuggestion: React.FC<CorrectionSuggestionProps> = ({
  isLoading,
  suggestion,
  error,
  appliedOriginalText,
  onApply,
  onUndo,
  onReject,
  onClose,
  t,
}) => {
  const [userEditedText, setUserEditedText] = useState<string | null>(null);
  const editedText = userEditedText !== null ? userEditedText : suggestion?.suggestedText || "";

  // If loading
  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200 rounded-[6px] flex items-center justify-center gap-2 text-xs font-medium text-[#2154F4]">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>{t("correction.generating")}</span>
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className="mt-3 p-3 bg-red-50/50 border border-red-200 rounded-[6px] space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#DC2626]">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5"
            title={t("correction.close")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // If no suggestion active and not applied
  if (!suggestion && !appliedOriginalText) {
    return null;
  }

  const isTamil = suggestion?.targetLanguage === "ta";

  // If already applied, show clean confirmation bar with Undo option
  if (appliedOriginalText) {
    return (
      <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-300 rounded-[6px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#047857]">
          <Check className="w-4 h-4 shrink-0" />
          <span>{t("correction.applied")}</span>
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="h-7 px-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-[4px] flex items-center gap-1 shadow-sm transition-colors"
          title={t("correction.undo")}
        >
          <Undo2 className="w-3.5 h-3.5 text-slate-600" />
          <span>{t("correction.undo")}</span>
        </button>
      </div>
    );
  }

  if (!suggestion) return null;

  // Handle ambiguous or uncorrectable cases
  if (suggestion.status === "ambiguous_cannot_correct") {
    return (
      <div className="mt-3 p-3 bg-amber-50/50 border border-amber-200 rounded-[6px] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{t("correction.ambiguous")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{suggestion.reason}</p>
      </div>
    );
  }

  // Handle case where text is already accurate
  if (suggestion.status === "no_correction_needed") {
    return (
      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-[6px] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t("correction.noCorrectionNeeded")}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{suggestion.reason}</p>
      </div>
    );
  }

  // Main suggested correction proposal
  return (
    <div className="mt-3 p-3.5 bg-white border-[1.5px] border-slate-900 rounded-[6px] shadow-[2px_2px_0_#0F172A] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2154F4]" />
          <span className="text-[10px] font-mono font-bold tracking-tight text-[#2154F4] uppercase">
            {t("correction.title")}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
          title={t("correction.close")}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Original vs Suggested Text */}
      <div className="space-y-2">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {isTamil ? t("correction.original") : t("correction.originalEn")}:
          </span>
          <div
            className={`text-xs text-slate-600 bg-slate-50 p-2 rounded-[4px] border border-slate-200 leading-relaxed ${
              isTamil ? "font-tamil leading-[1.72]" : ""
            }`}
          >
            {suggestion.originalText}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              {isTamil ? t("correction.suggested") : t("correction.suggestedEn")}:
            </span>
            <span className="text-[10px] text-slate-400 italic">
              {t("correction.editableHint")}
            </span>
          </div>
          <textarea
            value={editedText}
            onChange={(e) => setUserEditedText(e.target.value)}
            rows={2}
            className={`w-full p-2 text-xs text-slate-900 bg-white border border-[#2154F4]/50 focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4] rounded-[4px] outline-none resize-y leading-relaxed ${
              isTamil ? "font-tamil leading-[1.72]" : ""
            }`}
          />
        </div>

        {suggestion.reason && (
          <div className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1">
            <span className="font-semibold text-slate-700 shrink-0">
              {t("correction.reason")}:
            </span>
            <span>{suggestion.reason}</span>
          </div>
        )}
      </div>

      {/* Reviewer Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={onReject}
          className="h-7 px-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[4px] transition-colors"
        >
          {t("correction.reject")}
        </button>

        <button
          type="button"
          onClick={() => onApply(editedText)}
          disabled={!editedText.trim()}
          className="h-7 px-3 text-xs font-bold text-white bg-[#2154F4] hover:bg-[#1D4ED8] border border-slate-900 rounded-[4px] shadow-[1px_1px_0_#0F172A] flex items-center gap-1 transition-all disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{t("correction.apply")}</span>
        </button>
      </div>
    </div>
  );
};
