"use client";

import React, { useEffect, useReducer, useRef, useState } from "react";
import { reviewReducer, initialReviewState } from "../../lib/core/review-state";
import { useI18n } from "../../i18n/provider";
import { LocaleControl } from "../LocaleControl";
import { PairEditor } from "./PairEditor";
import { ReviewQueue, StatusFilter } from "./ReviewQueue";
import { EvidencePanel, CorrectionFieldState } from "./EvidencePanel";
import { CsvImportModal } from "./CsvImportModal";
import { formatReviewSummary } from "../../lib/core/export";
import { generateReviewCsv } from "../../lib/core/csv-export";
import devFixtures from "../../fixtures/development.json";
import { QuestionItem, AnalyzeRequest, ValidatedComparison, AnalyzeResponse } from "../../lib/contracts/types";
import { CorrectionRequest, CorrectionResponse } from "../../lib/contracts/correction";
import { APP_LIMITS } from "../../lib/contracts/config";
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
  Download,
} from "lucide-react";

export const Workbench: React.FC = () => {
  const { locale, t } = useI18n();
  const [state, dispatch] = useReducer(reviewReducer, initialReviewState);
  const [copied, setCopied] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [correctionStates, setCorrectionStates] = useState<Record<string, CorrectionFieldState>>({});

  const abortControllerRef = useRef<AbortController | null>(null);
  const [prevAnalysisResponse, setPrevAnalysisResponse] = useState<AnalyzeResponse | null>(null);
  const [cachedAnalysis, setCachedAnalysis] = useState<AnalyzeResponse | null>(null);
  const correctionAbortControllersRef = useRef<Record<string, AbortController>>({});

  // Sync cached analysis when analysisResponse changes
  if (state.analysisResponse !== prevAnalysisResponse) {
    setPrevAnalysisResponse(state.analysisResponse);
    if (state.analysisResponse) {
      setCachedAnalysis(state.analysisResponse);
    }
  }

  // Close open modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showHelpModal) setShowHelpModal(false);
        if (showResetConfirm) setShowResetConfirm(false);
        if (showExportModal) setShowExportModal(false);
        if (showImportModal) setShowImportModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHelpModal, showResetConfirm, showExportModal, showImportModal]);

  const activeItem =
    state.items.find((i) => i.id === state.activeItemId) || state.items[0];

  const activeAnalysisItem =
    state.analysisResponse?.items.find((i) => i.id === state.activeItemId) || null;

  const cachedItem =
    cachedAnalysis?.items.find((i) => i.id === state.activeItemId) || null;

  const hasCorrectionActive = Object.keys(correctionStates).some(
    (k) =>
      k.startsWith(`${state.activeItemId}:`) &&
      (Boolean(correctionStates[k]?.appliedOriginalText) ||
        Boolean(correctionStates[k]?.suggestion) ||
        Boolean(correctionStates[k]?.isLoading))
  );

  const panelAnalysisItem = activeAnalysisItem || (hasCorrectionActive ? cachedItem : null);
  const isStale = Boolean(!activeAnalysisItem && panelAnalysisItem);

  // Handle example selection
  const handleLoadExample = (exampleId: string) => {
    const fixture = devFixtures.find((f) => f.id === exampleId);
    if (fixture) {
      setCorrectionStates({});
      setCachedAnalysis(null);
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

    const serializedPayload = JSON.stringify(requestPayload);
    const byteLength = new TextEncoder().encode(serializedPayload).length;
    if (byteLength > APP_LIMITS.MAX_REQUEST_BYTES) {
      dispatch({
        type: "ANALYSIS_ERROR",
        payload: {
          messageKey: "errors.bodyTooLarge",
          code: "BODY_TOO_LARGE",
        },
      });
      return;
    }

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
        payload: {
          response: responseJson,
          analyzedAt: new Date().toISOString(),
        },
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
      setShowExportModal(true);
    }
  };

  // Download CSV report
  const handleDownloadCsv = (scope: "all" | "filtered" = "all") => {
    let targetItems = state.items;
    if (scope === "filtered" && activeFilter !== "all") {
      targetItems = state.items.filter((item) => {
        if (!state.analysisResponse) return activeFilter === "editing";
        const found = state.analysisResponse.items.find((i) => i.id === item.id);
        const status = found ? found.status : "editing";
        return status === activeFilter;
      });
    }

    const csvContent = generateReviewCsv(
      targetItems,
      state.analysisResponse,
      state.decisions,
      state.analyzedAt
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mozhimatch-review-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSuggestCorrection = async (
    fieldKey: string,
    comp: ValidatedComparison
  ) => {
    const itemKey = `${activeItem.id}:${fieldKey}`;
    if (correctionStates[itemKey]?.isLoading) return;

    if (!state.consent && state.mode === "ai") {
      setCorrectionStates((prev) => ({
        ...prev,
        [itemKey]: {
          isLoading: false,
          suggestion: null,
          error: t("errors.consentRequired"),
          appliedOriginalText: null,
          appliedSuggestedText: undefined,
        },
      }));
      return;
    }

    const enFull =
      comp.field.kind === "stem"
        ? activeItem.en.stem
        : activeItem.en.options.find((o) => o.label === comp.field.label)?.text || "";
    const taFull =
      comp.field.kind === "stem"
        ? activeItem.ta.stem
        : activeItem.ta.options.find((o) => o.label === comp.field.label)?.text || "";

    if (correctionAbortControllersRef.current[itemKey]) {
      correctionAbortControllersRef.current[itemKey].abort();
    }
    const controller = new AbortController();
    correctionAbortControllersRef.current[itemKey] = controller;

    const currentRevision = state.revision;
    const currentItemId = activeItem.id;

    setCorrectionStates((prev) => ({
      ...prev,
      [itemKey]: {
        isLoading: true,
        suggestion: null,
        error: null,
        appliedOriginalText: null,
        appliedSuggestedText: undefined,
      },
    }));

    try {
      const payload: CorrectionRequest = {
        requestId: crypto.randomUUID(),
        itemId: currentItemId,
        revision: currentRevision,
        field: comp.field,
        sourceLanguage: "en",
        targetLanguage: "ta",
        sourceText: enFull,
        currentText: taFull,
        findingExplanation: comp.explanation,
        reasonCode: comp.reasonCode,
        consent: state.consent,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (state.demoCode.trim().length > 0) {
        headers["X-Demo-Code"] = state.demoCode.trim();
      }

      const res = await fetch("/api/correction", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.error?.messageKey
          ? t(errJson.error.messageKey)
          : t("correction.unavailable");
        setCorrectionStates((prev) => ({
          ...prev,
          [itemKey]: {
            isLoading: false,
            suggestion: null,
            error: msg,
            appliedOriginalText: null,
            appliedSuggestedText: undefined,
          },
        }));
        return;
      }

      const data: CorrectionResponse = await res.json();

      setCorrectionStates((prev) => ({
        ...prev,
        [itemKey]: {
          isLoading: false,
          suggestion: data,
          error: null,
          appliedOriginalText: null,
          appliedSuggestedText: undefined,
        },
      }));
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      setCorrectionStates((prev) => ({
        ...prev,
        [itemKey]: {
          isLoading: false,
          suggestion: null,
          error: t("correction.unavailable"),
          appliedOriginalText: null,
          appliedSuggestedText: undefined,
        },
      }));
    }
  };

  const handleApplyCorrection = (fieldKey: string, suggestedText: string) => {
    const itemKey = `${activeItem.id}:${fieldKey}`;
    const currentFieldState = correctionStates[itemKey];
    if (!currentFieldState?.suggestion) return;

    const isStem = fieldKey === "stem";
    const optionLabel = isStem
      ? null
      : (fieldKey.replace("option:", "") as "A" | "B" | "C" | "D" | "E");

    const originalTargetText = isStem
      ? activeItem.ta.stem
      : activeItem.ta.options.find((o) => o.label === optionLabel)?.text || "";

    if (isStem) {
      dispatch({
        type: "UPDATE_STEM",
        payload: { id: activeItem.id, lang: "ta", text: suggestedText },
      });
    } else if (optionLabel) {
      dispatch({
        type: "UPDATE_OPTION",
        payload: { id: activeItem.id, lang: "ta", label: optionLabel, text: suggestedText },
      });
    }

    setCorrectionStates((prev) => ({
      ...prev,
      [itemKey]: {
        ...currentFieldState,
        isLoading: false,
        error: null,
        appliedOriginalText: originalTargetText,
        appliedSuggestedText: suggestedText,
      },
    }));
  };

  const handleUndoCorrection = (fieldKey: string) => {
    const itemKey = `${activeItem.id}:${fieldKey}`;
    const currentFieldState = correctionStates[itemKey];
    if (!currentFieldState?.appliedOriginalText) return;

    const isStem = fieldKey === "stem";
    const optionLabel = isStem
      ? null
      : (fieldKey.replace("option:", "") as "A" | "B" | "C" | "D" | "E");

    const currentText = isStem
      ? activeItem.ta.stem
      : activeItem.ta.options.find((o) => o.label === optionLabel)?.text || "";

    if (
      currentFieldState.appliedSuggestedText &&
      currentText !== currentFieldState.appliedSuggestedText
    ) {
      setCorrectionStates((prev) => ({
        ...prev,
        [itemKey]: {
          ...currentFieldState,
          error: "Cannot undo: field was edited after applying suggestion.",
        },
      }));
      return;
    }

    if (isStem) {
      dispatch({
        type: "UPDATE_STEM",
        payload: { id: activeItem.id, lang: "ta", text: currentFieldState.appliedOriginalText },
      });
    } else if (optionLabel) {
      dispatch({
        type: "UPDATE_OPTION",
        payload: { id: activeItem.id, lang: "ta", label: optionLabel, text: currentFieldState.appliedOriginalText },
      });
    }

    setCorrectionStates((prev) => ({
      ...prev,
      [itemKey]: {
        ...currentFieldState,
        appliedOriginalText: null,
        appliedSuggestedText: undefined,
        error: null,
      },
    }));
  };

  const handleRejectCorrection = (fieldKey: string) => {
    const itemKey = `${activeItem.id}:${fieldKey}`;
    setCorrectionStates((prev) => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
  };

  const handleCloseCorrection = (fieldKey: string) => {
    const itemKey = `${activeItem.id}:${fieldKey}`;
    setCorrectionStates((prev) => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
  };

  // Check if current questions have any custom content or analysis to guard CSV replacement
  const hasExistingWork =
    state.analysisResponse !== null ||
    state.items.length > 1 ||
    Boolean(state.items[0]?.en.stem && state.items[0].en.stem.trim().length > 0);

  return (
    <div className="space-y-3.5">
      {/* 1. Header & Brand Identity (< 64px) */}
      <header className="h-14 sm:h-15 flex items-center justify-between gap-3 px-3 sm:px-4 bg-white border-[1.5px] border-slate-900 rounded-[6px]">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 132 88"
              className="w-7 h-5 sm:w-8 sm:h-5.5 shrink-0"
              fill="none"
              aria-label="MozhiMatch Logo"
              role="img"
            >
              <polygon points="0,0 28,0 58,32 38,58 0,16" fill="#2154F4" />
              <polygon points="104,0 132,0 132,16 66,88 46,66" fill="#2154F4" />
            </svg>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              MozhiMatch
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              Bilingual MCQ Preflight
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#EEF3FF] text-[#1435AD] border border-blue-200 uppercase tracking-tight">
              BATCH REVIEW
            </span>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-[6px] min-h-[36px] min-w-[36px] px-2.5 py-1.5 transition-colors flex items-center justify-center gap-1.5"
            title={t("app.help")}
          >
            <Info className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{t("app.help")}</span>
          </button>
          <LocaleControl />
        </div>
      </header>

      {/* 2. Compact Single-Row Utility Bar (Max ~56px) */}
      <div className="bg-white border-[1.5px] border-slate-900 rounded-[6px] px-3 py-1.5 flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5 shadow-sm min-h-[50px]">
        {/* Left: Example Loader */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            {t("editor.loadExample")}:
          </label>
          <select
            onChange={(e) => handleLoadExample(e.target.value)}
            defaultValue="DEV_NEGATION"
            className="h-8 px-2 text-xs font-medium text-slate-900 border border-slate-300 rounded-[6px] bg-white focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4] transition-colors max-w-[190px] sm:max-w-xs"
          >
            <option value="DEV_NEGATION">DEV_NEGATION (Negation dropped)</option>
            <option value="DEV_VERB">DEV_VERB (Verb mismatch)</option>
            <option value="DEV_CLEAN">DEV_CLEAN (Clean math control)</option>
            <option value="DEV_UNCERTAIN">DEV_UNCERTAIN (Ambiguous)</option>
            <option value="DEV_STRUCTURE">DEV_STRUCTURE (Count mismatch)</option>
          </select>
        </div>

        {/* Center: Mode Segmented Control + Operator Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-[6px] p-0.5">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_MODE", payload: "rules" })}
              className={`px-3 py-1.5 text-xs font-bold rounded-[4px] min-h-[36px] transition-all flex items-center justify-center ${
                state.mode === "rules"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {locale === "ta" ? "அமைப்புக் கட்டுப்பாடுகள்" : "Structure rules only"}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_MODE", payload: "ai" })}
              className={`px-3 py-1.5 text-xs font-bold rounded-[4px] min-h-[36px] transition-all flex items-center justify-center ${
                state.mode === "ai"
                  ? "bg-[#2154F4] text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {locale === "ta" ? "பொருள்சார் AI ஆய்வு" : "Semantic AI Review"}
            </button>
          </div>

          {/* Operator Demo Code Trigger */}
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`min-h-[36px] min-w-[36px] p-2 rounded-[6px] flex items-center justify-center transition-colors border ${
              showCodeInput || state.demoCode
                ? "bg-blue-50 text-[#2154F4] border-blue-200"
                : "text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100"
            }`}
            title={t("privacy.code")}
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {/* AI Consent Checkbox (inline when AI mode active) */}
          {state.mode === "ai" && (
            <div className="flex items-center gap-1.5 pl-1 text-xs">
              <input
                type="checkbox"
                id="ai-consent"
                checked={state.consent}
                onChange={(e) =>
                  dispatch({ type: "SET_CONSENT", payload: e.target.checked })
                }
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#2154F4] focus:ring-[#2154F4]"
              />
              <label htmlFor="ai-consent" className="font-semibold text-slate-700 cursor-pointer text-[11px]">
                {t("privacy.consent")}
              </label>
            </div>
          )}
        </div>

        {/* Right: Primary Run CTA & Secondary Utilities */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Run CTA */}
          {state.isAnalyzing ? (
            <button
              type="button"
              onClick={handleCancel}
              className="h-8.5 px-3.5 text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-red-300 rounded-[6px] hover:bg-red-100 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t("actions.cancel")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRunAnalysis}
              className="neobrutal-btn neobrutal-btn-primary h-8.5 px-4 text-xs font-bold bg-[#2154F4] hover:bg-[#1D4ED8] text-white rounded-[6px] border border-slate-900 shadow-[2px_2px_0_#0F172A] flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{state.mode === "ai" ? t("actions.analyze") : t("actions.rules")}</span>
            </button>
          )}

          {state.isAnalyzing && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2154F4]" />
              <span>{t("status.checking")}</span>
            </span>
          )}

          {/* Download CSV Report */}
          <div className="flex items-center border border-slate-300 rounded-[6px] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => handleDownloadCsv("all")}
              className="h-8.5 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Download full findings as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#2154F4]" />
              <span>{t("actions.downloadCsv")}</span>
            </button>
            {activeFilter !== "all" && (
              <button
                type="button"
                onClick={() => handleDownloadCsv("filtered")}
                className="h-8.5 px-2 text-[10px] border-l border-slate-200 font-semibold text-slate-600 hover:bg-blue-50 transition-colors"
                title="Download filtered only"
              >
                Filtered
              </button>
            )}
          </div>

          {/* Copy Issue List */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="h-8.5 px-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] flex items-center gap-1.5 transition-colors"
            title={t("actions.copy")}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">{t("actions.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{t("actions.copy")}</span>
              </>
            )}
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="h-8.5 px-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-300 rounded-[6px] flex items-center justify-center transition-colors"
            title={t("actions.reset")}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Operator Code Row */}
      {showCodeInput && (
        <div className="bg-white border border-dashed border-slate-300 rounded-[6px] p-2.5 flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700">{t("privacy.code")}:</label>
          <input
            type="password"
            value={state.demoCode}
            onChange={(e) =>
              dispatch({ type: "SET_DEMO_CODE", payload: e.target.value })
            }
            placeholder="Enter private operator code..."
            className="h-8 px-2.5 text-xs border border-slate-300 rounded-[4px] font-mono w-full max-w-xs focus:border-[#2154F4] focus:ring-1 focus:ring-[#2154F4]"
          />
          <span className="text-[11px] text-slate-500">{t("privacy.codeHelp")}</span>
        </div>
      )}

      {/* Action Error Banner */}
      {state.error && (
        <div className="p-3 bg-[#FEF2F2] text-[#DC2626] border border-red-200 rounded-[6px] text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            {t(state.error.messageKey)} {state.error.code ? `(${state.error.code})` : ""}
          </span>
        </div>
      )}

      {/* 3. 3-Pane Desktop Layout (Above the Fold) */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_350px] 2xl:grid-cols-[270px_1fr_370px] gap-3.5 items-start">
        {/* Left Rail: Question Batch Sidebar */}
        <aside className="w-full">
          <ReviewQueue
            items={state.items}
            activeItemId={state.activeItemId}
            analysisResponse={state.analysisResponse}
            decisions={state.decisions}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onSelectItem={(id) => dispatch({ type: "SET_ACTIVE_ITEM", payload: { id } })}
            onAddItem={() => dispatch({ type: "ADD_ITEM" })}
            onRemoveItem={(id) => dispatch({ type: "REMOVE_ITEM", payload: { id } })}
            onImportClick={() => setShowImportModal(true)}
            t={t}
          />
        </aside>

        {/* Center Canvas: Paired Questions Editor */}
        <section className="w-full min-w-0">
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
        </section>

        {/* Right Rail: Evidence & Findings Panel */}
        <aside className="w-full lg:col-span-2 xl:col-span-1">
          <EvidencePanel
            item={activeItem}
            analysisItem={panelAnalysisItem}
            decisions={state.decisions[activeItem.id] || {}}
            onSetDecision={(fieldKey, decision) =>
              dispatch({
                type: "SET_DECISION",
                payload: { itemId: activeItem.id, fieldKey, decision },
              })
            }
            t={t}
            isStale={isStale}
            correctionState={Object.keys(correctionStates)
              .filter((k) => k.startsWith(`${activeItem.id}:`))
              .reduce((acc, k) => {
                const fieldKey = k.replace(`${activeItem.id}:`, "");
                acc[fieldKey] = correctionStates[k];
                return acc;
              }, {} as Record<string, CorrectionFieldState>)}
            onSuggestCorrection={handleSuggestCorrection}
            onApplyCorrection={handleApplyCorrection}
            onUndoCorrection={handleUndoCorrection}
            onRejectCorrection={handleRejectCorrection}
            onCloseCorrection={handleCloseCorrection}
          />
        </aside>
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(importedItems) => {
          setCorrectionStates({});
          setCachedAnalysis(null);
          dispatch({ type: "SET_ITEMS", payload: importedItems });
        }}
        hasExistingWork={hasExistingWork}
        t={t}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div role="dialog" aria-modal="true" aria-labelledby="reset-modal-title" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[1.5px] border-slate-900 rounded-[6px] p-5 max-w-sm w-full space-y-3.5 shadow-xl">
            <h3 id="reset-modal-title" className="font-bold text-base text-slate-900">{t("actions.confirmReset")}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t("actions.resetDetail")}</p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="h-8.5 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] transition-colors"
              >
                {t("actions.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCorrectionStates({});
                  setCachedAnalysis(null);
                  dispatch({ type: "RESET_ALL" });
                  setShowResetConfirm(false);
                }}
                className="h-8.5 px-3 text-xs font-bold bg-[#DC2626] hover:bg-red-700 text-white rounded-[6px] transition-colors"
              >
                {t("actions.reset")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selectable Fallback Export Modal */}
      {showExportModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="export-modal-title" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[1.5px] border-slate-900 rounded-[6px] p-5 max-w-2xl w-full space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 id="export-modal-title" className="font-bold text-sm text-slate-900">{t("actions.manualCopy")}</h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-[4px] hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              readOnly
              rows={12}
              value={formatReviewSummary(state.items, state.analysisResponse, state.decisions)}
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-[6px] bg-slate-50 text-slate-800"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="h-8.5 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How This Works Help Modal */}
      {showHelpModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="help-modal-title" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[1.5px] border-slate-900 rounded-[6px] p-5 max-w-lg w-full space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 id="help-modal-title" className="font-bold text-sm text-slate-900">{t("app.help")}</h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-[4px] hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs leading-relaxed text-slate-600">
              <p>
                <strong className="text-slate-900">MozhiMatch</strong> helps bilingual examination editors inspect practice
                questions in English and Tamil side-by-side.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-slate-800">CSV Batch Import:</strong> Upload up to 10 questions at once via CSV with full
                  Unicode Tamil support and live validation preview.
                </li>
                <li>
                  <strong className="text-slate-800">Structural checks:</strong> Inspects option counts, labels, numeric
                  tokens, and units deterministically with zero paid API usage.
                </li>
                <li>
                  <strong className="text-slate-800">Semantic checks:</strong> Analyzes meaning preservation, negation drops,
                  qualifiers, and answer position alignment using Google Gemini.
                </li>
                <li>
                  <strong className="text-slate-800">Exact evidence:</strong> Quotes literal strings from the original
                  sources with character-level accuracy.
                </li>
                <li>
                  <strong className="text-slate-800">Human decision:</strong> Mark each finding <em>Keep</em>, <em>Fix</em>, or{" "}
                  <em>Escalate</em>, and download a complete CSV report or copy the issue list.
                </li>
              </ul>
              <p className="text-slate-400 pt-2 border-t border-slate-100 text-[11px]">
                Privacy: Source text stays in browser memory unless cloud AI is explicitly
                consented.
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="h-8.5 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] transition-colors"
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
