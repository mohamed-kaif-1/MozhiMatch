"use client";

import React, { useState, useRef } from "react";
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

  const handleClose = () => {
    setCsvText("");
    setFileName("");
    setParseResult(null);
    setFileError(null);
    setShowConfirmReplace(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="paper-panel p-6 max-w-4xl w-full bg-white space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-[#2154F4]" />
            <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
              Import Questions via CSV
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t("actions.cancel")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar: Template & Sample */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FFFDF5] border border-black">
          <div className="text-xs text-gray-700 font-medium">
            Upload a CSV file (1–10 questions, up to 512 KB, UTF-8 encoded).
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="neobrutal-btn text-xs px-3 py-1.5 flex items-center gap-1.5 bg-white min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
            <button
              type="button"
              onClick={handleLoadSample}
              className="neobrutal-btn text-xs px-3 py-1.5 flex items-center gap-1.5 bg-[#FFE066] text-black min-h-[44px]"
            >
              Load Sample Batch
            </button>
          </div>
        </div>

        {/* File Drop / Select Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black p-6 text-center cursor-pointer hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center gap-2"
        >
          <Upload className="w-8 h-8 text-gray-600" />
          <div className="text-sm font-bold text-gray-800">
            {fileName ? (
              <span className="font-mono text-[#2154F4]">{fileName}</span>
            ) : (
              "Click to browse or drop your question CSV file here"
            )}
          </div>
          <p className="text-xs text-gray-500">
            Supports UTF-8 Tamil characters, optional BOM, and multiline text.
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
          <div className="p-3 bg-[#FFE0DB] text-[#8A241A] border-2 border-black text-xs font-semibold space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Import Validation Errors:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {fileError && <li>{fileError}</li>}
              {parseResult?.fileErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Batch Preview Table */}
        {parseResult && parseResult.rowPreviews.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span className="flex items-center gap-2">
                Batch Preview ({parseResult.rowPreviews.length} questions detected)
                {parseResult.success ? (
                  <span className="text-green-700 flex items-center gap-1 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid batch ready to import
                  </span>
                ) : (
                  <span className="text-red-700 flex items-center gap-1 text-[11px] font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Please correct the errors below
                  </span>
                )}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto border-2 border-black">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#171717] text-white font-mono sticky top-0">
                  <tr>
                    <th className="p-2 border-r border-gray-700">#</th>
                    <th className="p-2 border-r border-gray-700">ID</th>
                    <th className="p-2 border-r border-gray-700">English Stem</th>
                    <th className="p-2 border-r border-gray-700 font-tamil">Tamil Stem</th>
                    <th className="p-2 border-r border-gray-700 text-center">Options</th>
                    <th className="p-2">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 bg-white">
                  {parseResult.rowPreviews.map((row) => {
                    const hasErr = row.errors.length > 0;
                    return (
                      <tr
                        key={row.rowNumber}
                        className={hasErr ? "bg-red-50" : "hover:bg-gray-50"}
                      >
                        <td className="p-2 font-mono text-gray-500 border-r border-gray-200">
                          {row.rowNumber}
                        </td>
                        <td className="p-2 font-mono font-bold border-r border-gray-200">
                          {row.id}
                        </td>
                        <td className="p-2 max-w-[200px] truncate border-r border-gray-200" title={row.enStemSnippet}>
                          {row.enStemSnippet}
                        </td>
                        <td className="p-2 max-w-[200px] truncate font-tamil border-r border-gray-200" title={row.taStemSnippet}>
                          {row.taStemSnippet}
                        </td>
                        <td className="p-2 text-center font-mono border-r border-gray-200">
                          <span className={row.enOptionCount !== row.taOptionCount ? "text-amber-700 font-bold" : ""}>
                            {row.enOptionCount} EN / {row.taOptionCount} TA
                            {row.enOptionCount !== row.taOptionCount && " ⚠️"}
                          </span>
                        </td>
                        <td className="p-2">
                          {hasErr ? (
                            <div className="text-red-700 space-y-0.5 font-medium">
                              {row.errors.map((e, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3 shrink-0" />
                                  <span>{e}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-700 font-semibold flex items-center gap-1">
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
          <div className="p-4 bg-[#FFF0B3] border-2 border-black text-xs font-semibold text-[#654800] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Confirm Batch Replacement</span>
            </div>
            <p>
              Importing these {parseResult?.validItems.length} questions will replace current workbench
              questions and clear any previous analysis results or decisions.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmReplace(false)}
                className="neobrutal-btn bg-white text-black px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="neobrutal-btn bg-[#2154F4] text-white px-3 py-1.5 font-bold"
              >
                Yes, Replace & Import
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t-2 border-black pt-3">
          <div className="text-[11px] text-gray-500">
            Note: Importing questions loads them into the editor; it does not trigger automatic AI calls.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="neobrutal-btn text-xs px-4 py-2 min-h-[44px]"
            >
              {t("actions.cancel")}
            </button>
            <button
              type="button"
              disabled={!parseResult || !parseResult.success || parseResult.validItems.length === 0}
              onClick={handleConfirmImport}
              className="neobrutal-btn neobrutal-btn-primary text-xs px-5 py-2 font-bold disabled:opacity-50 min-h-[44px]"
            >
              Import {parseResult?.validItems.length ? `${parseResult.validItems.length} Questions` : "Batch"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
