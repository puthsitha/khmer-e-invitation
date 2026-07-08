import { getInvitationBySlug } from "@/lib/firebase/firestore";

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(base: string) {
  const root = slugify(base) || "invitation";
  let candidate = root;
  let suffix = 1;
  while (await getInvitationBySlug(candidate)) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}
