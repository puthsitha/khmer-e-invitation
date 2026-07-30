import {
  addDoc,
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
import type { AppUser, Invitation, Palette, RsvpResponse, Template } from "@/types";

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
  const ref = await addDoc(responsesCol, {
    responseId: "",
    ...input,
    createdAt: Date.now(),
  } as RsvpResponse);
  await updateDoc(ref, { responseId: ref.id });
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
