"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import {
  X,
  QrCode as QrCodeIcon,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Tag,
} from "lucide-react";
import type { WeddingGuest } from "@/types";

interface GuestQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: WeddingGuest | null;
  url: string;
}

const emptySubscribe = () => () => {};

export function GuestQrModal({
  isOpen,
  onClose,
  guest,
  url,
}: GuestQrModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const t = useTranslations("dashboard.editor.rsvp");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate QR code data URL whenever URL changes (using High error correction for center logo)
  useEffect(() => {
    if (!isOpen || !url) return;
    let cancelled = false;

    QRCode.toDataURL(url, {
      width: 440,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#2a1a12",
        light: "#ffffff",
      },
    }).then((res) => {
      if (!cancelled) setDataUrl(res);
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, url]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !guest || !mounted) return null;

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementById("portal-root") || document.body
      : null;

  if (!portalTarget) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("copyLink"), url);
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: guest?.name ? `${guest.name} - Wedding Invitation` : "Wedding Invitation",
          text: `Wedding Invitation for ${guest?.name}`,
          url,
        });
        return;
      } catch {
        // User cancelled or share dismissed; fallback to copy
      }
    }
    // Fallback: Copy link
    handleCopy();
  }

  async function handleDownload() {
    if (!guest || !url) return;
    setDownloading(true);

    try {
      // Create high-res card on an off-screen canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const width = 640;
      const height = 840;
      canvas.width = width;
      canvas.height = height;

      // 1. Background
      ctx.fillStyle = "#fdf8f0";
      ctx.fillRect(0, 0, width, height);

      // 2. Elegant double borders in gold
      ctx.strokeStyle = "#c9a24b";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = "#e6cd8a";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // 3. Top Title / Wedding Badge
      ctx.textAlign = "center";
      ctx.fillStyle = "#7a1f2b";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("WEDDING INVITATION", width / 2, 75);

      // Divider line
      ctx.strokeStyle = "#c9a24b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 80, 92);
      ctx.lineTo(width / 2 + 80, 92);
      ctx.stroke();

      // 4. Guest Name
      ctx.fillStyle = "#7a1f2b";
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(guest.name, width / 2, 140);

      // 5. Optional Host / Location info
      if (guest.from || guest.by) {
        ctx.fillStyle = "#8a6d3b";
        ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const meta = [guest.from, guest.by ? `By: ${guest.by}` : null]
          .filter(Boolean)
          .join("  •  ");
        ctx.fillText(meta, width / 2, 172);
      }

      // 6. Draw QR Code in Center
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 380,
        margin: 1,
        errorCorrectionLevel: "H",
        color: { dark: "#2a1a12", light: "#ffffff" },
      });

      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });

      // White card behind QR with gold border
      const qrX = width / 2 - 190;
      const qrY = 210;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 10, qrY - 10, 400, 400);

      ctx.strokeStyle = "#c9a24b";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 10, qrY - 10, 400, 400);

      ctx.drawImage(qrImg, qrX, qrY, 380, 380);

      // 7. Draw Circular Center Logo on QR Code
      const centerX = width / 2;
      const centerY = qrY + 190;
      const logoRadius = 32;

      ctx.save();
      // White circle background with gold ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, logoRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#c9a24b";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw emblem inside circle
      try {
        const logoImg = new Image();
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = reject;
          logoImg.src = "/images/Frame_1.png";
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, logoRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(
          logoImg,
          centerX - logoRadius,
          centerY - logoRadius,
          logoRadius * 2,
          logoRadius * 2
        );
      } catch {
        // Fallback: graceful without image
      }
      ctx.restore();

      // 8. Footer Instructions
      ctx.fillStyle = "#7a1f2b";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("Scan with Camera to Open Invitation", width / 2, 665);

      ctx.fillStyle = "#8a6d3b";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("សូមស្កេនដើម្បីបើកមើលសំបុត្រអញ្ជើញ", width / 2, 695);

      // Convert to blob and download
      const safeName = (guest.name || "guest")
        .toLowerCase()
        .replace(/[^a-z0-9_\u1780-\u17FF]/gi, "_");
      const downloadUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${safeName}-invitation-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback: download raw QR image if canvas fails
      if (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${guest.name || "guest"}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setDownloading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog with responsive spacing for all mobile viewports */}
      <div className="relative z-10 w-full max-w-[400px] my-auto max-h-[90dvh] overflow-y-auto rounded-3xl border border-gold/40 dark:border-gold/30 bg-cream dark:bg-[#1c161b] p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gold/25 dark:border-gold/20 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gold/15 dark:bg-gold/20 text-maroon dark:text-[#f6eee8]">
              <QrCodeIcon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </span>
            <h3 className="font-[family-name:var(--font-heading-km)] text-sm sm:text-base font-bold text-maroon dark:text-[#f6eee8]">
              {t("qrModalTitle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-maroon/60 dark:text-[#f6eee8]/60 hover:bg-gold/15 hover:text-maroon dark:hover:text-[#f6eee8] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body with comfortable vertical spacing */}
        <div className="mt-3 sm:mt-5 flex flex-col items-center text-center">
          {/* Guest Name */}
          <span className="font-[family-name:var(--font-heading-km)] text-lg sm:text-2xl font-bold text-maroon dark:text-[#f6eee8]">
            {guest.name}
          </span>

          {/* Location and Host tags */}
          {(guest.from || guest.by) && (
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
              {guest.from && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-maroon/70 dark:text-[#f6eee8]/70">
                  <MapPin className="h-3 w-3 text-gold" />
                  <span>{guest.from}</span>
                </span>
              )}
              {guest.by && (
                <span className="inline-flex items-center gap-1 rounded-md border border-gold/30 dark:border-gold/20 bg-gold/10 dark:bg-gold/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-maroon dark:text-[#f6eee8]">
                  <Tag className="h-2.5 w-2.5 text-gold" />
                  <span>{guest.by}</span>
                </span>
              )}
            </div>
          )}

          {/* QR Code Container with Centered Circle Logo (keep white for contrast/scannability) */}
          <div className="relative mt-3 mb-2 rounded-2xl sm:rounded-3xl border border-gold/30 bg-white p-2.5 sm:p-3.5 shadow-sm">
            {dataUrl ? (
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl}
                  alt={`QR code for ${guest.name}`}
                  width={200}
                  height={200}
                  className="h-[180px] w-[180px] sm:h-[220px] sm:w-[220px] object-contain rounded-lg sm:rounded-xl"
                />

                {/* Center Circle Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-gold/70 bg-white p-1 sm:p-1.5 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/Frame_1.png"
                      alt="Logo"
                      className="h-full w-full object-contain rounded-full"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[180px] w-[180px] sm:h-[220px] sm:w-[220px] animate-pulse rounded-xl bg-gold/15" />
            )}
          </div>

          {/* Scan instruction subtitle */}
          <p className="mt-1 text-[11px] sm:text-xs font-medium text-maroon/65 dark:text-[#f6eee8]/70 max-w-[280px] leading-relaxed">
            {t("qrModalSubtitle")}
          </p>

          {/* Link box with 1-click copy */}
          <div className="mt-3 flex w-full items-center gap-2 rounded-xl sm:rounded-2xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#20181e] px-3 py-2 shadow-2xs">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full text-ellipsis overflow-hidden font-mono text-[11px] sm:text-xs text-maroon/80 dark:text-[#f6eee8]/85 outline-none select-all bg-transparent"
            />
            <button
              type="button"
              onClick={handleCopy}
              title={t("copyLink")}
              className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-colors cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-gold/15 dark:bg-gold/20 text-maroon dark:text-[#f6eee8] hover:bg-gold/30"
              }`}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Link"
              className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gold/15 dark:bg-gold/20 text-maroon dark:text-[#f6eee8] hover:bg-gold/30 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Action Buttons: Download QR & Share */}
          <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex h-10 sm:h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-maroon dark:bg-gold px-3 sm:px-4 text-xs font-bold text-cream dark:text-maroon shadow-xs hover:bg-maroon/90 dark:hover:bg-gold/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{downloading ? "…" : t("downloadQr")}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex h-10 sm:h-11 items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-3 sm:px-4 text-xs font-bold text-maroon dark:text-[#f6eee8] shadow-xs hover:bg-gold/15 dark:hover:bg-gold/20 transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold" />
              <span>{t("shareQr")}</span>
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>,
    portalTarget
  );
}
