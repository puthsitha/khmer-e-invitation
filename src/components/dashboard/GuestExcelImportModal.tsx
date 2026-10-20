"use client";

import { useState, useRef, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  Download,
  AlertCircle,
  AlertTriangle,
  Users,
  Ban,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import {
  parseGuestsFromExcel,
  downloadGuestExcelTemplate,
  type ParsedGuestRow,
} from "@/lib/excel";
import { analyzeImportRows, type ProcessedImportRow } from "@/lib/guestValidation";
import type { WeddingGuest } from "@/types";

interface GuestExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    guestsToCreate: ParsedGuestRow[],
    guestsToReplace?: Array<{
      guestId: string;
      data: {
        name: string;
        from?: string;
        by?: string;
        note?: string;
      };
    }>,
  ) => Promise<void>;
  existingGuests?: WeddingGuest[];
}

const emptySubscribe = () => () => {};

export function GuestExcelImportModal({
  isOpen,
  onClose,
  onImport,
  existingGuests = [],
}: GuestExcelImportModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const t = useTranslations("dashboard.editor.rsvp");
  const tCommon = useTranslations("common");

  const [parsedRows, setParsedRows] = useState<ParsedGuestRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<
    "skip" | "replace" | "force"
  >("skip");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Analyze parsed rows for duplicates against existing guests and intra-file
  const analysis = useMemo(() => {
    if (parsedRows.length === 0) {
      return { items: [] as ProcessedImportRow[], duplicateCount: 0, newCount: 0 };
    }
    return analyzeImportRows(parsedRows, existingGuests);
  }, [parsedRows, existingGuests]);

  if (!isOpen || !mounted) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    setDuplicateStrategy("skip");

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
      if (duplicateStrategy === "skip") {
        const toCreate = analysis.items
          .filter((it) => !it.isDuplicate)
          .map((it) => it.row);
        if (toCreate.length === 0) {
          setError(
            "All guests in this file already exist in your list. Choose 'Replace' or 'Force Add' to proceed.",
          );
          setImporting(false);
          return;
        }
        await onImport(toCreate);
      } else if (duplicateStrategy === "replace") {
        const toCreate = analysis.items
          .filter((it) => !it.isDuplicate)
          .map((it) => it.row);
        const toReplace = analysis.items
          .filter((it) => it.matchedExistingGuest)
          .map((it) => ({
            guestId: it.matchedExistingGuest!.guestId,
            data: {
              name: it.row.name,
              from: it.row.from,
              by: it.row.by,
              note: it.row.note,
            },
          }));
        await onImport(toCreate, toReplace);
      } else {
        // "force": add all rows as new
        await onImport(parsedRows);
      }

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
    setDuplicateStrategy("skip");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementById("portal-root") || document.body
      : null;

  if (!portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl my-auto max-h-[90dvh] overflow-y-auto rounded-3xl border border-gold/40 dark:border-gold/30 bg-cream dark:bg-[#1c161b] p-5 sm:p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gold/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <FileSpreadsheet size={18} />
            </span>
            <h3 className="font-[family-name:var(--font-heading-km)] text-base font-bold text-maroon dark:text-[#f6eee8]">
              {t("importModalTitle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-maroon/60 dark:text-[#f6eee8]/60 hover:bg-gold/20 hover:text-maroon dark:hover:text-[#f6eee8] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-maroon/70 dark:text-[#f6eee8]/70">{t("importModalDesc")}</p>

        {/* Template download link reminder */}
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gold/30 dark:border-gold/20 bg-white/70 dark:bg-white/5 px-3.5 py-2">
          <div className="flex items-center gap-2 text-xs font-medium text-maroon/80 dark:text-[#f6eee8]/80">
            <Download className="h-4 w-4 text-gold" />
            <span>Need sample format?</span>
          </div>
          <button
            type="button"
            onClick={downloadGuestExcelTemplate}
            className="text-xs font-bold text-maroon dark:text-[#f6eee8] underline hover:text-gold dark:hover:text-gold cursor-pointer"
          >
            {t("downloadTemplate")}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        {parsedRows.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gold/50 dark:border-gold/30 bg-white/60 dark:bg-white/5 p-8 text-center cursor-pointer hover:border-gold hover:bg-white/90 dark:hover:bg-white/10 transition-all"
          >
            <UploadCloud className="h-10 w-10 text-gold mb-2" />
            <span className="text-xs font-bold text-maroon dark:text-[#f6eee8]">
              {t("dragDropFile")}
            </span>
            <span className="mt-1 text-[11px] text-maroon/50 dark:text-[#f6eee8]/50">
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
          /* Preview Parsed Rows & Duplicate Resolution */
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {fileName ? `${fileName} • ` : ""}
                  {t("previewCount", { count: parsedRows.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-maroon/60 dark:text-[#f6eee8]/60 underline hover:text-maroon dark:hover:text-[#f6eee8] cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Duplicate Notice & Options if duplicates detected */}
            {analysis.duplicateCount > 0 && (
              <div className="flex flex-col gap-2 rounded-2xl border border-amber-300 dark:border-amber-600/40 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 shadow-2xs">
                <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-xs">
                      {t("duplicateWarningTitle")}
                    </span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      {t("duplicateExcelWarning", {
                        count: analysis.duplicateCount,
                      })}
                    </p>
                  </div>
                </div>

                {/* 3 Resolution Options: Don't Add (Skip), Replace, Force Add */}
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Don't Add / Skip */}
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("skip")}
                    className={`flex flex-col gap-1 rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                      duplicateStrategy === "skip"
                        ? "border-maroon dark:border-gold bg-white dark:bg-[#20181e] shadow-2xs ring-2 ring-maroon/15 dark:ring-gold/20"
                        : "border-gold/30 dark:border-gold/20 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-[#20181e]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-maroon dark:text-[#f6eee8]">
                      <Ban className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{t("dontAdd")}</span>
                    </div>
                    <span className="text-[10px] text-maroon/60 dark:text-[#f6eee8]/60">
                      Skip {analysis.duplicateCount} duplicate(s)
                    </span>
                  </button>

                  {/* Option 2: Replace */}
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("replace")}
                    className={`flex flex-col gap-1 rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                      duplicateStrategy === "replace"
                        ? "border-amber-600 bg-white dark:bg-[#20181e] shadow-2xs ring-2 ring-amber-600/15"
                        : "border-gold/30 dark:border-gold/20 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-[#20181e]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 dark:text-amber-300">
                      <RefreshCw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{t("replace")}</span>
                    </div>
                    <span className="text-[10px] text-maroon/60 dark:text-[#f6eee8]/60">
                      Update {analysis.duplicateCount} existing
                    </span>
                  </button>

                  {/* Option 3: Force Add */}
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("force")}
                    className={`flex flex-col gap-1 rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                      duplicateStrategy === "force"
                        ? "border-maroon dark:border-gold bg-white dark:bg-[#20181e] shadow-2xs ring-2 ring-maroon/15 dark:ring-gold/20"
                        : "border-gold/30 dark:border-gold/20 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-[#20181e]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-maroon dark:text-[#f6eee8]">
                      <UserPlus className="h-3.5 w-3.5 text-maroon dark:text-gold" />
                      <span>{t("forceAdd")}</span>
                    </div>
                    <span className="text-[10px] text-maroon/60 dark:text-[#f6eee8]/60">
                      Add all {parsedRows.length} as new
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="max-h-52 overflow-y-auto rounded-xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#20181e] shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#2d4739] dark:bg-[#1a2e23] text-white">
                  <tr>
                    <th className="py-1.5 px-3 w-10 text-center">#</th>
                    <th className="py-1.5 px-3">Name</th>
                    <th className="py-1.5 px-3">From</th>
                    <th className="py-1.5 px-3 text-center">By</th>
                    <th className="py-1.5 px-3">Note</th>
                    <th className="py-1.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/15 dark:divide-gold/10">
                  {analysis.items.slice(0, 15).map((item, i) => (
                    <tr
                      key={i}
                      className={
                        item.isDuplicate
                          ? "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          : "hover:bg-cream/30 dark:hover:bg-white/5"
                      }
                    >
                      <td className="py-1.5 px-3 text-center text-maroon/60 dark:text-[#f6eee8]/60">
                        {item.row.no ?? i + 1}
                      </td>
                      <td className="py-1.5 px-3 font-semibold text-maroon dark:text-[#f6eee8]">
                        {item.row.name}
                      </td>
                      <td className="py-1.5 px-3 text-maroon/70 dark:text-[#f6eee8]/70">
                        {item.row.from || "—"}
                      </td>
                      <td className="py-1.5 px-3 text-center text-maroon/70 dark:text-[#f6eee8]/70">
                        {item.row.by || "—"}
                      </td>
                      <td className="py-1.5 px-3 text-maroon/70 dark:text-[#f6eee8]/70">
                        {item.row.note || "—"}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {item.isDuplicate ? (
                          <span className="inline-block rounded-full border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            {t("badgeDuplicate")}
                          </span>
                        ) : (
                          <span className="inline-block rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            {t("badgeNew")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 15 && (
              <p className="text-center text-[11px] text-maroon/50 dark:text-[#f6eee8]/50 italic">
                ...and {parsedRows.length - 15} more guests
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
            className="rounded-xl border border-gold/40 dark:border-gold/30 px-4 py-2 text-xs font-semibold text-maroon/70 dark:text-[#f6eee8]/70 hover:bg-gold/10 hover:text-maroon dark:hover:text-[#f6eee8] cursor-pointer"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={importing || parsedRows.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-maroon dark:bg-gold px-5 py-2 text-xs font-bold text-cream dark:text-maroon shadow-xs hover:bg-maroon/90 dark:hover:bg-gold/90 disabled:opacity-50 cursor-pointer"
          >
            <Users className="h-3.5 w-3.5" />
            <span>
              {importing
                ? "Importing…"
                : duplicateStrategy === "skip" && analysis.duplicateCount > 0
                  ? `Import ${analysis.newCount} New Guests`
                  : duplicateStrategy === "replace" && analysis.duplicateCount > 0
                    ? `Import (${analysis.newCount} New, ${analysis.duplicateCount} Replace)`
                    : duplicateStrategy === "force" && analysis.duplicateCount > 0
                      ? `Force Import All (${parsedRows.length})`
                      : t("confirmImport", { count: parsedRows.length })}
            </span>
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
}
