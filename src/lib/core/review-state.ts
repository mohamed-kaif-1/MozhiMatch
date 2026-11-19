import { QuestionItem, AnalyzeResponse, ReviewDecisionType } from "../contracts/types";
import devFixtures from "../../fixtures/development.json";

export interface ReviewState {
  items: QuestionItem[];
  activeItemId: string;
  revision: number;
  mode: "rules" | "ai";
  sourceKind: "synthetic" | "public" | "owned_practice";
  consent: boolean;
  demoCode: string;
  isAnalyzing: boolean;
  currentRequestId: string | null;
  analysisResponse: AnalyzeResponse | null;
  analyzedAt: string | null;
  error: { messageKey: string; code?: string } | null;
  decisions: Record<string, Record<string, ReviewDecisionType>>;
}

export type ReviewAction =
  | { type: "SET_ITEMS"; payload: QuestionItem[] }
  | { type: "LOAD_FIXTURE"; payload: QuestionItem[] }
  | { type: "ADD_ITEM" }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "SET_ACTIVE_ITEM"; payload: { id: string } }
  | { type: "UPDATE_STEM"; payload: { id: string; lang: "en" | "ta"; text: string } }
  | { type: "UPDATE_OPTION"; payload: { id: string; lang: "en" | "ta"; label: "A" | "B" | "C" | "D" | "E"; text: string } }
  | { type: "ADD_OPTION"; payload: { id: string } }
  | { type: "REMOVE_OPTION"; payload: { id: string; label: "A" | "B" | "C" | "D" | "E" } }
  | { type: "SET_MODE"; payload: "rules" | "ai" }
  | { type: "SET_SOURCE_KIND"; payload: "synthetic" | "public" | "owned_practice" }
  | { type: "SET_CONSENT"; payload: boolean }
  | { type: "SET_DEMO_CODE"; payload: string }
  | { type: "START_ANALYSIS"; payload: { requestId: string } }
  | { type: "ANALYSIS_SUCCESS"; payload: { response: AnalyzeResponse; analyzedAt?: string } }
  | { type: "ANALYSIS_ERROR"; payload: { messageKey: string; code?: string; requestId?: string } }
  | { type: "SET_DECISION"; payload: { itemId: string; fieldKey: string; decision: ReviewDecisionType } }
  | { type: "RESET_ALL" };

export const initialReviewState: ReviewState = {
  items: [JSON.parse(JSON.stringify(devFixtures[0])) as QuestionItem],
  activeItemId: devFixtures[0].id,
  revision: 0,
  mode: "rules",
  sourceKind: "synthetic",
  consent: true,
  demoCode: "",
  isAnalyzing: false,
  currentRequestId: null,
  analysisResponse: null,
  analyzedAt: null,
  error: null,
  decisions: {},
};

