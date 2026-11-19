"use client";

import React from "react";
import { QuestionItem, AnalyzeResponse, ReviewDecisionType } from "../../lib/contracts/types";
import { Plus, Trash2, CheckCircle2, AlertTriangle, XCircle, FileQuestion } from "lucide-react";

interface ReviewQueueProps {
  items: QuestionItem[];
  activeItemId: string;
  analysisResponse: AnalyzeResponse | null;
  decisions: Record<string, Record<string, ReviewDecisionType>>;
  onSelectItem: (id: string) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
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
  t,
}) => {
  const canAddItem = items.length < 10;
  const canRemoveItem = items.length > 1;

  const getItemStatus = (id: string) => {
    if (!analysisResponse) return "editing";
    const found = analysisResponse.items.find((i) => i.id === id);
    return found ? found.status : "editing";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "meaning_changed":
        return <XCircle className="w-4 h-4 text-[#8A241A]" />;
      case "no_issue_found":
        return <CheckCircle2 className="w-4 h-4 text-[#18552C]" />;
      case "needs_review":
        return <AlertTriangle className="w-4 h-4 text-[#654800]" />;
      default:
        return <FileQuestion className="w-4 h-4 text-gray-400" />;
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
    <div className="paper-panel p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
          Questions Queue ({items.length}/10)
        </h3>
        {canAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            className="neobrutal-btn text-xs px-3 py-2 flex items-center justify-center gap-1 min-h-[44px]"
            title={t("editor.addItem")}
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = item.id === activeItemId;
          const status = getItemStatus(item.id);
          const itemDecisions = decisions[item.id] || {};
          const decisionCount = Object.keys(itemDecisions).length;
          const totalFields = 1 + item.en.options.length;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={`p-3 border-2 border-black cursor-pointer transition-all flex items-center justify-between ${
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
        })}
      </div>
    </div>
  );
};

