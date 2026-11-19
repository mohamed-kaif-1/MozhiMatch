import { describe, it, expect } from "vitest";
import { reviewReducer, initialReviewState } from "../../src/lib/core/review-state";

describe("Review State Reducer", () => {
  it("initializes with DEV_NEGATION authoritative fixture and matching activeItemId", () => {
    expect(initialReviewState.activeItemId).toBe("DEV_NEGATION");
    expect(initialReviewState.items[0].id).toBe("DEV_NEGATION");
    expect(initialReviewState.items[0].en.stem).toBe(
      "Which of these is NOT a renewable energy source?"
    );
  });

  it("increments revision and clears findings on stem update", () => {
    const activeId = initialReviewState.activeItemId;
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
      payload: { id: activeId, lang: "en", text: "New question stem?" },
    });

    expect(s2.revision).toBe(s1.revision + 1);
    expect(s2.analysisResponse).toBeNull();
    expect(s2.items[0].en.stem).toBe("New question stem?");
  });

  it("adds and removes options", () => {
    const activeId = initialReviewState.activeItemId;
    const s1 = reviewReducer(initialReviewState, {
      type: "ADD_OPTION",
      payload: { id: activeId },
    });
    expect(s1.items[0].en.options.length).toBe(5);
    expect(s1.items[0].en.options[4].label).toBe("E");

    const s2 = reviewReducer(s1, {
      type: "REMOVE_OPTION",
      payload: { id: activeId, label: "E" },
    });
    expect(s2.items[0].en.options.length).toBe(4);
  });

  it("records reviewer decisions per item and field", () => {
    const activeId = initialReviewState.activeItemId;
    const s1 = reviewReducer(initialReviewState, {
      type: "SET_DECISION",
      payload: { itemId: activeId, fieldKey: "stem", decision: "fix" },
    });
    expect(s1.decisions[activeId]?.["stem"]).toBe("fix");

    const s2 = reviewReducer(s1, {
      type: "SET_DECISION",
      payload: { itemId: activeId, fieldKey: "option:A", decision: "keep" },
    });
    expect(s2.decisions[activeId]?.["stem"]).toBe("fix");
    expect(s2.decisions[activeId]?.["option:A"]).toBe("keep");
  });
});

