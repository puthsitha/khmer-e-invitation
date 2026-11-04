import {
  deleteObject,
  ref,
} from "firebase/storage";
import { storage } from "./client";
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  UPLOAD_LIMITS,
} from "@/lib/constants";

export class UploadValidationError extends Error {}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${Math.round(bytes / (1024 * 1024))}MB`;
  }
  return `${Math.round(bytes / 1024)}KB`;
}

export function assertUpload(
  file: File,
  {
    maxBytes,
    allowedTypes,
    allowedExtensions,
  }: {
    maxBytes: number;
    allowedTypes: readonly string[];
    allowedExtensions?: readonly string[];
  },
) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const matchesType = file.type && allowedTypes.includes(file.type);
  const matchesExt =
    extension && allowedExtensions && allowedExtensions.includes(`.${extension}`);

  if (!matchesType && !matchesExt) {
    throw new UploadValidationError(
      `Unsupported file type "${file.type || extension}". Allowed: ${allowedTypes.join(", ")}.`,
    );
  }
  if (file.size > maxBytes) {
    throw new UploadValidationError(
      `File is too large (${formatBytes(file.size)}). Max allowed is ${formatBytes(maxBytes)}.`,
    );
  }
}

export function validateTemplatePreviewImage(file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  });
}

async function uploadToCloudinary(file: File, folder = "khmer-e-invitation"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.url) {
    throw new Error("No URL returned from upload");
  }
  return data.url;
}

export async function uploadGalleryImage(
  invitationId: string,
  file: File,
  existingCount: number,
) {
  if (existingCount >= UPLOAD_LIMITS.galleryMaxImages) {
    throw new UploadValidationError(
      `Gallery is limited to ${UPLOAD_LIMITS.galleryMaxImages} images.`,
    );
  }
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  });

  return uploadToCloudinary(file, `khmer-e-invitation/invitations/${invitationId}/gallery`);
}

export async function uploadBgMusic(invitationId: string, file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.bgMusicMaxBytes,
    allowedTypes: ALLOWED_AUDIO_TYPES,
    allowedExtensions: [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".mp4"],
  });

  return uploadToCloudinary(file, `khmer-e-invitation/invitations/${invitationId}/music`);
}

export async function uploadDigitalEnvelopeQr(invitationId: string, file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  });

  return uploadToCloudinary(file, `khmer-e-invitation/invitations/${invitationId}/envelope`);
}

export async function uploadStoryImage(invitationId: string, file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  });

  return uploadToCloudinary(file, `khmer-e-invitation/invitations/${invitationId}/story`);
}

export async function uploadCoverImage(invitationId: string, file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  });

  return uploadToCloudinary(file, `khmer-e-invitation/invitations/${invitationId}/cover`);
}

export async function uploadTemplatePreviewImage(
  templateId: string,
  file: File,
  _album?: string,
) {
  validateTemplatePreviewImage(file);
  return uploadToCloudinary(file, `khmer-e-invitation/templates/${templateId}`);
}

export async function uploadTemplateBackgroundImage(
  templateId: string,
  file: File,
) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  });
  return uploadToCloudinary(file, `khmer-e-invitation/templates/${templateId}/background`);
}

export async function uploadTemplateMusic(
  templateId: string,
  file: File,
) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.bgMusicMaxBytes,
    allowedTypes: ALLOWED_AUDIO_TYPES,
    allowedExtensions: [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".mp4"],
  });
  return uploadToCloudinary(file, `khmer-e-invitation/templates/${templateId}/music`);
}

export async function deleteMediaByUrl(url: string) {
  if (!url) return;

  // Cloudinary URLs
  if (url.includes("res.cloudinary.com")) {
    const isAudio = /\.(mp3|wav|m4a|aac|ogg|mp4)($|\?)/i.test(url) || url.includes("/video/upload/");
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        resourceType: isAudio ? "video" : "image",
      }),
    }).catch(() => {});
    return;
  }

  // Legacy Catbox URLs
  if (url.includes("catbox.moe")) {
    await fetch("/api/catbox/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => {});
    return;
  }

  // Fallback for legacy Firebase Storage URLs
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Failed to delete legacy storage object", err);
  }
}
