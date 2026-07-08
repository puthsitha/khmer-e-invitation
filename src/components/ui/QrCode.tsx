"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 200 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1 }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="animate-pulse rounded-lg bg-gold/20"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code" width={size} height={size} />;
}
