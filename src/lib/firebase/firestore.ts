import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./client";
import type { AppUser, Invitation, Palette, RsvpResponse, Template, TemplateColors, WeddingGuest, RsvpDecision } from "@/types";
import { encryptGuestToken } from "@/lib/guestToken";
import { deleteMediaByUrl } from "./storage";

function cleanUndefined<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[key] = cleanUndefined(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

function converter<T>() {
  return {
    toFirestore: (data: T) => cleanUndefined(data as Record<string, unknown>),
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>
      ({ ...snapshot.data() }) as T,
  };
}

const usersCol = collection(db, "users").withConverter(converter<AppUser>());
const invitationsCol = collection(db, "invitations").withConverter(
  converter<Invitation>(),
);
export const DEFAULT_TEMPLATE_COLORS: TemplateColors = {
  primary: "#c9a24b",
  secondary: "#7a1f2b",
  text: "#2a1a12",
  background: "#fdf8f0",
  backgroundOpacity: 85,
};

const LEGACY_PALETTE_COLORS: Record<string, TemplateColors> = {
  "royal-gold": {
    primary: "#c9a24b",
    secondary: "#7a1f2b",
    text: "#2a1a12",
    background: "#fdf8f0",
  },
  "blush-temple": {
    primary: "#c9a24b",
    secondary: "#8a3b4c",
    text: "#3a1d24",
    background: "#fff8f4",
  },
  "modern-minimal": {
    primary: "#b8934a",
    secondary: "#2a2a2a",
    text: "#1f1f1f",
    background: "#f5f2ec",
  },
  "lotus-blush": {
    primary: "#e3a6ad",
    secondary: "#9c4a55",
    text: "#3d1e23",
    background: "#fff5f2",
  },
  "imperial-jade": {
    primary: "#c9a24b",
    secondary: "#0f3d3e",
    text: "#0b2b2c",
    background: "#f8f5ec",
  },
  "naga-crimson": {
    primary: "#d4af37",
    secondary: "#5c0a1a",
    text: "#2e050d",
    background: "#f9f1e7",
  },
  "sbai-silk": {
    primary: "#e07a3f",
    secondary: "#2f7a5c",
    text: "#1c382c",
    background: "#fff8ef",
  },
};

function normalizeTemplate(raw: Partial<Template> & { templateId: string }): Template {
  const fallbackColors =
    (raw.defaultColorPalette && LEGACY_PALETTE_COLORS[raw.defaultColorPalette]) ||
    DEFAULT_TEMPLATE_COLORS;

  return {
    templateId: raw.templateId,
    category: raw.category ?? "wedding",
    name: raw.name ?? "Untitled Template",
    previewImage: raw.previewImage ?? "",
    description: raw.description,
    colors: {
      primary: raw.colors?.primary || fallbackColors.primary,
      secondary: raw.colors?.secondary || fallbackColors.secondary,
      text: raw.colors?.text || fallbackColors.text,
      background: raw.colors?.background || fallbackColors.background,
      backgroundOpacity:
        typeof raw.colors?.backgroundOpacity === "number"
          ? Math.max(0, Math.min(100, raw.colors.backgroundOpacity))
          : (fallbackColors.backgroundOpacity ?? 85),
    },
    backgroundType:
      raw.backgroundType ??
      (raw.backgroundVideoUrl ? "video" : raw.backgroundImageUrl ? "photo" : "none"),
    backgroundImageUrl: raw.backgroundImageUrl,
    backgroundVideoUrl: raw.backgroundVideoUrl,
    hasMusic: raw.hasMusic ?? true,
    defaultMusicUrl: raw.defaultMusicUrl,
    defaultFonts: raw.defaultFonts ?? { heading: "Moul", body: "Kantumruy Pro" },
    defaultColorPalette: raw.defaultColorPalette,
  };
}

const templatesCol = collection(db, "templates").withConverter({
  toFirestore: (data: Template) => cleanUndefined(data as unknown as Record<string, unknown>),
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data() as Partial<Template>;
    return normalizeTemplate({ ...data, templateId: data.templateId || snapshot.id });
  },
});

