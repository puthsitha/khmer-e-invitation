export const UPLOAD_LIMITS = {
  galleryImageMaxBytes: 500 * 1024,
  galleryMaxImages: 20,
  bgMusicMaxBytes: 3 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp4", "audio/wav"];
