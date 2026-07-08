export type UserRole = "user" | "admin";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  suspended: boolean;
  createdAt: number;
}

export type InvitationCategory = "wedding" | "birthday" | "event";
export type InvitationStatus = "draft" | "published";

export interface InvitationContent {
  groomName?: string;
  brideName?: string;
  groomFamily?: string;
  brideFamily?: string;
  invitationText?: string;
  story?: string;
  agenda?: { time: string; label: string }[];
  mapUrl?: string;
}

export interface InvitationMedia {
  bgMusic?: string;
  gallery: string[];
  digitalEnvelopeQr?: string;
}

export interface Invitation {
  invitationId: string;
  ownerUid: string;
  slug: string;
  category: InvitationCategory;
  templateId: string;
  defaultLocale: "km" | "en";
  status: InvitationStatus;
  colorPalette: string;
  eventDate: number;
  content: InvitationContent;
  coverVideoEmbedUrl?: string;
  mediaUrls: InvitationMedia;
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  templateId: string;
  category: InvitationCategory;
  name: string;
  previewImage: string;
  defaultColorPalette: string;
  defaultFonts: { heading: string; body: string };
}

export interface RsvpResponse {
  responseId: string;
  guestName: string;
  attending: boolean;
  message?: string;
  createdAt: number;
}
