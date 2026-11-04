import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewerExperience } from "@/components/viewer/ViewerExperience";
import { getInvitationBySlug, getTemplate } from "@/lib/firebase/firestore";
import { buildEventMetadata } from "@/lib/eventMetadata";
import {
  MOCK_WEDDING_INVITATION,
  createSampleInvitationForTemplate,
} from "@/lib/mockInvitation";

async function resolveInvitationForSlug(invitationSlug: string) {
  if (invitationSlug.startsWith("sample-")) {
    const tplId = invitationSlug.slice("sample-".length);
    const tpl = await getTemplate(tplId).catch(() => null);
    if (tpl) {
      return createSampleInvitationForTemplate(tpl);
    }
  }
  const inv = await getInvitationBySlug(invitationSlug);
  if (!inv && invitationSlug === MOCK_WEDDING_INVITATION.slug) {
    return MOCK_WEDDING_INVITATION;
  }
  return inv;
}

type Props = {
  params: Promise<{ locale: string; invitationSlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invitationSlug } = await params;

  try {
    const invitation = await resolveInvitationForSlug(invitationSlug);

    if (!invitation) {
      return {
        title: "Khmer E-Invitation",
        description:
          "Beautiful animated Khmer-style digital invitations for weddings, birthdays, and special events.",
      };
    }

    const { title, description } = buildEventMetadata(invitation);
    const ogImage =
      invitation.mediaUrls?.gallery?.[0] ||
      "/images/Frame_1.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    };
  } catch (err) {
    console.warn("Failed to generate metadata for invitation:", err);
    return {
      title: "Khmer E-Invitation",
      description:
        "Beautiful animated Khmer-style digital invitations for weddings, birthdays, and special events.",
    };
  }
}

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ invitationSlug: string }>;
}) {
  const { invitationSlug } = await params;
  const initialInvitation = await resolveInvitationForSlug(invitationSlug);

  return (
    <Suspense fallback={null}>
      <ViewerExperience
        slug={invitationSlug}
        initialInvitation={initialInvitation}
      />
    </Suspense>
  );
}
