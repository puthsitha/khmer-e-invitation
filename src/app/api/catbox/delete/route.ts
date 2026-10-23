import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";

export const dynamic = "force-dynamic";

const CATBOX_API_URL = "https://catbox.moe/user/api.php";
const CATBOX_USERHASH = process.env.CATBOX_USERHASH || "b0584b23b57201ab4042fab71";

function deleteWithCurl(targetFile: string, userhash: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-s",
      "-S",
      "-F",
      "reqtype=deletefiles",
      "-F",
      `userhash=${userhash}`,
      "-F",
      `files=${targetFile}`,
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
        return reject(
          new Error(
            responseText || stderr || `curl delete failed with code ${code}`,
          ),
        );
      }
      resolve(responseText);
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
}

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

    let responseText: string;
    try {
      responseText = await deleteWithCurl(targetFile, CATBOX_USERHASH);
    } catch (curlErr) {
      console.warn("deleteWithCurl failed, falling back to fetch:", curlErr);
      const catboxForm = new FormData();
      catboxForm.append("reqtype", "deletefiles");
      catboxForm.append("userhash", CATBOX_USERHASH);
      catboxForm.append("files", targetFile);

      const catboxRes = await fetch(CATBOX_API_URL, {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
        },
        body: catboxForm,
      });

      responseText = (await catboxRes.text()).trim();
    }

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
