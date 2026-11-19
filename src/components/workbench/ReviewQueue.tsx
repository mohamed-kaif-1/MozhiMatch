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
        return <XCircle className="w-4 h-4 text-[#8A241A] shrink-0" />;
      case "no_issue_found":
        return <CheckCircle2 className="w-4 h-4 text-[#18552C] shrink-0" />;
      case "needs_review":
        return <AlertTriangle className="w-4 h-4 text-[#654800] shrink-0" />;
      default:
        return <FileQuestion className="w-4 h-4 text-gray-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "meaning_changed":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#FFE0DB] text-[#8A241A] border border-black uppercase">
            DIFF
          </span>
        );
      case "no_issue_found":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#D6F3DD] text-[#18552C] border border-black uppercase">
            CLEAN
          </span>
        );
      case "needs_review":
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#FFF0B3] text-[#654800] border border-black uppercase">
            REVIEW
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-black uppercase">
            READY
          </span>
        );
    }
  };

  return (
    <div className="paper-panel p-4 space-y-4 bg-white">
      {/* Queue Header with Total & Import/Add buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2154F4]" />
          <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
            Question Batch ({items.length}/10)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onImportClick && (
            <button
              type="button"
              onClick={onImportClick}
              className="neobrutal-btn text-xs px-3 py-2 flex items-center justify-center gap-1 min-h-[44px]"
            >
              Import CSV
            </button>
          )}

          {canAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className="neobrutal-btn neobrutal-btn-primary text-xs px-3 py-2 flex items-center justify-center gap-1 min-h-[44px]"
              title={t("editor.addItem")}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Batch Summary Counters & Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter by Status
          </span>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-[11px] text-[#2154F4] font-bold hover:underline flex items-center gap-0.5"
            >
              <X className="w-3 h-3" /> Clear Filter
            </button>
          )}
        </div>

        {/* Status Filter Buttons Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-semibold">
          {/* All */}
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`p-2 border-2 border-black flex flex-col items-center justify-center min-h-[44px] transition-all ${
              filter === "all" ? "bg-black text-white font-extrabold" : "bg-white hover:bg-gray-100"
            }`}
          >
            <span className="text-[10px] uppercase font-mono">All</span>
            <span className="text-sm font-bold">{counts.total}</span>
          </button>

          {/* Meaning Changed */}
          <button
            type="button"
            onClick={() => setFilter("meaning_changed")}
            className={`p-2 border-2 border-black flex flex-col items-center justify-center min-h-[44px] transition-all ${
              filter === "meaning_changed"
                ? "bg-[#FFE0DB] text-[#8A241A] font-extrabold ring-2 ring-black"
                : "bg-white hover:bg-red-50 text-gray-700"
            }`}
          >
            <span className="text-[10px] uppercase font-mono">Changed</span>
            <span className="text-sm font-bold text-[#8A241A]">{counts.meaning_changed}</span>
          </button>

          {/* Needs Review */}
          <button
            type="button"
            onClick={() => setFilter("needs_review")}
            className={`p-2 border-2 border-black flex flex-col items-center justify-center min-h-[44px] transition-all ${
              filter === "needs_review"
                ? "bg-[#FFF0B3] text-[#654800] font-extrabold ring-2 ring-black"
                : "bg-white hover:bg-amber-50 text-gray-700"
            }`}
          >
            <span className="text-[10px] uppercase font-mono">Review</span>
            <span className="text-sm font-bold text-[#654800]">{counts.needs_review}</span>
          </button>

          {/* Clean / No Issue */}
          <button
            type="button"
            onClick={() => setFilter("no_issue_found")}
            className={`p-2 border-2 border-black flex flex-col items-center justify-center min-h-[44px] transition-all ${
              filter === "no_issue_found"
                ? "bg-[#D6F3DD] text-[#18552C] font-extrabold ring-2 ring-black"
                : "bg-white hover:bg-green-50 text-gray-700"
            }`}
          >
            <span className="text-[10px] uppercase font-mono">Clean</span>
            <span className="text-sm font-bold text-[#18552C]">{counts.no_issue_found}</span>
          </button>

          {/* Unanalyzed / Draft */}
          <button
            type="button"
            onClick={() => setFilter("editing")}
            className={`p-2 border-2 border-black flex flex-col items-center justify-center min-h-[44px] col-span-2 sm:col-span-1 transition-all ${
              filter === "editing"
                ? "bg-gray-200 text-black font-extrabold ring-2 ring-black"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <span className="text-[10px] uppercase font-mono">Draft</span>
            <span className="text-sm font-bold">{counts.editing}</span>
          </button>
        </div>

        {/* Separate Structural Findings Advisory Indicator */}
        {counts.structuralFlags > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#654800] font-medium bg-[#FFFDF5] p-2 border border-black">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>{counts.structuralFlags}</strong> question{counts.structuralFlags > 1 ? "s" : ""} have structural differences (option counts, numerals, or units).
            </span>
          </div>
        )}
      </div>

      {/* Filtered Question List */}
      <div className="flex flex-col gap-2 pt-1">
        {filteredItems.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-gray-400 text-center space-y-2 bg-gray-50">
            <p className="text-xs text-gray-600 font-medium">
              No questions match the current filter (<strong>{filter}</strong>).
            </p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="neobrutal-btn text-xs px-3 py-1.5 min-h-[44px]"
            >
              Show All ({items.length})
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
                className={`p-3 border-2 border-black cursor-pointer transition-all flex items-center justify-between min-h-[44px] ${
                  isActive
                    ? "bg-[#FFE066] shadow-[3px_3px_0_#000] font-bold"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {getStatusIcon(status)}
                  <span className="font-mono text-sm font-bold truncate">{item.id}</span>
                  {getStatusBadge(status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-600">
                    {decisionCount}/{totalFields} decided
                  </span>
                  {canRemoveItem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
