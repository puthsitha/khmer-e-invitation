import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";
import { UPLOAD_LIMITS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "khmer-e-invitation";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine resource type: audio files are uploaded as 'video' in Cloudinary
    const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|mp4)$/i.test(file.name);
    const resourceType = isAudio ? "video" : "image";
    const maxBytes = isAudio
      ? UPLOAD_LIMITS.bgMusicMaxBytes
      : UPLOAD_LIMITS.galleryImageMaxBytes;

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

    const uploadResult = await uploadBufferToCloudinary(buffer, {
      folder,
      resourceType,
    });

    return NextResponse.json({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload file to Cloudinary",
      },
      { status: 500 },
    );
  }
}
