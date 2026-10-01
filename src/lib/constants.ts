export const UPLOAD_LIMITS = {
  galleryImageMaxBytes: 100 * 1024 * 1024,
  galleryMaxImages: 20,
  bgMusicMaxBytes: 100 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
];

