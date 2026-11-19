"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  parseAndValidateCsv,
  generateCsvTemplate,
  generateSampleCsv,
  MAX_CSV_FILE_BYTES,
  CsvParseResult,
} from "../../lib/core/csv-import";
import { QuestionItem } from "../../lib/contracts/types";
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: QuestionItem[]) => void;
  hasExistingWork: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  hasExistingWork,
  t,
}) => {
  const [csvText, setCsvText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showConfirmReplace, setShowConfirmReplace] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setCsvText("");
    setFileName("");
    setParseResult(null);
    setFileError(null);
    setShowConfirmReplace(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleProcessText = (text: string, name: string) => {
    setCsvText(text);
    setFileName(name);
    setFileError(null);
    const result = parseAndValidateCsv(text);
    setParseResult(result);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_CSV_FILE_BYTES) {
      setFileError(
        `File size (${Math.round(file.size / 1024)} KB) exceeds the maximum allowed limit of 512 KB.`
      );
      setParseResult(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessText(text, file.name);
    };
    reader.onerror = () => {
      setFileError("Failed to read the selected file. Please verify encoding and try again.");
      setParseResult(null);
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleDownloadTemplate = () => {
    const templateContent = generateCsvTemplate();
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mozhimatch-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    const sampleContent = generateSampleCsv();
    handleProcessText(sampleContent, "sample-mcq-batch.csv");
  };

  const handleConfirmImport = () => {
    if (!parseResult || !parseResult.success || parseResult.validItems.length === 0) {
      return;
    }

    if (hasExistingWork && !showConfirmReplace) {
      setShowConfirmReplace(true);
      return;
    }

    onImport(parseResult.validItems);
    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="bg-white border-[1.5px] border-slate-900 rounded-[6px] shadow-2xl p-5 sm:p-6 max-w-4xl w-full space-y-4 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#2154F4]" />
            <h3 id="csv-import-title" className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
              Import Questions via CSV
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-[4px] hover:bg-slate-100 transition-colors"
            title={t("actions.cancel")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar: Template & Sample */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
          <div className="text-xs text-slate-600 font-medium">
            Upload CSV (1–10 questions, up to 512 KB, UTF-8 Tamil supported).
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="h-8 px-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-[6px] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Template</span>
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="h-8 px-2.5 text-xs font-bold text-slate-800 bg-[#EEF3FF] hover:bg-blue-100 border border-blue-200 rounded-[6px] flex items-center gap-1.5 transition-colors"
            >
              <span>Load Sample</span>
            </button>
          </div>
        </div>

        {/* File Drop / Select Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#2154F4] rounded-[6px] p-6 text-center cursor-pointer hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-1.5"
        >
          <Upload className="w-7 h-7 text-slate-400" />
          <div className="text-sm font-bold text-slate-800">
            {fileName ? (
              <span className="font-mono text-[#2154F4]">{fileName}</span>
            ) : (
              "Click to browse or drop your CSV file here"
            )}
          </div>
          <p className="text-xs text-slate-500">
            Supports UTF-8 Tamil characters, optional BOM, and multiline quoted text.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Global / File-level Error Banner */}
        {(fileError || (parseResult && parseResult.fileErrors.length > 0)) && (
          <div className="p-3 bg-[#FEF2F2] text-[#DC2626] border border-red-200 rounded-[6px] text-xs font-semibold space-y-1">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Import Validation Errors:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {fileError && <li>{fileError}</li>}
              {parseResult?.fileErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Batch Preview Table */}
        {parseResult && parseResult.rowPreviews.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                Batch Preview ({parseResult.rowPreviews.length} questions detected)
                {parseResult.success ? (
                  <span className="text-emerald-700 flex items-center gap-1 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid batch ready
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1 text-[11px] font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Correct errors below
                  </span>
                )}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-300 rounded-[6px]">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white font-mono sticky top-0 text-[11px]">
                  <tr>
                    <th className="p-2 border-r border-slate-700">#</th>
                    <th className="p-2 border-r border-slate-700">ID</th>
                    <th className="p-2 border-r border-slate-700">English Stem</th>
                    <th className="p-2 border-r border-slate-700 font-tamil">Tamil Stem</th>
                    <th className="p-2 border-r border-slate-700 text-center">Options</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {parseResult.rowPreviews.map((row) => {
                    const hasErr = row.errors.length > 0;
                    return (
                      <tr
                        key={row.rowNumber}
                        className={hasErr ? "bg-red-50/80" : "hover:bg-slate-50"}
                      >
                        <td className="p-2 font-mono text-slate-500 border-r border-slate-200">
                          {row.rowNumber}
                        </td>
                        <td className="p-2 font-mono font-bold border-r border-slate-200 text-slate-900">
                          {row.id}
                        </td>
                        <td className="p-2 max-w-[200px] truncate border-r border-slate-200 text-slate-700" title={row.enStemSnippet}>
                          {row.enStemSnippet}
                        </td>
                        <td className="p-2 max-w-[200px] truncate font-tamil border-r border-slate-200 text-slate-700" title={row.taStemSnippet}>
                          {row.taStemSnippet}
                        </td>
                        <td className="p-2 text-center font-mono border-r border-slate-200">
                          <span className={row.enOptionCount !== row.taOptionCount ? "text-amber-700 font-bold" : "text-slate-600"}>
                            {row.enOptionCount} EN / {row.taOptionCount} TA
                            {row.enOptionCount !== row.taOptionCount && " ⚠️"}
                          </span>
                        </td>
                        <td className="p-2">
                          {hasErr ? (
                            <div className="text-red-700 space-y-0.5 text-[11px]">
                              {row.errors.map((e, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>{e}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Existing Work Confirmation Box */}
        {showConfirmReplace && (
          <div className="p-3.5 bg-[#FFFBEB] border border-amber-300 rounded-[6px] text-xs font-semibold text-[#B45309] space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
              <span>Confirm Batch Replacement</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              Importing these {parseResult?.validItems.length} questions will replace current workbench
              questions and clear any previous analysis results or decisions.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmReplace(false)}
                className="h-8 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="h-8 px-3 text-xs font-bold bg-[#2154F4] hover:bg-[#1D4ED8] text-white rounded-[6px] transition-colors"
              >
                Yes, Replace & Import
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <div className="text-[11px] text-slate-500">
            Loads questions into editor; does not trigger automatic cloud AI.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="h-8.5 px-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-[6px] transition-colors"
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              disabled={!parseResult || !parseResult.success || parseResult.validItems.length === 0}
              onClick={handleConfirmImport}
              className="neobrutal-btn neobrutal-btn-primary h-8.5 px-4 text-xs font-bold text-white bg-[#2154F4] hover:bg-[#1D4ED8] rounded-[6px] border border-slate-900 shadow-[1.5px_1.5px_0_#0F172A] disabled:opacity-50 transition-all"
            >
              Import {parseResult?.validItems.length ? `${parseResult.validItems.length} Questions` : "Batch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
