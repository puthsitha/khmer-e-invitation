import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { UPLOAD_LIMITS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CATBOX_API_URL = "https://catbox.moe/user/api.php";
const CATBOX_USERHASH = process.env.CATBOX_USERHASH || "b0584b23b57201ab4042fab71";
const CATBOX_ALBUM_SHORT = process.env.CATBOX_ALBUM_SHORT || "zxmmwt";

async function uploadWithCurlFile(
  buffer: Buffer,
  filename: string,
  userhash?: string,
): Promise<string> {
  const tempPath = path.join(os.tmpdir(), `catbox-${Date.now()}-${filename}`);
  await fs.promises.writeFile(tempPath, buffer);

  try {
    return await new Promise<string>((resolve, reject) => {
      const args = [
        "-s",
        "-S",
        "-F",
        "reqtype=fileupload",
        "-F",
        `fileToUpload=@${tempPath}`,
      ];
      if (userhash) {
        args.push("-F", `userhash=${userhash}`);
      }
      args.push(CATBOX_API_URL);

      const child = spawn("curl", args);
      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
      });

      child.on("close", (code) => {
        const responseText = stdout.trim();
        if (code !== 0 || !responseText.startsWith("http")) {
          reject(
            new Error(
              responseText || stderr || `curl upload failed with code ${code}`,
            ),
          );
        } else {
          resolve(responseText);
        }
      });

      child.on("error", reject);
    });
  } finally {
    await fs.promises.unlink(tempPath).catch(() => {});
  }
}

async function addToAlbumWithCurl(
  filename: string,
  albumShort: string,
  userhash: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-s",
      "-S",
      "-F",
      "reqtype=addtoalbum",
      "-F",
      `userhash=${userhash}`,
      "-F",
      `short=${albumShort}`,
      "-F",
      `files=${filename}`,
      CATBOX_API_URL,
    ];

    const child = spawn("curl", args);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("close", (code) => {
      const responseText = stdout.trim();
      if (code !== 0) {
        reject(
          new Error(
            responseText || stderr || `curl addtoalbum failed with code ${code}`,
          ),
        );
      } else {
        resolve(responseText);
      }
    });

    child.on("error", reject);
  });
}

async function verifyCatboxFileHasData(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    return arrayBuffer.byteLength > 0;
  } catch (err) {
    console.warn("Could not verify Catbox file bytes:", err);
    return false;
  }
}

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

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "The provided file is empty (0 bytes)" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(arrayBuffer);

    let fileUrl = "";
    // 1. Try uploading with userhash
    try {
      fileUrl = await uploadWithCurlFile(buffer, file.name, CATBOX_USERHASH);
    } catch (err) {
      console.warn("Upload with userhash failed, trying without userhash:", err);
      // 2. Fallback to upload without userhash if userhash causes empty return
      fileUrl = await uploadWithCurlFile(buffer, file.name);
    }

    if (!fileUrl || !fileUrl.startsWith("http")) {
      return NextResponse.json(
        { error: "Catbox did not return a valid file URL" },
        { status: 502 },
      );
    }

    // 3. Immediately verify the file was actually written by Catbox and is not 0 bytes
    const hasData = await verifyCatboxFileHasData(fileUrl);
    if (!hasData) {
      console.error(
        `Catbox outage detected: uploaded file ${fileUrl} contains 0 bytes on server`,
      );
      return NextResponse.json(
        {
          error:
            "Catbox storage server returned an empty 0-byte file (temporary Catbox outage). Upload aborted to protect template data.",
        },
        { status: 502 },
      );
    }

    const filename = fileUrl.split("/").pop();
    const albumShort = (formData.get("album") as string) || CATBOX_ALBUM_SHORT;

    // 4. Add to album ONLY when file is verified non-zero
    if (filename && albumShort && CATBOX_USERHASH) {
      try {
        const albumText = await addToAlbumWithCurl(
          filename,
          albumShort,
          CATBOX_USERHASH,
        );
        console.log(`Successfully added ${filename} to Catbox album ${albumShort}: ${albumText}`);
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
