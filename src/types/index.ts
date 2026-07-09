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

/** A piece of guest-facing text, provided in both Khmer and English. */
export interface Bilingual {
  km: string;
  en: string;
}

export interface FamilyMembers {
  father?: Bilingual;
  mother?: Bilingual;
}

export interface StoryItem {
  title: Bilingual;
  description: Bilingual;
  image?: string;
}

export interface AgendaItem {
  /** 12-hour time, e.g. "6:30 PM". */
  time: string;
  title: Bilingual;
}

export interface InvitationContent {
  groomName?: Bilingual;
  brideName?: Bilingual;
  groomFamily?: FamilyMembers;
  brideFamily?: FamilyMembers;
  invitationText?: Bilingual;
  address?: Bilingual;
  story?: StoryItem[];
  agenda?: AgendaItem[];
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
