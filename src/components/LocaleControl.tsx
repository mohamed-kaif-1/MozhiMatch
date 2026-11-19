"use client";

import React from "react";
import { useI18n } from "../i18n/provider";
import { Languages } from "lucide-react";

export const LocaleControl: React.FC = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded-[6px] p-1">
      <div className="pl-1.5 pr-1 text-xs font-semibold text-slate-500 flex items-center gap-1">
        <Languages className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">{t("nav.language")}:</span>
      </div>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-2.5 py-1 text-xs font-bold rounded-[4px] min-h-[32px] sm:min-h-[28px] flex items-center justify-center transition-all ${
          locale === "en"
            ? "bg-[#2154F4] text-white shadow-sm font-extrabold"
            : "text-slate-600 hover:text-slate-900 hover:bg-white"
        }`}
      >
        {t("nav.english")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("ta")}
        aria-pressed={locale === "ta"}
        className={`px-2.5 py-1 text-xs font-bold font-tamil rounded-[4px] min-h-[32px] sm:min-h-[28px] flex items-center justify-center transition-all ${
          locale === "ta"
            ? "bg-[#2154F4] text-white shadow-sm font-extrabold"
            : "text-slate-600 hover:text-slate-900 hover:bg-white"
        }`}
      >
        {t("nav.tamil")}
      </button>
    </div>
  );
};
