import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CATBOX_API_URL = "https://catbox.moe/user/api.php";
const CATBOX_USERHASH = process.env.CATBOX_USERHASH || "b0584b23b57201ab4042fab71";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url as string | undefined;
    const filename = body.filename as string | undefined;

    let targetFile = filename;
    if (!targetFile && url) {
      targetFile = url.trim().split("/").pop();
    }

    if (!targetFile) {
      return NextResponse.json({ error: "Missing file identifier" }, { status: 400 });
    }

    if (!CATBOX_USERHASH) {
      return NextResponse.json({ error: "Missing Catbox userhash" }, { status: 500 });
    }

    const catboxForm = new FormData();
    catboxForm.append("reqtype", "deletefiles");
    catboxForm.append("userhash", CATBOX_USERHASH);
    catboxForm.append("files", targetFile);

    const catboxRes = await fetch(CATBOX_API_URL, {
      method: "POST",
      body: catboxForm,
    });

    const responseText = (await catboxRes.text()).trim();

    return NextResponse.json({
      success: true,
      message: responseText,
    });
  } catch (error) {
    console.error("Catbox delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete file" },
      { status: 500 },
    );
  }
}
