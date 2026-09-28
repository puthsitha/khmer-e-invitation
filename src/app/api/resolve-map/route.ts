import { NextRequest, NextResponse } from "next/server";
import { parseGoogleMapsDetails } from "@/lib/mapUrl";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url")?.trim();
  const address = searchParams.get("address")?.trim();
  const locale = searchParams.get("locale") || "km";

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Basic security check: ensure it starts with http:// or https://
  if (!/^https?:\/\//i.test(targetUrl)) {
    return NextResponse.json({ error: "Invalid url protocol" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    const finalUrl = response.url || targetUrl;
    const details = parseGoogleMapsDetails(finalUrl, address, locale);

    return NextResponse.json({
      success: true,
      originalUrl: targetUrl,
      finalUrl,
      details,
    });
  } catch (err) {
    // Graceful fallback: parse with address
    const fallbackDetails = parseGoogleMapsDetails(null, address, locale);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to resolve URL",
      details: fallbackDetails,
    });
  }
}
