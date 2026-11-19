"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import enMessages from "../messages/en.json";
import taMessages from "../messages/ta.json";
import { APP_LIMITS } from "../lib/contracts/config";

type Locale = "en" | "ta";
type Messages = typeof enMessages;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(APP_LIMITS.LOCAL_STORAGE_LOCALE_KEY);
      if (stored === "en" || stored === "ta") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(stored);
      }
    } catch {
      // Ignore local storage errors in sandboxed environments
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(APP_LIMITS.LOCAL_STORAGE_LOCALE_KEY, newLocale);
    } catch {
      // Ignore
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = locale === "ta" ? (taMessages as unknown as Record<string, unknown>) : (enMessages as unknown as Record<string, unknown>);
    const fallbackDict = enMessages as unknown as Record<string, unknown>;

    let template = getNestedValue(currentDict, key);
    if (!template) {
      template = getNestedValue(fallbackDict, key) || key;
    }

    if (!params) return template;

    let result = template;
    for (const [k, v] of Object.entries(params)) {
      result = result.replaceAll(`{${k}}`, String(v));
    }
    return result;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
