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

  it("rejects outdated analysis response when Request A resolves after Request B starts", () => {
    // 1. Initial state
    const s0 = initialReviewState;
    expect(s0.activeItemId).toBe("DEV_NEGATION");
    expect(s0.revision).toBe(0);

    // 2. Request A starts on Question A (DEV_NEGATION)
    const reqAId = "11111111-1111-4111-8111-111111111111";
    const s1 = reviewReducer(s0, {
      type: "START_ANALYSIS",
      payload: { requestId: reqAId },
    });
    expect(s1.isAnalyzing).toBe(true);
    expect(s1.currentRequestId).toBe(reqAId);

    // 3. User switches active question to DEV_VERB
    const s2 = reviewReducer(s1, {
      type: "SET_ACTIVE_ITEM",
      payload: { id: "DEV_VERB" },
    });
    expect(s2.activeItemId).toBe("DEV_VERB");

    // 4. Request B starts on Question B (DEV_VERB)
    const reqBId = "22222222-2222-4222-8222-222222222222";
    const s3 = reviewReducer(s2, {
      type: "START_ANALYSIS",
      payload: { requestId: reqBId },
    });
    expect(s3.isAnalyzing).toBe(true);
    expect(s3.currentRequestId).toBe(reqBId);

    // 5. Request A resolves AFTER Request B has already started
    const staleResponseA = {
      requestId: reqAId,
      revision: 0,
      mode: "rules_only" as const,
      model: null,
      providerStatus: "not_requested" as const,
      warnings: [],
      items: [
        {
          id: "DEV_NEGATION",
          status: "needs_review" as const,
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };
    const s4 = reviewReducer(s3, {
      type: "ANALYSIS_SUCCESS",
      payload: { response: staleResponseA },
    });

    // CRITICAL: Reducer must ignore stale Response A because currentRequestId is reqBId!
    expect(s4.analysisResponse).toBeNull();
    expect(s4.isAnalyzing).toBe(true);
    expect(s4.currentRequestId).toBe(reqBId);

    // 6. Request B resolves with valid response for Question B
    const validResponseB = {
      requestId: reqBId,
      revision: 0,
      mode: "rules_only" as const,
      model: null,
      providerStatus: "not_requested" as const,
      warnings: [],
      items: [
        {
          id: "DEV_VERB",
          status: "needs_review" as const,
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };
    const s5 = reviewReducer(s4, {
      type: "ANALYSIS_SUCCESS",
      payload: { response: validResponseB },
    });

    // Final state contains ONLY valid result for Request B
    expect(s5.isAnalyzing).toBe(false);
    expect(s5.analysisResponse).toEqual(validResponseB);
    expect(s5.analysisResponse?.items[0].id).toBe("DEV_VERB");
  });

  it("rejects outdated analysis response when question revision was modified during in-flight analysis", () => {
    const s0 = initialReviewState;
    const reqId = "33333333-3333-4333-8333-333333333333";

    // Start analysis at revision 0
    const s1 = reviewReducer(s0, {
      type: "START_ANALYSIS",
      payload: { requestId: reqId },
    });
    expect(s1.revision).toBe(0);

    // User updates text, incrementing revision to 1
    const s2 = reviewReducer(s1, {
      type: "UPDATE_STEM",
      payload: { id: "DEV_NEGATION", lang: "en", text: "Modified question" },
    });
    expect(s2.revision).toBe(1);

    // Stale response from revision 0 arrives
    const staleResponseRev0 = {
      requestId: reqId,
      revision: 0,
      mode: "rules_only" as const,
      model: null,
      providerStatus: "not_requested" as const,
      warnings: [],
      items: [],
    };
    const s3 = reviewReducer(s2, {
      type: "ANALYSIS_SUCCESS",
      payload: { response: staleResponseRev0 },
    });

    // Stale revision 0 response rejected!
    expect(s3.analysisResponse).toBeNull();
  });

  it("rejects late analysis response after RESET_ALL and confirms reset state remains unchanged", () => {
    const s0 = initialReviewState;
    const reqId = "44444444-4444-4444-8444-444444444444";

    // 1. Start analysis
    const s1 = reviewReducer(s0, {
      type: "START_ANALYSIS",
      payload: { requestId: reqId },
    });
    expect(s1.isAnalyzing).toBe(true);
    expect(s1.currentRequestId).toBe(reqId);

    // 2. User resets the application
    const s2 = reviewReducer(s1, { type: "RESET_ALL" });
    expect(s2.isAnalyzing).toBe(false);
    expect(s2.currentRequestId).toBeNull();
    expect(s2.analysisResponse).toBeNull();

    // 3. Old in-flight response arrives late
    const lateResponse = {
      requestId: reqId,
      revision: 0,
      mode: "rules_only" as const,
      model: null,
      providerStatus: "not_requested" as const,
      warnings: [],
      items: [
        {
          id: "DEV_NEGATION",
          status: "needs_review" as const,
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };

    const s3 = reviewReducer(s2, {
      type: "ANALYSIS_SUCCESS",
      payload: { response: lateResponse },
    });

    // 4. Reset state MUST remain completely unchanged
    expect(s3).toEqual(s2);
    expect(s3.isAnalyzing).toBe(false);
    expect(s3.currentRequestId).toBeNull();
    expect(s3.analysisResponse).toBeNull();

    // 5. Late error response arrives after reset
    const s4 = reviewReducer(s2, {
      type: "ANALYSIS_ERROR",
      payload: { messageKey: "errors.internalError", code: "INTERNAL_ERROR", requestId: reqId },
    });

    // Reset state MUST remain completely unchanged
    expect(s4).toEqual(s2);
    expect(s4.error).toBeNull();
  });

  it("rejects stale error responses from an earlier request and preserves loading state of newer request", () => {
    const s0 = initialReviewState;
    const reqAId = "55555555-5555-4555-8555-555555555555";
    const reqBId = "66666666-6666-4666-8666-666666666666";

    // Request A starts
    const s1 = reviewReducer(s0, {
      type: "START_ANALYSIS",
      payload: { requestId: reqAId },
    });

    // Request B starts
    const s2 = reviewReducer(s1, {
      type: "START_ANALYSIS",
      payload: { requestId: reqBId },
    });
    expect(s2.isAnalyzing).toBe(true);
    expect(s2.currentRequestId).toBe(reqBId);

    // Stale error from Request A arrives
    const s3 = reviewReducer(s2, {
      type: "ANALYSIS_ERROR",
      payload: { messageKey: "actions.cancel", requestId: reqAId },
    });

    // Request B MUST still be actively analyzing with no error set
    expect(s3.isAnalyzing).toBe(true);
    expect(s3.currentRequestId).toBe(reqBId);
    expect(s3.error).toBeNull();
  });

  it("rejects late success responses when no analysis request is active", () => {
    const s0 = initialReviewState;
    expect(s0.isAnalyzing).toBe(false);
    expect(s0.currentRequestId).toBeNull();

    const unrequestedResponse = {
      requestId: "77777777-7777-4777-8777-777777777777",
      revision: 0,
      mode: "rules_only" as const,
      model: null,
      providerStatus: "not_requested" as const,
      warnings: [],
      items: [],
    };

    const s1 = reviewReducer(s0, {
      type: "ANALYSIS_SUCCESS",
      payload: { response: unrequestedResponse },
    });

    // State MUST remain completely unchanged
    expect(s1).toEqual(s0);
    expect(s1.analysisResponse).toBeNull();
  });
});

