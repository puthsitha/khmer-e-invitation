import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_LIMITS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CATBOX_API_URL = "https://catbox.moe/user/api.php";
const CATBOX_USERHASH = process.env.CATBOX_USERHASH || "b0584b23b57201ab4042fab71";
const CATBOX_ALBUM_SHORT = process.env.CATBOX_ALBUM_SHORT || "zxmmwt";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxBytes = Math.max(
      UPLOAD_LIMITS.galleryImageMaxBytes,
      UPLOAD_LIMITS.bgMusicMaxBytes,
    );

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `File exceeds maximum allowed size of ${Math.round(maxBytes / (1024 * 1024))}MB`,
        },
        { status: 400 },
      );
    }

    // Prepare upload to Catbox
    const catboxForm = new FormData();
    catboxForm.append("reqtype", "fileupload");
    if (CATBOX_USERHASH) {
      catboxForm.append("userhash", CATBOX_USERHASH);
    }
    catboxForm.append("fileToUpload", file, file.name);

    const catboxRes = await fetch(CATBOX_API_URL, {
      method: "POST",
      body: catboxForm,
    });

    const responseText = (await catboxRes.text()).trim();

    if (!catboxRes.ok || !responseText.startsWith("http")) {
      console.error("Catbox upload error:", responseText);
      return NextResponse.json(
        { error: responseText || "Catbox upload failed" },
        { status: 502 },
      );
    }

    const fileUrl = responseText;
    const filename = fileUrl.split("/").pop();

    // Add to album "e_invitation" if userhash and album short code exist
    if (filename && CATBOX_ALBUM_SHORT && CATBOX_USERHASH) {
      const albumForm = new FormData();
      albumForm.append("reqtype", "addtoalbum");
      albumForm.append("userhash", CATBOX_USERHASH);
      albumForm.append("short", CATBOX_ALBUM_SHORT);
      albumForm.append("files", filename);

      try {
        const albumRes = await fetch(CATBOX_API_URL, {
          method: "POST",
          body: albumForm,
        });
        if (!albumRes.ok) {
          console.warn("Failed to add to Catbox album:", await albumRes.text());
        }
      } catch (albumErr) {
        console.warn("Failed to add to Catbox album:", albumErr);
      }
    }

    return NextResponse.json({
      url: fileUrl,
      filename,
    });
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal upload error" },
      { status: 500 },
    );
  }
}
