import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTNAME = "firebasestorage.googleapis.com";

/**
 * Streams Firebase Storage audio through our own origin. The client-side
 * Web Audio fetch() in useBackgroundMusic needs a CORS-safe response, and
 * Firebase Storage's bucket CORS policy isn't something this repo can
 * configure — so we fetch it server-side (no CORS applies here) and
 * re-serve it same-origin instead.
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

  if (target.hostname !== ALLOWED_HOSTNAME) {
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
