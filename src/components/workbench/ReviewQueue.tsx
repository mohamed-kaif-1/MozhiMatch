"use client";

import React, { useState, useEffect } from "react";
import { QuestionItem, AnalyzeResponse, ReviewDecisionType } from "../../lib/contracts/types";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileQuestion,
  Filter,
  X,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export type StatusFilter =
  | "all"
  | "meaning_changed"
  | "needs_review"
  | "no_issue_found"
  | "editing";

interface ReviewQueueProps {
  items: QuestionItem[];
  activeItemId: string;
  analysisResponse: AnalyzeResponse | null;
  decisions: Record<string, Record<string, ReviewDecisionType>>;
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onImportClick?: () => void;
  activeFilter?: StatusFilter;
  onFilterChange?: (filter: StatusFilter) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  items,
  activeItemId,
  analysisResponse,
  decisions,
  onSelectItem,
  onAddItem,
  onRemoveItem,
  onImportClick,
  activeFilter: controlledFilter,
  onFilterChange,
  t,
}) => {
  const [internalFilter, setInternalFilter] = useState<StatusFilter>("all");
  const filter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const setFilter = (newFilter: StatusFilter) => {
    if (onFilterChange) onFilterChange(newFilter);
    else setInternalFilter(newFilter);
  };

  const getItemStatus = (id: string): "meaning_changed" | "needs_review" | "no_issue_found" | "editing" => {
    if (!analysisResponse) return "editing";
    const found = analysisResponse.items.find((i) => i.id === id);
    return found ? found.status : "editing";
  };

  // Derive counts dynamically from current items and analysis response
  const counts = {
    total: items.length,
    editing: 0,
    meaning_changed: 0,
    needs_review: 0,
    no_issue_found: 0,
    structuralFlags: 0,
  };

  items.forEach((item) => {
    const status = getItemStatus(item.id);
    counts[status]++;
    if (analysisResponse) {
      const found = analysisResponse.items.find((i) => i.id === item.id);
      if (found && found.structuralFindings.length > 0) {
        counts.structuralFlags++;
      }
    }
  });

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return getItemStatus(item.id) === filter;
  });

  // If the active item is filtered out and items exist in the filtered list, select the first visible item
  useEffect(() => {
    if (filteredItems.length > 0 && !filteredItems.some((i) => i.id === activeItemId)) {
      onSelectItem(filteredItems[0].id);
    }
  }, [filter, filteredItems, activeItemId, onSelectItem]);

  const canAddItem = items.length < 10;
  const canRemoveItem = items.length > 1;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "meaning_changed":
        return <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />;
      case "no_issue_found":
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#047857] shrink-0" />;
      case "needs_review":
        return <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />;
      default:
        return <FileQuestion className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "meaning_changed":
        return (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#FEF2F2] text-[#DC2626] border border-red-200 uppercase tracking-tight">
            CHANGED
          </span>
        );
      case "no_issue_found":
        return (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#ECFDF5] text-[#047857] border border-emerald-200 uppercase tracking-tight">
            CLEAN
          </span>
        );
      case "needs_review":
        return (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#FFFBEB] text-[#B45309] border border-amber-200 uppercase tracking-tight">
            REVIEW
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] bg-[#F1F5F9] text-[#475569] border border-slate-200 uppercase tracking-tight">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F8FAFC] border-[1.5px] border-slate-900 rounded-[6px] p-3 sm:p-3.5 space-y-3">
      {/* Queue Header with Total & Import/Add buttons */}
      <div className="space-y-2 border-b border-slate-200 pb-2.5">
        {/* Row 1: Title and Question Counter */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Layers className="w-4 h-4 text-[#2154F4] shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 truncate">
              Question Batch
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-500 font-semibold shrink-0">
            ({items.length}/10)
          </span>
        </div>

        {/* Row 2: Action Buttons in 2-column Grid */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
          {onImportClick && (
            <button
              type="button"
              onClick={onImportClick}
              className={`h-8 px-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] flex items-center justify-center gap-1.5 transition-colors min-w-0 ${
                !canAddItem ? "col-span-2" : ""
              }`}
              title="Import CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2154F4] shrink-0" />
              <span className="truncate">Import CSV</span>
            </button>
          )}

          {canAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className={`h-8 px-2 text-xs font-bold text-white bg-[#2154F4] hover:bg-[#1D4ED8] border border-slate-900 rounded-[6px] shadow-[1.5px_1.5px_0_#0F172A] flex items-center justify-center gap-1.5 transition-all min-w-0 ${
                !onImportClick ? "col-span-2" : ""
              }`}
              title={t("editor.addItem")}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Summary Counters & Filter Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter status
          </span>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-[10px] text-[#1435AD] font-bold hover:underline flex items-center gap-0.5"
            >
              <X className="w-2.5 h-2.5" /> Clear
            </button>
          )}
        </div>

        {/* Compact Status Filter Strip */}
        <div className="grid grid-cols-5 gap-1 text-center">
          {/* All */}
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`py-1 px-1 rounded-[4px] border text-[10px] transition-all flex flex-col items-center justify-center ${
              filter === "all"
                ? "bg-slate-900 text-white border-slate-900 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium"
            }`}
          >
            <span className="uppercase text-[9px] tracking-tight">ALL</span>
            <span className="font-mono text-xs font-bold leading-none mt-0.5">{counts.total}</span>
          </button>

          {/* Changed */}
          <button
            type="button"
            onClick={() => setFilter("meaning_changed")}
            className={`py-1 px-1 rounded-[4px] border text-[10px] transition-all flex flex-col items-center justify-center ${
              filter === "meaning_changed"
                ? "bg-[#FEF2F2] text-[#DC2626] border-red-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-red-50/50 font-medium"
            }`}
          >
            <span className="uppercase text-[9px] tracking-tight">DIFF</span>
            <span className="font-mono text-xs font-bold leading-none mt-0.5 text-[#DC2626]">
              {counts.meaning_changed}
            </span>
          </button>

          {/* Review */}
          <button
            type="button"
            onClick={() => setFilter("needs_review")}
            className={`py-1 px-1 rounded-[4px] border text-[10px] transition-all flex flex-col items-center justify-center ${
              filter === "needs_review"
                ? "bg-[#FFFBEB] text-[#B45309] border-amber-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50/50 font-medium"
            }`}
          >
            <span className="uppercase text-[9px] tracking-tight">REV</span>
            <span className="font-mono text-xs font-bold leading-none mt-0.5 text-[#B45309]">
              {counts.needs_review}
            </span>
          </button>

          {/* Clean */}
          <button
            type="button"
            onClick={() => setFilter("no_issue_found")}
            className={`py-1 px-1 rounded-[4px] border text-[10px] transition-all flex flex-col items-center justify-center ${
              filter === "no_issue_found"
                ? "bg-[#ECFDF5] text-[#047857] border-emerald-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50/50 font-medium"
            }`}
          >
            <span className="uppercase text-[9px] tracking-tight">CLN</span>
            <span className="font-mono text-xs font-bold leading-none mt-0.5 text-[#047857]">
              {counts.no_issue_found}
            </span>
          </button>

          {/* Draft */}
          <button
            type="button"
            onClick={() => setFilter("editing")}
            className={`py-1 px-1 rounded-[4px] border text-[10px] transition-all flex flex-col items-center justify-center ${
              filter === "editing"
                ? "bg-slate-200 text-slate-900 border-slate-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 font-medium"
            }`}
          >
            <span className="uppercase text-[9px] tracking-tight">DRF</span>
            <span className="font-mono text-xs font-bold leading-none mt-0.5 text-slate-700">
              {counts.editing}
            </span>
          </button>
        </div>

        {/* Structural Differences Notice */}
        {counts.structuralFlags > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#B45309] bg-[#FFFBEB] p-2 rounded-[4px] border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="leading-tight">
              <strong>{counts.structuralFlags}</strong> question{counts.structuralFlags > 1 ? "s" : ""} have structural differences.
            </span>
          </div>
        )}
      </div>

      {/* Stacked Question List */}
      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-260px)] overflow-y-auto rail-scroll pr-0.5">
        {filteredItems.length === 0 ? (
          <div className="p-4 border border-dashed border-slate-300 rounded-[6px] text-center space-y-1.5 bg-white">
            <p className="text-xs text-slate-500 font-medium">
              No questions match ({filter}).
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-xs font-bold text-[#1435AD] hover:underline"
            >
              Show all ({items.length})
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isActive = item.id === activeItemId;
            const status = getItemStatus(item.id);
            const itemDecisions = decisions[item.id] || {};
            const decisionCount = Object.keys(itemDecisions).length;
            const totalFields = 1 + item.en.options.length;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className={`p-2.5 rounded-[6px] cursor-pointer transition-all flex items-center justify-between ${
                  isActive
                    ? "bg-[#EEF3FF] border border-blue-200 border-l-[3.5px] border-l-[#2154F4] text-slate-900 shadow-sm"
                    : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getStatusIcon(status)}
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {decisionCount}/{totalFields} decided
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {getStatusBadge(status)}
                  {canRemoveItem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-[4px] hover:bg-red-50 transition-colors"
                      title={t("editor.removeItem")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
