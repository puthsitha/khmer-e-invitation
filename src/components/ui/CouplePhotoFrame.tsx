"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

export const DEFAULT_COUPLE_FRAME_URL = "/images/couple_frame.webp";

/**
 * Exact interior + frame midpoint contour for `/images/couple_frame.webp` (804x1024).
 * Ensures the couple's photo fills the entire ornate Khmer kbach opening while
 * its rectangular corners are clipped cleanly underneath the golden border.
 */
const DEFAULT_FRAME_CLIP_PATH =
  "polygon(50.0% 13.5%, 51.7% 13.7%, 51.9% 15.6%, 54.4% 17.6%, 57.5% 19.5%, 60.8% 21.5%, 63.9% 23.4%, 66.7% 25.4%, 69.0% 27.3%, 70.9% 29.3%, 72.3% 31.2%, 73.3% 33.2%, 73.9% 35.2%, 74.1% 37.1%, 73.9% 39.1%, 73.4% 41.0%, 72.4% 43.0%, 71.1% 44.9%, 69.8% 46.9%, 85.6% 48.8%, 87.3% 50.8%, 88.4% 52.7%, 89.4% 54.7%, 90.0% 56.6%, 90.5% 58.6%, 90.9% 60.5%, 91.2% 62.5%, 91.3% 64.5%, 91.3% 66.4%, 91.3% 68.4%, 90.9% 70.3%, 90.4% 72.3%, 89.8% 74.2%, 88.8% 76.2%, 87.6% 78.1%, 85.9% 80.1%, 83.8% 82.0%, 81.2% 84.0%, 77.5% 85.9%, 72.5% 87.9%, 64.3% 89.8%, 51.7% 91.8%, 50.0% 92.5%, 48.3% 91.8%, 34.8% 89.8%, 26.6% 87.9%, 21.6% 85.9%, 18.0% 84.0%, 15.3% 82.0%, 13.2% 80.1%, 11.6% 78.1%, 10.3% 76.2%, 9.3% 74.2%, 8.7% 72.3%, 8.2% 70.3%, 8.0% 68.4%, 7.8% 66.4%, 7.8% 64.5%, 8.0% 62.5%, 8.2% 60.5%, 8.6% 58.6%, 9.1% 56.6%, 9.8% 54.7%, 10.7% 52.7%, 11.9% 50.8%, 13.6% 48.8%, 29.4% 46.9%, 28.0% 44.9%, 26.7% 43.0%, 25.9% 41.0%, 25.2% 39.1%, 25.1% 37.1%, 25.2% 35.2%, 25.9% 33.2%, 26.9% 31.2%, 28.4% 29.3%, 30.2% 27.3%, 32.5% 25.4%, 35.2% 23.4%, 38.3% 21.5%, 41.7% 19.5%, 44.8% 17.6%, 47.3% 15.6%, 48.3% 13.7%)";

const maskCache = new Map<string, string>();

/**
 * Generates an interior mask Data URL for any custom transparent frame image by
 * flood-filling exterior transparency from the 4 edges of the image.
 */
function computeFrameInteriorMask(img: HTMLImageElement): string | null {
  try {
    const W = 160;
    const H = Math.max(120, Math.round((img.naturalHeight / (img.naturalWidth || 1)) * W));
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, W, H);
    const imageData = ctx.getImageData(0, 0, W, H);
    const { data } = imageData;

    const total = W * H;
    const exterior = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const tryEnqueue = (idx: number) => {
      if (exterior[idx] === 0 && data[idx * 4 + 3] < 90) {
        exterior[idx] = 1;
        queue[tail++] = idx;
      }
    };

    for (let x = 0; x < W; x++) {
      tryEnqueue(x);
      tryEnqueue((H - 1) * W + x);
    }
    for (let y = 0; y < H; y++) {
      tryEnqueue(y * W);
      tryEnqueue(y * W + (W - 1));
    }

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % W;
      const cy = (curr - cx) / W;
      if (cx > 0) tryEnqueue(curr - 1);
      if (cx < W - 1) tryEnqueue(curr + 1);
      if (cy > 0) tryEnqueue(curr - W);
      if (cy < H - 1) tryEnqueue(curr + W);
    }

    // Erode the interior mask by 2px from the exterior so the photo never bleeds outside the frame edge
    const erodedExterior = new Uint8Array(exterior);
    for (let step = 0; step < 2; step++) {
      const prev = new Uint8Array(erodedExterior);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          if (
            prev[i] ||
            prev[i - 1] ||
            prev[i + 1] ||
            prev[i - W] ||
            prev[i + W]
          ) {
            erodedExterior[i] = 1;
          }
        }
      }
    }

    for (let i = 0; i < total; i++) {
      const p = i * 4;
      data[p] = 0;
      data[p + 1] = 0;
      data[p + 2] = 0;
      data[p + 3] = erodedExterior[i] ? 0 : 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function CouplePhotoFrame({
  photoUrl,
  frameUrl,
  alt = "Couple photo",
  size = "md",
  className = "",
}: {
  photoUrl?: string;
  frameUrl?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const effectiveFrameUrl = frameUrl?.trim() || DEFAULT_COUPLE_FRAME_URL;
  const isDefaultFrame = effectiveFrameUrl === DEFAULT_COUPLE_FRAME_URL;
  const [customMaskUrl, setCustomMaskUrl] = useState<string | null>(
    () => maskCache.get(effectiveFrameUrl) ?? null,
  );

  useEffect(() => {
    if (isDefaultFrame) return;
    const cached = maskCache.get(effectiveFrameUrl);
    if (cached) {
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const generated = computeFrameInteriorMask(img);
      if (generated) {
        maskCache.set(effectiveFrameUrl, generated);
        setCustomMaskUrl(generated);
      }
    };
    img.src = effectiveFrameUrl;
    return () => {
      cancelled = true;
    };
  }, [effectiveFrameUrl, isDefaultFrame]);

  const activeMaskUrl = !isDefaultFrame
    ? (maskCache.get(effectiveFrameUrl) ?? customMaskUrl)
    : null;

  const sizeClasses =
    size === "sm"
      ? "w-36 sm:w-44"
      : size === "lg"
        ? "w-56 @xl:w-72 sm:w-64"
        : "w-48 @xl:w-60 sm:w-56";

  const photoMaskStyle: React.CSSProperties = activeMaskUrl
    ? {
        WebkitMaskImage: `url(${activeMaskUrl})`,
        maskImage: `url(${activeMaskUrl})`,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : {
        clipPath: DEFAULT_FRAME_CLIP_PATH,
      };

  return (
    <div
      className={`relative aspect-[804/1024] select-none mx-auto ${sizeClasses} ${className}`}
    >
      {/* Inner Clipped/Masked Couple Photo */}
      <div className="absolute inset-0 overflow-hidden" style={photoMaskStyle}>
        {photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photoUrl}
            alt={alt}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gold/10 text-gold/60 pt-10">
            <ImageIcon className="h-7 w-7 opacity-70" />
          </div>
        )}
      </div>

      {/* Ornate Frame Overlay */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={effectiveFrameUrl}
        alt=""
        aria-hidden
        referrerPolicy="no-referrer"
        className="pointer-events-none relative z-10 h-full w-full object-contain drop-shadow-[0_8px_22px_rgba(0,0,0,0.38)]"
      />
    </div>
  );
}
