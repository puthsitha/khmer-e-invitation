import type { Invitation } from "@/types";
import { asBilingual } from "@/lib/bilingual";

export interface EventMetadataInfo {
  title: string;
  description: string;
}

/**
 * Formats event metadata title and description based on the name of the event.
 * Example output:
 * "សុខ ចិន្តា & កែវ មុន្នីរ័ត្ន . Sok Chenda & Keo Monyroth -- សិរីមង្គលអាពាហ៍ពិពាហ៍"
 */
export function buildEventMetadata(
  invitation: Invitation | null | undefined,
): EventMetadataInfo {
  if (!invitation) {
    return {
      title: "Khmer E-Invitation",
      description:
        "Beautiful animated Khmer-style digital invitations for weddings, birthdays, and special events.",
    };
  }

  const groom = asBilingual(invitation.content?.groomName);
  const bride = asBilingual(invitation.content?.brideName);

  const groomKm = groom.km?.trim() || "";
  const brideKm = bride.km?.trim() || "";
  const kmParts: string[] = [];
  if (groomKm) kmParts.push(groomKm);
  if (brideKm) kmParts.push(brideKm);
  const namesKm = kmParts.join(" & ");

  const groomEn = groom.en?.trim() || "";
  const brideEn = bride.en?.trim() || "";
  const enParts: string[] = [];
  if (groomEn) enParts.push(groomEn);
  if (brideEn) enParts.push(brideEn);
  const namesEn = enParts.join(" & ");

  let namesCombined = "";
  if (namesKm && namesEn && namesKm !== namesEn) {
    namesCombined = `${namesKm} . ${namesEn}`;
  } else {
    namesCombined = namesKm || namesEn || "";
  }

  let occasion = "សិរីមង្គលអាពាហ៍ពិពាហ៍";
  if (invitation.category === "birthday") {
    occasion = "ពិធីខួបកំណើត";
  } else if (invitation.category === "event") {
    occasion = "កម្មវិធីពិសេស";
  }

  const formatted = namesCombined
    ? `${namesCombined} -- ${occasion}`
    : occasion;

  return {
    title: formatted,
    description: formatted,
  };
}
