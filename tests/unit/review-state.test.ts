import { describe, it, expect } from "vitest";
import { reviewReducer, initialReviewState } from "../../src/lib/core/review-state";

describe("Review State Reducer", () => {
  it("increments revision and clears findings on stem update", () => {
    const s1 = {
      ...initialReviewState,
      analysisResponse: {
        requestId: "123e4567-e89b-42d3-a456-426614174000",
        revision: 0,
        mode: "rules_only" as const,
        model: null,
        providerStatus: "ok" as const,
        warnings: [],
        items: [],
      },
    };

    const s2 = reviewReducer(s1, {
      type: "UPDATE_STEM",
      payload: { id: "Q1", lang: "en", text: "New question stem?" },
    });

    expect(s2.revision).toBe(s1.revision + 1);
    expect(s2.analysisResponse).toBeNull();
    expect(s2.items[0].en.stem).toBe("New question stem?");
  });

  it("adds and removes options", () => {
    const s1 = reviewReducer(initialReviewState, {
      type: "ADD_OPTION",
      payload: { id: "Q1" },
    });
    expect(s1.items[0].en.options.length).toBe(5);
    expect(s1.items[0].en.options[4].label).toBe("E");

    const s2 = reviewReducer(s1, {
      type: "REMOVE_OPTION",
      payload: { id: "Q1", label: "E" },
    });
    expect(s2.items[0].en.options.length).toBe(4);
  });

  it("records reviewer decisions per item and field", () => {
    const s1 = reviewReducer(initialReviewState, {
      type: "SET_DECISION",
      payload: { itemId: "Q1", fieldKey: "stem", decision: "fix" },
    });
    expect(s1.decisions["Q1"]?.["stem"]).toBe("fix");

    const s2 = reviewReducer(s1, {
      type: "SET_DECISION",
      payload: { itemId: "Q1", fieldKey: "option:A", decision: "keep" },
    });
    expect(s2.decisions["Q1"]?.["stem"]).toBe("fix");
    expect(s2.decisions["Q1"]?.["option:A"]).toBe("keep");
  });
});

