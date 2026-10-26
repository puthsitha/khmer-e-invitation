import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format?: string;
  resourceType: string;
  bytes: number;
}

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    resourceType?: "image" | "video" | "raw" | "auto";
    publicId?: string;
  } = {},
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "khmer-e-invitation",
        resource_type: options.resourceType || "auto",
        public_id: options.publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type,
            bytes: result.bytes,
          });
        }
      },
    );

    stream.end(buffer);
  });
}

/**
 * Deletes a file from Cloudinary by its public ID or full URL.
 */
export async function deleteFromCloudinary(
  urlOrPublicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<boolean> {
  try {
    let publicId = urlOrPublicId;
    if (urlOrPublicId.includes("res.cloudinary.com")) {
      // Extract public ID from Cloudinary URL:
      // https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<folder>/<filename>.<ext>
      const parts = urlOrPublicId.split("/upload/");
      if (parts[1]) {
        // Strip version prefix if present (e.g. v1234567890/)
        const withoutVersion = parts[1].replace(/^v\d+\//, "");
        // Strip file extension
        publicId = withoutVersion.replace(/\.[^/.]+$/, "");
      }
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (err) {
    console.warn("Failed to delete from Cloudinary:", err);
    return false;
  }
}
