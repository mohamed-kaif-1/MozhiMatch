export const APP_LIMITS = {
  MAX_REQUEST_BYTES: 64000,
  MAX_ITEMS: 10,
  MIN_ITEMS: 1,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 5,
  MAX_STEM_LENGTH: 2000,
  MAX_OPTION_LENGTH: 400,
  CLIENT_TIMEOUT_MS: 30000,
  PROVIDER_TIMEOUT_MS: 25000,
  LOCAL_STORAGE_LOCALE_KEY: "bmcq.locale",
} as const;

export const DEFAULT_QUESTION_ITEM = {
  id: "Q1",
  en: {
    stem: "",
    options: [
      { label: "A" as const, text: "" },
      { label: "B" as const, text: "" },
      { label: "C" as const, text: "" },
      { label: "D" as const, text: "" },
    ],
  },
  ta: {
    stem: "",
    options: [
      { label: "A" as const, text: "" },
      { label: "B" as const, text: "" },
      { label: "C" as const, text: "" },
      { label: "D" as const, text: "" },
    ],
  },
};