export function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case "SET_ITEMS":
    case "LOAD_FIXTURE": {
      const items = action.payload;
      return {
        ...state,
        items,
        activeItemId: items[0]?.id || "Q1",
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
        decisions: {},
        isAnalyzing: false,
        currentRequestId: null,
      };
    }

    case "ADD_ITEM": {
      if (state.items.length >= 10) return state;
      const nextId = `Q${state.items.length + 1}`;
      const newItem: QuestionItem = {
        id: nextId,
        en: {
          stem: "",
          options: [
            { label: "A", text: "" },
            { label: "B", text: "" },
            { label: "C", text: "" },
            { label: "D", text: "" },
          ],
        },
        ta: {
          stem: "",
          options: [
            { label: "A", text: "" },
            { label: "B", text: "" },
            { label: "C", text: "" },
            { label: "D", text: "" },
          ],
        },
      };
      return {
        ...state,
        items: [...state.items, newItem],
        activeItemId: nextId,
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
      };
    }

    case "REMOVE_ITEM": {
      if (state.items.length <= 1) return state;
      const filtered = state.items.filter((item) => item.id !== action.payload.id);
      return {
        ...state,
        items: filtered,
        activeItemId: state.activeItemId === action.payload.id ? filtered[0]?.id || "Q1" : state.activeItemId,
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
      };
    }

    case "SET_ACTIVE_ITEM": {
      return {
        ...state,
        activeItemId: action.payload.id,
      };
    }

    case "UPDATE_STEM": {
      const { id, lang, text } = action.payload;
      const updated = state.items.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          [lang]: {
            ...item[lang],
            stem: text,
          },
        };
      });
      return {
        ...state,
        items: updated,
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
      };
    }

    case "UPDATE_OPTION": {
      const { id, lang, label, text } = action.payload;
      const updated = state.items.map((item) => {
        if (item.id !== id) return item;
        const options = item[lang].options.map((opt) => {
          if (opt.label !== label) return opt;
          return { ...opt, text };
        });
        return {
          ...item,
          [lang]: {
            ...item[lang],
            options,
          },
        };
      });
      return {
        ...state,
        items: updated,
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
      };
    }

    case "ADD_OPTION": {
      const { id } = action.payload;
      const allLabels: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];
      const updated = state.items.map((item) => {
        if (item.id !== id) return item;
        const currentCount = item.en.options.length;
        if (currentCount >= 5) return item;
        const nextLabel = allLabels[currentCount];
        return {
          ...item,
          en: {
            ...item.en,
            options: [...item.en.options, { label: nextLabel, text: "" }],
          },
          ta: {
            ...item.ta,
            options: [...item.ta.options, { label: nextLabel, text: "" }],
          },
        };
      });
      return {
        ...state,
        items: updated,
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
      };
    }

    case "REMOVE_OPTION": {
      const { id, label } = action.payload;
      const updated = state.items.map((item) => {
        if (item.id !== id) return item;
        if (item.en.options.length <= 2) return item;
        return {
          ...item,
          en: {
            ...item.en,
            options: item.en.options.filter((opt) => opt.label !== label),
          },
          ta: {
            ...item.ta,
            options: item.ta.options.filter((opt) => opt.label !== label),
          },
        };
      });
      return {
        ...state,
        items: updated,
        revision: state.revision + 1,
        analysisResponse: null,
        analyzedAt: null,
        error: null,
      };
    }

    case "SET_MODE":
      return { ...state, mode: action.payload };

    case "SET_SOURCE_KIND":
      return { ...state, sourceKind: action.payload };

    case "SET_CONSENT":
      return { ...state, consent: action.payload };

    case "SET_DEMO_CODE":
      return { ...state, demoCode: action.payload };

    case "START_ANALYSIS":
      return {
        ...state,
        isAnalyzing: true,
        currentRequestId: action.payload.requestId,
        error: null,
      };

    case "ANALYSIS_SUCCESS": {
      // Outdated response & post-reset protection:
      // Accept ANALYSIS_SUCCESS only when an analysis is actively in-flight,
      // the response request ID matches currentRequestId, and its revision
      // exactly matches state.revision. Reject all stale, unrequested, or post-reset responses.
      if (
        !state.isAnalyzing ||
        !state.currentRequestId ||
        action.payload.response.requestId !== state.currentRequestId ||
        action.payload.response.revision !== state.revision
      ) {
        return state;
      }

      return {
        ...state,
        isAnalyzing: false,
        currentRequestId: null,
        analysisResponse: action.payload.response,
        analyzedAt: action.payload.analyzedAt || new Date().toISOString(),
        error: null,
      };
    }

    case "ANALYSIS_ERROR": {
      // Stale error protection:
      // If a requestId is provided and does not match the active request,
      // or if no analysis is active when a tagged error arrives, reject it
      // so stale errors cannot clear a newer request's loading state.
      if (
        (action.payload.requestId && action.payload.requestId !== state.currentRequestId) ||
        (!state.isAnalyzing && action.payload.requestId)
      ) {
        return state;
      }

      return {
        ...state,
        isAnalyzing: false,
        currentRequestId: null,
        error: {
          messageKey: action.payload.messageKey,
          code: action.payload.code,
        },
      };
    }

    case "SET_DECISION": {
      const { itemId, fieldKey, decision } = action.payload;
      const itemDecisions = state.decisions[itemId] || {};
      return {
        ...state,
        decisions: {
          ...state.decisions,
          [itemId]: {
            ...itemDecisions,
            [fieldKey]: decision,
          },
        },
      };
    }

    case "RESET_ALL":
      return {
        ...initialReviewState,
        revision: state.revision + 1,
      };

    default:
      return state;
  }
}