export const DEFAULT_TEMPLATES: Template[] = [
  {
    templateId: "emerald-gold",
    category: "wedding",
    name: "Emerald Gold · មរកតមាស",
    description:
      "Luxurious deep emerald green paired with radiant royal gold accents and warm ivory text — inspired by emeraldgold.invibless.com.",
    previewImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
    colors: {
      primary: "#d4af37",
      secondary: "#0f3d2e",
      text: "#f8f4eb",
      background: "#071f17",
    },
    backgroundType: "photo",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    hasMusic: true,
    defaultMusicUrl:
      "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-640.mp3",
    defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
  },
  {
    templateId: "royal-kh",
    category: "wedding",
    name: "Royal KH · ខ្មែររាជវង្ស",
    description:
      "Traditional Cambodian palace aesthetic with antique gold, regal crimson maroon, and warm silk cream — inspired by royalkh.invibless.com.",
    previewImage:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80",
    colors: {
      primary: "#c9a24b",
      secondary: "#7a1f2b",
      text: "#3b1319",
      background: "#fdf8f0",
    },
    backgroundType: "photo",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80",
    hasMusic: true,
    defaultMusicUrl:
      "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-640.mp3",
    defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
  },
  {
    templateId: "teal-silver",
    category: "wedding",
    name: "Teal Silver · ខៀវប្រាក់ទំនើប",
    description:
      "Modern oceanic teal blended with shimmering silver-cyan highlights and crisp alabaster tones — inspired by tealsilver.invibless.com.",
    previewImage:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
    colors: {
      primary: "#7dd3fc",
      secondary: "#115e59",
      text: "#f0fdfa",
      background: "#082f32",
    },
    backgroundType: "photo",
    backgroundImageUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80",
    hasMusic: true,
    defaultMusicUrl:
      "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-640.mp3",
    defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
  },
];
// Palette docs seeded before the gold/goldLight/maroon/cream -> primary/
// primaryLight/secondary/background field rename are still shaped the old
// way in Firestore. Fall back to the legacy field so those documents don't
// resolve to `undefined` colors (which breaks controlled inputs and swatch
// rendering) until they're next saved through the admin UI.
type LegacyPalette = {
  gold?: string;
  goldLight?: string;
  maroon?: string;
  cream?: string;
};

const palettesCol = collection(db, "palettes").withConverter({
  toFirestore: (data: Palette) => data as unknown as Record<string, unknown>,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data() as Palette & LegacyPalette;
    return {
      paletteId: data.paletteId,
      name: data.name,
      primary: data.primary ?? data.gold,
      primaryLight: data.primaryLight ?? data.goldLight,
      secondary: data.secondary ?? data.maroon,
      background: data.background ?? data.cream,
    } satisfies Palette;
  },
});

// Seed data for the app's three built-in palettes — mirrors the
// [data-palette] CSS variable overrides in globals.css. Used to seed the
// "palettes" collection on first read and as a fallback if a built-in
// palette's Firestore doc is ever missing.
const DEFAULT_PALETTES: Palette[] = [
  {
    paletteId: "royal-gold",
    name: "Royal Gold",
    primary: "#c9a24b",
    primaryLight: "#e6cd8a",
    secondary: "#7a1f2b",
    background: "#fdf8f0",
  },
  {
    paletteId: "blush-temple",
    name: "Blush Temple",
    primary: "#c9a24b",
    primaryLight: "#e9c98a",
    secondary: "#8a3b4c",
    background: "#fff8f4",
  },
  {
    paletteId: "modern-minimal",
    name: "Modern Minimal Khmer",
    primary: "#b8934a",
    primaryLight: "#d8bd85",
    secondary: "#2a2a2a",
    background: "#f5f2ec",
  },
  {
    paletteId: "lotus-blush",
    name: "Lotus Blush",
    primary: "#e3a6ad",
    primaryLight: "#f7dde0",
    secondary: "#9c4a55",
    background: "#fff5f2",
  },
  {
    paletteId: "imperial-jade",
    name: "Imperial Jade & Gold",
    primary: "#c9a24b",
    primaryLight: "#e6cd8a",
    secondary: "#0f3d3e",
    background: "#f8f5ec",
  },
  {
    paletteId: "naga-crimson",
    name: "Naga Crimson",
    primary: "#d4af37",
    primaryLight: "#f0d878",
    secondary: "#5c0a1a",
    background: "#f9f1e7",
  },
  {
    paletteId: "sbai-silk",
    name: "Sbai Silk",
    primary: "#e07a3f",
    primaryLight: "#f6c453",
    secondary: "#2f7a5c",
    background: "#fff8ef",
  },
];

