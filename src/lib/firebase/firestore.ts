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
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./client";
import type { AppUser, Invitation, RsvpResponse, Template } from "@/types";

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

export async function getUserDoc(uid: string) {
  const snap = await getDoc(doc(usersCol, uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserDocIfMissing(user: {
  uid: string;
  name: string;
  email: string;
}) {
  const ref = doc(usersCol, user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return existing.data();

  const appUser: AppUser = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: "user",
    suspended: false,
    createdAt: Date.now(),
  };
  await setDoc(ref, appUser);
  return appUser;
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
  await setDoc(ref, invitation);
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

export async function getInvitationBySlug(slug: string) {
  const q = query(invitationsCol, where("slug", "==", slug));
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].data();
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

export async function createTemplate(
  input: Omit<Template, "templateId">,
) {
  const ref = doc(templatesCol);
  const template: Template = { ...input, templateId: ref.id };
  await setDoc(ref, template);
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
