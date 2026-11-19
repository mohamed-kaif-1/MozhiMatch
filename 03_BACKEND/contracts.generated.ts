// Generated from the delivered JSON schemas. Runtime semantic invariants still require Zod/core validation.

export type AnalyzeRequest = {
  requestId: string;
  revision: number;
  locale: "en" | "ta";
  mode: "rules" | "ai";
  sourceKind: "synthetic" | "public" | "owned_practice";
  consent: boolean;
  items: Array<{
    id: string;
    en: {
      stem: string;
      options: Array<{
        label: "A" | "B" | "C" | "D" | "E";
        text: string;
      }>;
    };
    ta: {
      stem: string;
      options: Array<{
        label: "A" | "B" | "C" | "D" | "E";
        text: string;
      }>;
    };
  }>;
};

export type AnalyzeResponse = {
  requestId: string;
  revision: number;
  mode: "rules_only" | "live_ai";
  model: string | null;
  providerStatus: "not_requested" | "ok" | "unavailable" | "timeout" | "invalid_response";
  warnings: Array<"AI_DISABLED" | "AI_UNAVAILABLE" | "AI_TIMEOUT" | "AI_INVALID_RESPONSE" | "UNSUPPORTED_CONTENT">;
  items: Array<{
    id: string;
    status: "meaning_changed" | "no_issue_found" | "needs_review";
    structuralFindings: Array<{
      code: "OPTION_COUNT_MISMATCH" | "OPTION_LABEL_MISMATCH" | "DUPLICATE_OPTION_LABEL" | "NUMERIC_TOKEN_DIFFERENCE" | "UNIT_TOKEN_DIFFERENCE";
      field: {
        kind: "stem" | "option";
        label: "A" | "B" | "C" | "D" | "E" | null;
      };
      enTokens: Array<string>;
      taTokens: Array<string>;
    }>;
    comparisons: Array<{
      field: {
        kind: "stem" | "option";
        label: "A" | "B" | "C" | "D" | "E" | null;
      };
      relation: "equivalent" | "different" | "uncertain";
      en: {
        start: number;
        end: number;
        text: string;
      };
      ta: {
        start: number;
        end: number;
        text: string;
      };
      reasonCode: "equivalent" | "negation" | "entity" | "qualifier" | "option_meaning" | "uncertain" | "other_material_change";
      explanation: string;
      evidenceValid: true;
    }>;
  }>;
};

export type ErrorResponse = {
  error: {
    code: "INVALID_REQUEST" | "BODY_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "FORBIDDEN_ORIGIN" | "UNAUTHORIZED_DEMO" | "DEMO_INPUT_RESTRICTED" | "CONSENT_REQUIRED" | "RATE_LIMITED" | "INTERNAL_ERROR";
    messageKey: string;
    requestId: string | null;
  };
};

export type ProviderOutput = {
  results: Array<{
    itemId: string;
    comparisons: Array<{
      field: {
        kind: "stem" | "option";
        label: "A" | "B" | "C" | "D" | "E" | null;
      };
      relation: "equivalent" | "different" | "uncertain";
      enQuote: string;
      taQuote: string;
      reasonCode: "equivalent" | "negation" | "entity" | "qualifier" | "option_meaning" | "uncertain" | "other_material_change";
      explanation: string;
    }>;
  }>;
};