export async function getUserDoc(uid: string) {
  const snap = await getDoc(doc(usersCol, uid));
  return snap.exists() ? snap.data() : null;
}


export async function listAllUsers() {
  const snap = await getDocs(query(usersCol, orderBy("createdAt", "desc")));
  return snap.docs.map((d) => d.data());
}

export async function setUserStatus(
  uid: string,
  patch: Partial<Pick<AppUser, "role" | "suspended">>,
) {
  await updateDoc(doc(usersCol, uid), patch);
}

export async function createInvitation(
  ownerUid: string,
  input: Pick<
    Invitation,
    "slug" | "category" | "templateId" | "defaultLocale"
  > & { colorPalette?: string },
) {
  const ref = doc(invitationsCol);
  const invitation: Invitation = {
    invitationId: ref.id,
    ownerUid,
    slug: input.slug,
    category: input.category,
    templateId: input.templateId,
    defaultLocale: input.defaultLocale,
    status: "draft",
    ...(input.colorPalette ? { colorPalette: input.colorPalette } : {}),
    eventDate: Date.now(),
    content: {},
    mediaUrls: { gallery: [] },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Reserve the slug atomically alongside the invitation so uniqueness
  // checks and the public viewer's slug lookup can use a plain get() on
  // slugs/{slug} instead of a list query (see getInvitationBySlug below).
  const batch = writeBatch(db);
  batch.set(ref, invitation);
  batch.set(doc(db, "slugs", input.slug), { invitationId: ref.id, ownerUid });
  await batch.commit();

  return invitation;
}

export async function updateInvitation(
  invitationId: string,
  patch: Partial<Invitation>,
) {
  await updateDoc(doc(invitationsCol, invitationId), {
    ...patch,
    updatedAt: Date.now(),
  });
}

export async function listInvitationsByOwner(ownerUid: string) {
  const q = query(
    invitationsCol,
    where("ownerUid", "==", ownerUid),
    orderBy("updatedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function isSlugTaken(slug: string) {
  const snap = await getDoc(doc(db, "slugs", slug));
  return snap.exists();
}

export async function getInvitationBySlug(slug: string) {
  const slugSnap = await getDoc(doc(db, "slugs", slug));
  if (!slugSnap.exists()) return null;
  const { invitationId } = slugSnap.data() as { invitationId: string };
  return getInvitation(invitationId);
}

export async function getInvitation(invitationId: string) {
  const snap = await getDoc(doc(invitationsCol, invitationId));
  return snap.exists() ? snap.data() : null;
}

export async function deleteInvitation(invitationId: string) {
  const inv = await getInvitation(invitationId);
  if (inv) {
    // Clean up associated media
    const mediaToDelete: string[] = [
      ...(inv.mediaUrls?.gallery || []),
      ...(inv.mediaUrls?.bgMusic ? [inv.mediaUrls.bgMusic] : []),
      ...(inv.mediaUrls?.digitalEnvelopeQr ? [inv.mediaUrls.digitalEnvelopeQr] : []),
      ...(inv.coverImageUrl ? [inv.coverImageUrl] : []),
      ...((inv.content?.story || []).map((s) => s.image).filter((u): u is string => Boolean(u))),
    ];
    for (const url of mediaToDelete) {
      await deleteMediaByUrl(url).catch(() => {});
    }

    // Delete guests subcollection
    try {
      const guestsSnap = await getDocs(collection(db, "invitations", invitationId, "guests"));
      for (const gDoc of guestsSnap.docs) {
        await deleteDoc(gDoc.ref).catch(() => {});
      }
    } catch {
      // non-fatal
    }

    // Delete rsvps subcollection
    try {
      const rsvpsSnap = await getDocs(collection(db, "rsvps", invitationId, "responses"));
      for (const rDoc of rsvpsSnap.docs) {
        await deleteDoc(rDoc.ref).catch(() => {});
      }
    } catch {
      // non-fatal
    }

    // Delete slug reservation
    if (inv.slug) {
      await deleteDoc(doc(db, "slugs", inv.slug)).catch(() => {});
    }
  }
  await deleteDoc(doc(invitationsCol, invitationId));
}

export async function listAllInvitations() {
  const snap = await getDocs(invitationsCol);
  return snap.docs.map((d) => d.data());
}

export async function listTemplates(category?: Template["category"]) {
  const snap = await getDocs(templatesCol);
  let all = snap.docs.map((d) => d.data());

  // Seed default sample templates (Emerald Gold, Royal KH, Teal Silver) if collection is empty
  if (all.length === 0) {
    try {
      const batch = writeBatch(db);
      for (const tpl of DEFAULT_TEMPLATES) {
        batch.set(doc(templatesCol, tpl.templateId), tpl);
      }
      await batch.commit();
    } catch {
      // Non-admin or unauthenticated caller: return in-memory defaults
    }
    all = [...DEFAULT_TEMPLATES];
  }

  if (category) {
    return all.filter((t) => t.category === category);
  }
  return all;
}

export async function getTemplate(templateId: string) {
  const snap = await getDoc(doc(templatesCol, templateId));
  if (snap.exists()) return snap.data();
  return DEFAULT_TEMPLATES.find((t) => t.templateId === templateId) ?? null;
}

// Lets callers reserve a template id before the doc is created — needed to
// upload the preview image (Storage path is templates/{templateId}/...)
// before the template itself exists.
export function newTemplateId() {
  return doc(templatesCol).id;
}

export async function createTemplate(
  input: Omit<Template, "templateId">,
  templateId: string = newTemplateId(),
) {
  const template: Template = normalizeTemplate({ ...input, templateId });
  await setDoc(doc(templatesCol, templateId), template);
  return template;
}

export async function updateTemplate(
  templateId: string,
  patch: Partial<Template> & Record<string, unknown>,
) {
  const cleanPatch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      cleanPatch[key] = deleteField();
    } else if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      cleanPatch[key] = cleanUndefined(value as Record<string, unknown>);
    } else {
      cleanPatch[key] = value;
    }
  }
  await updateDoc(doc(db, "templates", templateId), cleanPatch);
}

