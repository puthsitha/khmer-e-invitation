import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./client";
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  UPLOAD_LIMITS,
} from "@/lib/constants";

export class UploadValidationError extends Error {}

function assertUpload(
  file: File,
  { maxBytes, allowedTypes }: { maxBytes: number; allowedTypes: string[] },
) {
  if (!allowedTypes.includes(file.type)) {
    throw new UploadValidationError(
      `Unsupported file type "${file.type}". Allowed: ${allowedTypes.join(", ")}.`,
    );
  }
  if (file.size > maxBytes) {
    throw new UploadValidationError(
      `File is too large (${Math.ceil(file.size / 1024)}KB). Max allowed is ${Math.ceil(maxBytes / 1024)}KB.`,
    );
  }
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
  });

  const path = `invitations/${invitationId}/gallery/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadBgMusic(invitationId: string, file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.bgMusicMaxBytes,
    allowedTypes: ALLOWED_AUDIO_TYPES,
  });

  const path = `invitations/${invitationId}/music/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadDigitalEnvelopeQr(invitationId: string, file: File) {
  assertUpload(file, {
    maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
    allowedTypes: ALLOWED_IMAGE_TYPES,
  });

  const path = `invitations/${invitationId}/envelope/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function deleteMediaByUrl(url: string) {
  const storageRef = ref(storage, url);
  await deleteObject(storageRef);
}
