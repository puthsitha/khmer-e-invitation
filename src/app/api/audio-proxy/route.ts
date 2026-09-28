import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAMES = new Set([
  "firebasestorage.googleapis.com",
  "assets.mixkit.co",
  "cdn.pixabay.com",
  "www.soundhelix.com",
]);

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTNAMES.has(hostname)) return true;
  if (hostname.endsWith(".firebasestorage.app")) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

/**
 * Streams Firebase Storage and audio CDN tracks through our own origin. The
 * client-side Web Audio fetch() in useBackgroundMusic needs a CORS-safe
 * response, so we fetch it server-side and re-serve it same-origin instead.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!isAllowedHost(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(target, {
    headers: request.headers.get("range")
      ? { range: request.headers.get("range")! }
      : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      { error: "Upstream fetch failed" },
      { status: upstream.status },
    );
  }

  const headers = new Headers();
  const passthroughHeaders = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ];
  for (const key of passthroughHeaders) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