/**
 * Deletes a template AND cascades deletion to all user invitations that were
 * created using this templateId (along with their guests, RSVPs, media, and slugs).
 */
export async function deleteTemplate(templateId: string): Promise<number> {
  const tpl = await getTemplate(templateId);

  // 1. Find all invitations using this templateId and delete them
  let deletedInvitationsCount = 0;
  try {
    const q = query(invitationsCol, where("templateId", "==", templateId));
    const snap = await getDocs(q);
    for (const invDoc of snap.docs) {
      await deleteInvitation(invDoc.id);
      deletedInvitationsCount++;
    }
  } catch (err) {
    console.warn("Failed to cascade delete invitations for template:", err);
  }

  // 2. Clean up template media if hosted on Cloudinary/Storage
  if (tpl) {
    const urls = [tpl.previewImage, tpl.backgroundImageUrl, tpl.defaultMusicUrl].filter(
      (u): u is string => Boolean(u && !u.includes("unsplash.com") && !u.includes("mixkit.co")),
    );
    for (const url of urls) {
      await deleteMediaByUrl(url).catch(() => {});
    }
  }

  // 3. Delete the template document itself
  await deleteDoc(doc(templatesCol, templateId));
  return deletedInvitationsCount;
}

export async function listPalettes() {
  const snap = await getDocs(query(palettesCol, orderBy("name")));
  const existing = snap.docs.map((d) => d.data());
  const existingIds = new Set(existing.map((p) => p.paletteId));
  const missing = DEFAULT_PALETTES.filter((p) => !existingIds.has(p.paletteId));

  if (missing.length === 0) return existing;

  try {
    const batch = writeBatch(db);
    for (const palette of missing) {
      batch.set(doc(palettesCol, palette.paletteId), palette);
    }
    await batch.commit();
  } catch {
    // Non-admin or unauthenticated users cannot write to palettes; return merged in-memory
  }
  return [...existing, ...missing].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPalette(paletteId: string) {
  const snap = await getDoc(doc(palettesCol, paletteId));
  if (snap.exists()) return snap.data();
  return DEFAULT_PALETTES.find((p) => p.paletteId === paletteId) ?? null;
}

export async function createPalette(input: Omit<Palette, "paletteId">) {
  const ref = doc(palettesCol);
  const palette: Palette = { ...input, paletteId: ref.id };
  await setDoc(ref, palette);
  return palette;
}

export async function updatePalette(paletteId: string, patch: Partial<Palette>) {
  await updateDoc(doc(palettesCol, paletteId), patch);
}

export async function deletePalette(paletteId: string) {
  await deleteDoc(doc(palettesCol, paletteId));
}

export async function addRsvpResponse(
  invitationId: string,
  input: Pick<RsvpResponse, "guestName" | "attending" | "message">,
) {
  const responsesCol = collection(
    db,
    "rsvps",
    invitationId,
    "responses",
  ).withConverter(converter<RsvpResponse>());
  const ref = doc(responsesCol);
  await setDoc(ref, {
    responseId: ref.id,
    ...input,
    createdAt: Date.now(),
  } as RsvpResponse);
  return ref.id;
}

export async function listRsvpResponses(invitationId: string) {
  const responsesCol = collection(
    db,
    "rsvps",
    invitationId,
    "responses",
  ).withConverter(converter<RsvpResponse>());
  const q = query(responsesCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function listWeddingGuests(invitationId: string): Promise<WeddingGuest[]> {
  const guestsCol = collection(
    db,
    "invitations",
    invitationId,
    "guests",
  ).withConverter(converter<WeddingGuest>());
  const q = query(guestsCol, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function createWeddingGuest(
  invitationId: string,
  guest: Omit<
    WeddingGuest,
    "guestId" | "token" | "createdAt" | "updatedAt" | "invitationId" | "rsvpStatus"
  > & { rsvpStatus?: RsvpDecision },
): Promise<WeddingGuest> {
  const guestsCol = collection(
    db,
    "invitations",
    invitationId,
    "guests",
  ).withConverter(converter<WeddingGuest>());
  const ref = doc(guestsCol);
  const now = Date.now();
  const token = await encryptGuestToken({
    guestId: ref.id,
    name: guest.name,
    invitationId,
  });

  const newGuest: WeddingGuest = {
    guestId: ref.id,
    invitationId,
    name: guest.name.trim(),
    ...(guest.from?.trim() ? { from: guest.from.trim() } : {}),
    ...(guest.by?.trim() ? { by: guest.by.trim() } : {}),
    ...(guest.note?.trim() ? { note: guest.note.trim() } : {}),
    ...(guest.no !== undefined ? { no: guest.no } : {}),
    token,
    isInvited: guest.isInvited ?? false,
    rsvpStatus: guest.rsvpStatus ?? "pending",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, newGuest);
  return newGuest;
}

export async function updateWeddingGuest(
  invitationId: string,
  guestId: string,
  patch: Partial<WeddingGuest>,
): Promise<void> {
  const guestRef = doc(db, "invitations", invitationId, "guests", guestId);
  const updateData: Record<string, unknown> = {
    updatedAt: Date.now(),
  };

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === "") {
      if (["from", "by", "note", "rsvpMessage"].includes(key)) {
        updateData[key] = deleteField();
      }
    } else {
      updateData[key] = value;
    }
  }

  if (patch.name) {
    updateData.token = await encryptGuestToken({
      guestId,
      name: patch.name,
      invitationId,
    });
  }

  await updateDoc(guestRef, updateData);
}

export async function toggleGuestInvitedStatus(
  invitationId: string,
  guestId: string,
  isInvited: boolean,
): Promise<void> {
  const guestRef = doc(db, "invitations", invitationId, "guests", guestId);
  await updateDoc(guestRef, {
    isInvited,
    invitedAt: isInvited ? Date.now() : null,
    updatedAt: Date.now(),
  });
}

export async function deleteWeddingGuest(
  invitationId: string,
  guestId: string,
): Promise<void> {
  await deleteDoc(doc(db, "invitations", invitationId, "guests", guestId));
}

export async function batchImportWeddingGuests(
  invitationId: string,
  guests: Array<{
    no?: number;
    name: string;
    from?: string;
    by?: string;
    note?: string;
  }>,
  replaces?: Array<{
    guestId: string;
    data: {
      name: string;
      from?: string;
      by?: string;
      note?: string;
    };
  }>,
): Promise<{ created: WeddingGuest[]; updated: WeddingGuest[] }> {
  const guestsCol = collection(
    db,
    "invitations",
    invitationId,
    "guests",
  ).withConverter(converter<WeddingGuest>());
  const batch = writeBatch(db);
  const now = Date.now();
  const created: WeddingGuest[] = [];
  const updated: WeddingGuest[] = [];

  // 1. Process replacements
  if (replaces && replaces.length > 0) {
    for (const rep of replaces) {
      const guestRef = doc(db, "invitations", invitationId, "guests", rep.guestId);
      const updateData: Record<string, unknown> = {
        updatedAt: now,
      };

      if (rep.data.name?.trim()) {
        updateData.name = rep.data.name.trim();
        updateData.token = await encryptGuestToken({
          guestId: rep.guestId,
          name: rep.data.name.trim(),
          invitationId,
        });
      }

      if (rep.data.from?.trim()) {
        updateData.from = rep.data.from.trim();
      } else {
        updateData.from = deleteField();
      }

      if (rep.data.by?.trim()) {
        updateData.by = rep.data.by.trim();
      } else {
        updateData.by = deleteField();
      }

      if (rep.data.note?.trim()) {
        updateData.note = rep.data.note.trim();
      } else {
        updateData.note = deleteField();
      }

      batch.update(guestRef, updateData);

      updated.push({
        guestId: rep.guestId,
        invitationId,
        name: rep.data.name.trim(),
        from: rep.data.from?.trim() || undefined,
        by: rep.data.by?.trim() || undefined,
        note: rep.data.note?.trim() || undefined,
        token: (updateData.token as string) || "",
        isInvited: false,
        rsvpStatus: "pending",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // 2. Process new guest additions
  for (let i = 0; i < guests.length; i++) {
    const item = guests[i];
    const ref = doc(guestsCol);
    const token = await encryptGuestToken({
      guestId: ref.id,
      name: item.name,
      invitationId,
    });

    const guest: WeddingGuest = {
      guestId: ref.id,
      invitationId,
      no: item.no ?? i + 1,
      name: item.name.trim(),
      ...(item.from?.trim() ? { from: item.from.trim() } : {}),
      ...(item.by?.trim() ? { by: item.by.trim() } : {}),
      ...(item.note?.trim() ? { note: item.note.trim() } : {}),
      token,
      isInvited: false,
      rsvpStatus: "pending",
      createdAt: now + i,
      updatedAt: now + i,
    };

    batch.set(ref, guest);
    created.push(guest);
  }

  await batch.commit();
  return { created, updated };
}

export async function submitGuestRsvp(
  invitationId: string,
  data: {
    guestId?: string;
    guestName: string;
    status: RsvpDecision;
    message?: string;
  },
): Promise<void> {
  const now = Date.now();
  const attending = data.status === "attending";

  // 1. Record response in rsvps collection
  const responsesCol = collection(
    db,
    "rsvps",
    invitationId,
    "responses",
  ).withConverter(converter<RsvpResponse>());
  const respRef = doc(responsesCol);
  await setDoc(respRef, {
    responseId: respRef.id,
    guestId: data.guestId || null,
    guestName: data.guestName,
    attending,
    status: data.status,
    message: data.message?.trim() || "",
    createdAt: now,
  } as unknown as RsvpResponse);

  // 2. If guestId exists, also update guest document in Firestore
  if (data.guestId) {
    try {
      const guestRef = doc(db, "invitations", invitationId, "guests", data.guestId);
      await updateDoc(guestRef, {
        rsvpStatus: data.status,
        rsvpMessage: data.message?.trim() || "",
        rsvpUpdatedAt: now,
        updatedAt: now,
      });
    } catch (err) {
      console.warn("Could not update guest document RSVP status (non-fatal):", err);
    }
  }
}


export async function seedMockInvitation(
  ownerUid: string,
  slug: string,
  data: Omit<
    Invitation,
    | "invitationId"
    | "ownerUid"
    | "slug"
    | "status"
    | "createdAt"
    | "updatedAt"
  >,
  rsvps?: RsvpResponse[],
) {
  const ref = doc(invitationsCol);
  const invitation: Invitation = {
    ...data,
    invitationId: ref.id,
    ownerUid,
    slug,
    status: "published",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const batch = writeBatch(db);
  batch.set(ref, invitation);
  batch.set(doc(db, "slugs", slug), { invitationId: ref.id });
  await batch.commit();

  if (rsvps && rsvps.length > 0) {
    for (const rsvp of rsvps) {
      try {
        await addRsvpResponse(ref.id, {
          guestName: rsvp.guestName,
          attending: rsvp.attending,
          message: rsvp.message,
        });
      } catch (err) {
        console.warn("Could not seed mock RSVP response (non-fatal):", err);
      }
    }
  }

  return invitation;
}

