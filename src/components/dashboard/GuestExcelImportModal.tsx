"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Download,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  parseGuestsFromExcel,
  downloadGuestExcelTemplate,
  type ParsedGuestRow,
} from "@/lib/excel";

interface GuestExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (guests: ParsedGuestRow[]) => Promise<void>;
}

export function GuestExcelImportModal({
  isOpen,
  onClose,
  onImport,
}: GuestExcelImportModalProps) {
  const t = useTranslations("dashboard.editor.rsvp");
  const tCommon = useTranslations("common");

  const [parsedRows, setParsedRows] = useState<ParsedGuestRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    try {
      const rows = await parseGuestsFromExcel(file);
      if (rows.length === 0) {
        setError(
          "No valid guest entries found in this file. Please ensure there is a 'Name' column.",
        );
        setParsedRows([]);
      } else {
        setParsedRows(rows);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file.");
      setParsedRows([]);
    }
  }

  async function handleConfirm() {
    if (parsedRows.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      await onImport(parsedRows);
      setParsedRows([]);
      setFileName(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import guests.");
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setParsedRows([]);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-gold/40 bg-cream p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <FileSpreadsheet size={18} />
            </span>
            <h3 className="font-[family-name:var(--font-heading-km)] text-base font-bold text-maroon">
              {t("importModalTitle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-maroon/60 hover:bg-gold/20 hover:text-maroon transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-maroon/70">{t("importModalDesc")}</p>

        {/* Template download link reminder */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gold/30 bg-white/70 px-3.5 py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-maroon/80">
            <Download className="h-4 w-4 text-gold" />
            <span>Need sample format?</span>
          </div>
          <button
            type="button"
            onClick={downloadGuestExcelTemplate}
            className="text-xs font-bold text-maroon underline hover:text-gold cursor-pointer"
          >
            {t("downloadTemplate")}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        {parsedRows.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/50 bg-white/60 p-8 text-center cursor-pointer hover:border-gold hover:bg-white/90 transition-all"
          >
            <UploadCloud className="h-10 w-10 text-gold mb-2" />
            <span className="text-xs font-bold text-maroon">
              {t("dragDropFile")}
            </span>
            <span className="mt-1 text-[11px] text-maroon/50">
              {t("supportedFormats")}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          /* Preview Parsed Rows */
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  {fileName ? `${fileName} • ` : ""}
                  {t("previewCount", { count: parsedRows.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-maroon/60 underline hover:text-maroon cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Preview Table */}
            <div className="max-h-48 overflow-y-auto rounded-xl border border-gold/30 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#2d4739] text-white">
                  <tr>
                    <th className="py-1.5 px-3 w-10 text-center">#</th>
                    <th className="py-1.5 px-3">Name</th>
                    <th className="py-1.5 px-3">From</th>
                    <th className="py-1.5 px-3 text-center">By</th>
                    <th className="py-1.5 px-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/15">
                  {parsedRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-cream/30">
                      <td className="py-1.5 px-3 text-center text-maroon/60">
                        {row.no ?? i + 1}
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-maroon">
                        {row.name}
                      </td>
                      <td className="py-1.5 px-3 text-maroon/70">
                        {row.from || "—"}
                      </td>
                      <td className="py-1.5 px-3 text-center text-maroon/70">
                        {row.by || "—"}
                      </td>
                      <td className="py-1.5 px-3 text-maroon/70">
                        {row.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 10 && (
              <p className="text-center text-[11px] text-maroon/50 italic">
                ...and {parsedRows.length - 10} more guests
              </p>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-gold/20 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="rounded-xl border border-gold/40 px-4 py-2 text-xs font-semibold text-maroon/70 hover:bg-gold/10 cursor-pointer"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={importing || parsedRows.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-maroon px-5 py-2 text-xs font-bold text-cream shadow-xs hover:bg-maroon/90 disabled:opacity-50 cursor-pointer"
          >
            <Users className="h-3.5 w-3.5" />
            <span>
              {importing
                ? "Importing…"
                : t("confirmImport", { count: parsedRows.length })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
