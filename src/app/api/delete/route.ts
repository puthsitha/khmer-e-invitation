import { NextRequest, NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url as string | undefined;
    const publicId = body.publicId as string | undefined;
    const resourceType = (body.resourceType as "image" | "video" | "raw") || "image";

    const target = publicId || url;
    if (!target) {
      return NextResponse.json(
        { error: "Missing file identifier (url or publicId)" },
        { status: 400 },
      );
    }

    const success = await deleteFromCloudinary(target, resourceType);

    return NextResponse.json({
      success,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete file from Cloudinary",
      },
      { status: 500 },
    );
  }
}
