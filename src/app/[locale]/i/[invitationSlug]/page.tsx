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
  if (invitationSlug === MOCK_WEDDING_INVITATION.slug) {
    return MOCK_WEDDING_INVITATION;
  }
  try {
    const inv = await getInvitationBySlug(invitationSlug);
    return inv;
  } catch (err) {
    // If permissions denied or server read failed (e.g. draft invitation accessed unauthenticated),
    // return undefined so the client component can authenticate with the browser session and fetch it.
    return undefined;
  }
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
  let initialInvitation: Awaited<ReturnType<typeof resolveInvitationForSlug>> = undefined;
  try {
    initialInvitation = await resolveInvitationForSlug(invitationSlug);
  } catch {
    initialInvitation = undefined;
  }

  return (
    <Suspense fallback={null}>
      <ViewerExperience
        slug={invitationSlug}
        initialInvitation={initialInvitation}
      />
    </Suspense>
  );
}
