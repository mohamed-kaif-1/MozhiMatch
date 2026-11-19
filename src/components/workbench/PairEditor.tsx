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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono font-bold bg-[#FFE066] px-2 py-0.5 border border-black text-sm">
            {item.id}
          </span>
          <h2 className="text-xl font-bold tracking-tight">{t("editor.title")}</h2>
        </div>
        <div className="flex items-center gap-2">
          {canAddOption && (
            <button
              type="button"
              onClick={onAddOption}
              className="neobrutal-btn text-xs px-3 py-2 flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("editor.addOption")}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* English Column */}
        <div className="paper-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2154F4] inline-block" />
              {t("editor.english")}
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              {item.en.stem.length}/{APP_LIMITS.MAX_STEM_LENGTH}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              {t("editor.stem")}
            </label>
            <textarea
              value={item.en.stem}
              onChange={(e) => onUpdateStem("en", e.target.value)}
              placeholder="Enter English question stem..."
              maxLength={APP_LIMITS.MAX_STEM_LENGTH}
              rows={3}
              className="w-full p-2.5 text-sm border-2 border-black rounded-none focus:bg-white resize-y bg-[#FFFDF5]"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Options
            </h4>
            {item.en.options.map((opt) => (
              <div key={opt.label} className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center font-bold text-sm bg-black text-white shrink-0">
                  {opt.label}
                </span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => onUpdateOption("en", opt.label, e.target.value)}
                  placeholder={`Option ${opt.label} in English`}
                  maxLength={APP_LIMITS.MAX_OPTION_LENGTH}
                  className="flex-1 p-2 text-sm border-2 border-black rounded-none bg-[#FFFDF5] min-h-[44px]"
                />
                {canRemoveOption && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(opt.label)}
                    title={t("editor.removeOption")}
                    className="p-2 text-gray-500 hover:text-red-600 border border-transparent hover:border-black min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tamil Column */}
        <div className="paper-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-base flex items-center gap-2 font-tamil">
              <span className="w-3 h-3 rounded-full bg-[#18552C] inline-block" />
              {t("editor.tamil")}
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              {item.ta.stem.length}/{APP_LIMITS.MAX_STEM_LENGTH}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 font-tamil">
              {t("editor.stem")}
            </label>
            <textarea
              value={item.ta.stem}
              onChange={(e) => onUpdateStem("ta", e.target.value)}
              placeholder="தமிழில் கேள்விப் பகுதியை உள்ளிடவும்..."
              maxLength={APP_LIMITS.MAX_STEM_LENGTH}
              rows={3}
              className="w-full p-2.5 text-sm border-2 border-black rounded-none font-tamil focus:bg-white resize-y bg-[#FFFDF5]"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 font-tamil">
              விடைகள் (Options)
            </h4>
            {item.ta.options.map((opt) => (
              <div key={opt.label} className="flex items-center gap-2">
                <span className="w-7 h-7 flex items-center justify-center font-bold text-sm bg-black text-white shrink-0">
                  {opt.label}
                </span>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => onUpdateOption("ta", opt.label, e.target.value)}
                  placeholder={`விடை ${opt.label} தமிழில்`}
                  maxLength={APP_LIMITS.MAX_OPTION_LENGTH}
                  className="flex-1 p-2 text-sm border-2 border-black rounded-none font-tamil bg-[#FFFDF5] min-h-[44px]"
                />
                {canRemoveOption && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(opt.label)}
                    title={t("editor.removeOption")}
                    className="p-2 text-gray-500 hover:text-red-600 border border-transparent hover:border-black min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

