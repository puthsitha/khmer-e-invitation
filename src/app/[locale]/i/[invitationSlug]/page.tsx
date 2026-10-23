import { Suspense } from "react";
import type { Metadata } from "next";
import { ViewerExperience } from "@/components/viewer/ViewerExperience";
import { getInvitationBySlug } from "@/lib/firebase/firestore";
import { buildEventMetadata } from "@/lib/eventMetadata";
import { MOCK_WEDDING_INVITATION } from "@/lib/mockInvitation";

type Props = {
  params: Promise<{ locale: string; invitationSlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invitationSlug } = await params;

  try {
    let invitation = await getInvitationBySlug(invitationSlug);
    if (!invitation && invitationSlug === MOCK_WEDDING_INVITATION.slug) {
      invitation = MOCK_WEDDING_INVITATION;
    }

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

  return (
    <Suspense fallback={null}>
      <ViewerExperience slug={invitationSlug} />
    </Suspense>
  );
}
