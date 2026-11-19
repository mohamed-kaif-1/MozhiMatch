"use client";

import React from "react";
import { useI18n } from "../i18n/provider";
import { Languages } from "lucide-react";

export const LocaleControl: React.FC = () => {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1.5 paper-panel p-1 bg-white">
      <div className="px-2 text-xs font-bold text-gray-500 flex items-center gap-1">
        <Languages className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("nav.language")}:</span>
      </div>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-3 py-2 text-xs font-bold border-2 border-black min-h-[44px] flex items-center justify-center transition-all ${
          locale === "en"
            ? "bg-[#2154F4] text-white shadow-[2px_2px_0_#000]"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        {t("nav.english")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("ta")}
        aria-pressed={locale === "ta"}
        className={`px-3 py-2 text-xs font-bold font-tamil border-2 border-black min-h-[44px] flex items-center justify-center transition-all ${
          locale === "ta"
            ? "bg-[#2154F4] text-white shadow-[2px_2px_0_#000]"
            : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        {t("nav.tamil")}
      </button>
    </div>
  );
};

