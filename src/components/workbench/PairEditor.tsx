"use client";

import React from "react";
import { QuestionItem } from "../../lib/contracts/types";
import { APP_LIMITS } from "../../lib/contracts/config";
import { Plus, Trash2 } from "lucide-react";

interface PairEditorProps {
  item: QuestionItem;
  onUpdateStem: (lang: "en" | "ta", text: string) => void;
  onUpdateOption: (lang: "en" | "ta", label: "A" | "B" | "C" | "D" | "E", text: string) => void;
  onAddOption: () => void;
  onRemoveOption: (label: "A" | "B" | "C" | "D" | "E") => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const PairEditor: React.FC<PairEditorProps> = ({
  item,
  onUpdateStem,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  t,
}) => {
  const canAddOption = item.en.options.length < APP_LIMITS.MAX_OPTIONS;
  const canRemoveOption = item.en.options.length > APP_LIMITS.MIN_OPTIONS;

  // Collect all unique option labels in order A -> E
  const allLabels: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];
  const presentLabels = allLabels.filter(
    (l) =>
      item.en.options.some((o) => o.label === l) ||
      item.ta.options.some((o) => o.label === l)
  );

  return (
    <div className="bg-white border-[1.5px] border-slate-900 rounded-[6px] p-4 sm:p-5 space-y-4">
      {/* Canvas Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold bg-[#EEF3FF] text-[#1435AD] border border-blue-200 px-2 py-0.5 rounded-[4px] text-xs">
            {item.id}
          </span>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            {t("editor.title")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {canAddOption && (
            <button
              type="button"
              onClick={onAddOption}
              className="h-8 px-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-900 rounded-[6px] shadow-[1.5px_1.5px_0_#0F172A] flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#2154F4]" />
              <span>{t("editor.addOption")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Synchronized Columns Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
        {/* English Column Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2154F4] inline-block" />
            <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              {t("editor.english")}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {item.en.stem.length}/{APP_LIMITS.MAX_STEM_LENGTH}
          </span>
        </div>

        {/* Tamil Column Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#047857] inline-block" />
            <span className="text-xs font-bold text-slate-900 tracking-wide font-tamil">
              {t("editor.tamil")}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {item.ta.stem.length}/{APP_LIMITS.MAX_STEM_LENGTH}
          </span>
        </div>
      </div>

      {/* Row 1: Synchronized Question Stem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* English Stem */}
        <div className="flex flex-col">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            {t("editor.stem")}
          </label>
          <textarea
            value={item.en.stem}
            onChange={(e) => onUpdateStem("en", e.target.value)}
            placeholder="Enter English question stem..."
            maxLength={APP_LIMITS.MAX_STEM_LENGTH}
            rows={3}
            className="w-full flex-1 p-3 text-[15px] leading-[1.55] text-slate-900 border border-slate-300 rounded-[6px] bg-white focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4] resize-y transition-colors"
          />
        </div>

        {/* Tamil Stem */}
        <div className="flex flex-col">
          <label className="block text-[11px] font-bold text-slate-600 mb-1 font-tamil">
            {t("editor.stem")}
          </label>
          <textarea
            value={item.ta.stem}
            onChange={(e) => onUpdateStem("ta", e.target.value)}
            placeholder="தமிழில் கேள்விப் பகுதியை உள்ளிடவும்..."
            maxLength={APP_LIMITS.MAX_STEM_LENGTH}
            rows={3}
            className="w-full flex-1 p-3 font-tamil text-[16px] leading-[1.72] text-slate-900 border border-slate-300 rounded-[6px] bg-white focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4] resize-y transition-colors"
          />
        </div>
      </div>

      {/* Aligned Options Section */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Options (விடைகள்)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {presentLabels.length} options
          </span>
        </div>

        {/* Horizontally aligned row-by-row options */}
        {presentLabels.map((label) => {
          const enOpt = item.en.options.find((o) => o.label === label);
          const taOpt = item.ta.options.find((o) => o.label === label);
          const enText = enOpt ? enOpt.text : "";
          const taText = taOpt ? taOpt.text : "";

          return (
            <div
              key={label}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50/70 p-2 rounded-[6px] border border-slate-200"
            >
              {/* English Option */}
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center font-mono font-bold text-xs bg-slate-900 text-white rounded-[4px] shrink-0">
                  {label}
                </span>
                <input
                  type="text"
                  value={enText}
                  onChange={(e) => onUpdateOption("en", label, e.target.value)}
                  placeholder={`Option ${label} in English`}
                  maxLength={APP_LIMITS.MAX_OPTION_LENGTH}
                  className="flex-1 p-2 text-sm text-slate-900 border border-slate-300 rounded-[4px] bg-white focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4] min-h-[38px] transition-colors"
                />
              </div>

              {/* Tamil Option + Row Delete */}
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center font-mono font-bold text-xs bg-slate-900 text-white rounded-[4px] shrink-0">
                  {label}
                </span>
                <input
                  type="text"
                  value={taText}
                  onChange={(e) => onUpdateOption("ta", label, e.target.value)}
                  placeholder={`விடை ${label} தமிழில்`}
                  maxLength={APP_LIMITS.MAX_OPTION_LENGTH}
                  className="flex-1 p-2 font-tamil text-[15px] leading-[1.72] text-slate-900 border border-slate-300 rounded-[4px] bg-white focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4] min-h-[38px] transition-colors"
                />
                {canRemoveOption && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(label)}
                    title={t("editor.removeOption")}
                    className="min-h-[36px] min-w-[36px] p-2 flex items-center justify-center text-slate-400 hover:text-red-600 rounded-[4px] hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
