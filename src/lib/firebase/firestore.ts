import {
  collection,
  deleteDoc,
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
import type { AppUser, Invitation, Palette, RsvpResponse, Template, WeddingGuest, RsvpDecision } from "@/types";
import { encryptGuestToken } from "@/lib/guestToken";

function converter<T>() {
  return {
    toFirestore: (data: T) => data as Record<string, unknown>,
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>
      ({ ...snapshot.data() }) as T,
  };
}

const usersCol = collection(db, "users").withConverter(converter<AppUser>());
const invitationsCol = collection(db, "invitations").withConverter(
  converter<Invitation>(),
);
const templatesCol = collection(db, "templates").withConverter(
  converter<Template>(),
);
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
    "slug" | "category" | "templateId" | "defaultLocale" | "colorPalette"
  >,
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
    colorPalette: input.colorPalette,
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
  batch.set(doc(db, "slugs", input.slug), { invitationId: ref.id });
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
  await deleteDoc(doc(invitationsCol, invitationId));
}

export async function listAllInvitations() {
  const snap = await getDocs(invitationsCol);
  return snap.docs.map((d) => d.data());
}

export async function listTemplates(category?: Template["category"]) {
  const q = category
    ? query(templatesCol, where("category", "==", category))
    : templatesCol;
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function getTemplate(templateId: string) {
  const snap = await getDoc(doc(templatesCol, templateId));
  return snap.exists() ? snap.data() : null;
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
  const template: Template = { ...input, templateId };
  await setDoc(doc(templatesCol, templateId), template);
  return template;
}

export async function updateTemplate(
  templateId: string,
  patch: Partial<Template>,
) {
  await updateDoc(doc(templatesCol, templateId), patch);
}

export async function deleteTemplate(templateId: string) {
  await deleteDoc(doc(templatesCol, templateId));
}

export async function listPalettes() {
  const snap = await getDocs(query(palettesCol, orderBy("name")));
  const existing = snap.docs.map((d) => d.data());
  const existingIds = new Set(existing.map((p) => p.paletteId));
  const missing = DEFAULT_PALETTES.filter((p) => !existingIds.has(p.paletteId));

  if (missing.length === 0) return existing;

  const batch = writeBatch(db);
  for (const palette of missing) {
    batch.set(doc(palettesCol, palette.paletteId), palette);
  }
  await batch.commit();
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
    ...guest,
    guestId: ref.id,
    invitationId,
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
    ...patch,
    updatedAt: Date.now(),
  };

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
): Promise<WeddingGuest[]> {
  const guestsCol = collection(
    db,
    "invitations",
    invitationId,
    "guests",
  ).withConverter(converter<WeddingGuest>());
  const batch = writeBatch(db);
  const now = Date.now();
  const created: WeddingGuest[] = [];

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
      name: item.name,
      from: item.from,
      by: item.by,
      note: item.note,
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
  return created;
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

