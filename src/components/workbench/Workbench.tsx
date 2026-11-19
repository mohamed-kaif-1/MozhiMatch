"use client";

import React, { useReducer, useRef, useState } from "react";
import { reviewReducer, initialReviewState } from "../../lib/core/review-state";
import { useI18n } from "../../i18n/provider";
import { LocaleControl } from "../LocaleControl";
import { PairEditor } from "./PairEditor";
import { ReviewQueue } from "./ReviewQueue";
import { EvidencePanel } from "./EvidencePanel";
import { formatReviewSummary } from "../../lib/core/export";
import devFixtures from "../../fixtures/development.json";
import { QuestionItem, AnalyzeRequest } from "../../lib/contracts/types";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  KeyRound,
  ShieldAlert,
  Loader2,
  Info,
  X,
} from "lucide-react";

export const Workbench: React.FC = () => {
  const { locale, t } = useI18n();
  const [state, dispatch] = useReducer(reviewReducer, initialReviewState);
  const [copied, setCopied] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const activeItem =
    state.items.find((i) => i.id === state.activeItemId) || state.items[0];

  const analysisItem =
    state.analysisResponse?.items.find((i) => i.id === state.activeItemId) || null;

  // Handle example selection
  const handleLoadExample = (exampleId: string) => {
    const fixture = devFixtures.find((f) => f.id === exampleId);
    if (fixture) {
      dispatch({
        type: "LOAD_FIXTURE",
        payload: [fixture as QuestionItem],
      });
    }
  };

  // Run Analysis
  const handleRunAnalysis = async () => {
    if (state.isAnalyzing) return;

    if (state.mode === "ai" && !state.consent) {
      dispatch({
        type: "ANALYSIS_ERROR",
        payload: {
          messageKey: "errors.consentRequired",
          code: "CONSENT_REQUIRED",
        },
      });
      return;
    }

    const requestId = crypto.randomUUID();
    dispatch({ type: "START_ANALYSIS", payload: { requestId } });

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestPayload: AnalyzeRequest = {
      requestId,
      revision: state.revision,
      locale,
      mode: state.mode,
      sourceKind: state.sourceKind,
      consent: state.consent,
      items: state.items,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (state.demoCode.trim().length > 0) {
      headers["X-Demo-Code"] = state.demoCode.trim();
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const code = errJson?.error?.code || "INTERNAL_ERROR";
        const messageKey = errJson?.error?.messageKey || "errors.internalError";
        dispatch({
          type: "ANALYSIS_ERROR",
          payload: { messageKey, code },
        });
        return;
      }

      const responseJson = await res.json();
      dispatch({
        type: "ANALYSIS_SUCCESS",
        payload: { response: responseJson },
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      dispatch({
        type: "ANALYSIS_ERROR",
        payload: {
          messageKey: "errors.internalError",
          code: "INTERNAL_ERROR",
        },
      });
    }
  };

  // Cancel in-flight analysis
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch({
      type: "ANALYSIS_ERROR",
      payload: { messageKey: "actions.cancel" },
    });
  };

  // Copy plain-text summary
  const handleCopySummary = async () => {
    const text = formatReviewSummary(state.items, state.analysisResponse, state.decisions);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback: show selectable text modal
      setShowExportModal(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("app.name")}
            </h1>
            <span className="font-mono text-xs uppercase px-2 py-0.5 bg-black text-white font-bold">
              MVP
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">{t("app.tagline")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="neobrutal-btn px-3 py-2 text-xs flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px]"
            title={t("app.help")}
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">{t("app.help")}</span>
          </button>
          <LocaleControl />
        </div>
      </header>

      {/* Toolbar / Action Controls Bar */}
      <div className="paper-panel p-4 space-y-4 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Example Loader */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700">
              {t("editor.loadExample")}:
            </label>
            <select
              onChange={(e) => handleLoadExample(e.target.value)}
              defaultValue="DEV_NEGATION"
              className="px-2.5 py-2 text-xs border-2 border-black font-semibold bg-[#FFFDF5] min-h-[44px] max-w-[200px] sm:max-w-xs"
            >
              <option value="DEV_NEGATION">DEV_NEGATION (Negation dropped in Tamil)</option>
              <option value="DEV_VERB">DEV_VERB (Verb direction mismatch)</option>
              <option value="DEV_CLEAN">DEV_CLEAN (Clean math control)</option>
              <option value="DEV_UNCERTAIN">DEV_UNCERTAIN (Transliteration ambiguous)</option>
              <option value="DEV_STRUCTURE">DEV_STRUCTURE (Option count mismatch)</option>
            </select>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">{t("app.mode")}:</span>
            <div className="flex border-2 border-black">
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_MODE", payload: "rules" })}
                className={`px-3 py-2 text-xs font-bold transition-all ${
                  state.mode === "rules"
                    ? "bg-[#FFE066] text-black font-extrabold"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t("actions.rules")} (Zero-Paid)
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_MODE", payload: "ai" })}
                className={`px-3 py-2 text-xs font-bold transition-all border-l-2 border-black ${
                  state.mode === "ai"
                    ? "bg-[#2154F4] text-white font-extrabold"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Semantic AI Review
              </button>
            </div>
          </div>

          {/* Operator Demo Code Toggle */}
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className="text-xs text-gray-600 underline flex items-center gap-1 hover:text-black min-h-[44px] py-2 px-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {t("privacy.code")}
          </button>
        </div>

        {/* Collapsible Operator Code Row */}
        {showCodeInput && (
          <div className="p-3 bg-[#FFFDF5] border-2 border-dashed border-black flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold">{t("privacy.code")}:</label>
            <input
              type="password"
              value={state.demoCode}
              onChange={(e) =>
                dispatch({ type: "SET_DEMO_CODE", payload: e.target.value })
              }
              placeholder="Enter private operator code..."
              className="p-1.5 text-xs border-2 border-black font-mono w-full max-w-xs"
            />
            <span className="text-[11px] text-gray-500">{t("privacy.codeHelp")}</span>
          </div>
        )}

        {/* AI Consent & Source Scope Checkbox */}
        {state.mode === "ai" && (
          <div className="flex items-center gap-2 pt-2 border-t text-xs">
            <input
              type="checkbox"
              id="ai-consent"
              checked={state.consent}
              onChange={(e) =>
                dispatch({ type: "SET_CONSENT", payload: e.target.checked })
              }
              className="w-4 h-4 rounded-none border-2 border-black text-[#2154F4] focus:ring-0"
            />
            <label htmlFor="ai-consent" className="font-semibold text-gray-800 cursor-pointer">
              {t("privacy.consent")} ({t("privacy.cloud")})
            </label>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black">
          <div className="flex items-center gap-3">
            {state.isAnalyzing ? (
              <button
                type="button"
                onClick={handleCancel}
                className="neobrutal-btn bg-[#FFE0DB] text-[#8A241A] text-sm px-5 py-2.5 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t("actions.cancel")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRunAnalysis}
                className="neobrutal-btn neobrutal-btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                {state.mode === "ai" ? t("actions.analyze") : t("actions.rules")}
              </button>
            )}

            {state.isAnalyzing && (
              <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#2154F4]" />
                {t("status.checking")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="neobrutal-btn text-xs px-3.5 py-2 flex items-center gap-1.5 min-h-[44px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  {t("actions.copied")}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t("actions.copy")}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="neobrutal-btn text-xs px-3 py-2 flex items-center justify-center gap-1 text-gray-700 hover:text-black min-h-[44px] min-w-[44px]"
              title={t("actions.reset")}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("actions.reset")}
            </button>
          </div>
        </div>

        {/* Action Error Banner */}
        {state.error && (
          <div className="p-3 bg-[#FFE0DB] text-[#8A241A] border-2 border-black text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {t(state.error.messageKey)} {state.error.code ? `(${state.error.code})` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Main Workbench Layout: Left Editor & Queue, Right Evidence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Review Queue (3 cols) & Pair Editor (9 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          <ReviewQueue
            items={state.items}
            activeItemId={state.activeItemId}
            analysisResponse={state.analysisResponse}
            decisions={state.decisions}
            onSelectItem={(id) => dispatch({ type: "SET_ACTIVE_ITEM", payload: { id } })}
            onAddItem={() => dispatch({ type: "ADD_ITEM" })}
            onRemoveItem={(id) => dispatch({ type: "REMOVE_ITEM", payload: { id } })}
            t={t}
          />

          <PairEditor
            item={activeItem}
            onUpdateStem={(lang, text) =>
              dispatch({
                type: "UPDATE_STEM",
                payload: { id: activeItem.id, lang, text },
              })
            }
            onUpdateOption={(lang, label, text) =>
              dispatch({
                type: "UPDATE_OPTION",
                payload: { id: activeItem.id, lang, label, text },
              })
            }
            onAddOption={() =>
              dispatch({ type: "ADD_OPTION", payload: { id: activeItem.id } })
            }
            onRemoveOption={(label) =>
              dispatch({
                type: "REMOVE_OPTION",
                payload: { id: activeItem.id, label },
              })
            }
            t={t}
          />
        </div>

        {/* Right Column: Evidence & Decision Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <EvidencePanel
            item={activeItem}
            analysisItem={analysisItem}
            decisions={state.decisions[activeItem.id] || {}}
            onSetDecision={(fieldKey, decision) =>
              dispatch({
                type: "SET_DECISION",
                payload: { itemId: activeItem.id, fieldKey, decision },
              })
            }
            t={t}
          />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="paper-panel p-6 max-w-sm w-full space-y-4 bg-white">
            <h3 className="font-bold text-lg">{t("actions.confirmReset")}</h3>
            <p className="text-xs text-gray-600">{t("actions.resetDetail")}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="neobrutal-btn text-xs px-4 py-2"
              >
                {t("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "RESET_ALL" });
                  setShowResetConfirm(false);
                }}
                className="neobrutal-btn bg-[#FFE0DB] text-[#8A241A] font-bold text-xs px-4 py-2"
              >
                {t("actions.reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selectable Fallback Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="paper-panel p-6 max-w-2xl w-full space-y-4 bg-white">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base">{t("actions.manualCopy")}</h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              readOnly
              rows={12}
              value={formatReviewSummary(state.items, state.analysisResponse, state.decisions)}
              className="w-full p-3 font-mono text-xs border-2 border-black bg-[#FFFDF5]"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="neobrutal-btn text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How This Works Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="paper-panel p-6 max-w-lg w-full space-y-4 bg-white">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base">{t("app.help")}</h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              <p>
                <strong>MozhiMatch</strong> helps bilingual examination editors inspect practice
                questions in English and Tamil side-by-side.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Structural checks:</strong> Inspects option counts, labels, numeric
                  tokens, and units deterministically with zero paid API usage.
                </li>
                <li>
                  <strong>Semantic checks:</strong> Analyzes meaning preservation, negation drops,
                  qualifiers, and answer position alignment.
                </li>
                <li>
                  <strong>Exact evidence:</strong> Quotes literal strings from the original
                  sources with character-level accuracy.
                </li>
                <li>
                  <strong>Human decision:</strong> Mark each finding <em>Keep</em>, <em>Fix</em>, or{" "}
                  <em>Escalate</em>, and copy the issue list for editorial review.
                </li>
              </ul>
              <p className="text-gray-500 pt-2 border-t">
                Privacy: Source text stays in browser memory unless cloud AI is explicitly
                consented.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="neobrutal-btn text-xs px-4 py-2"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

