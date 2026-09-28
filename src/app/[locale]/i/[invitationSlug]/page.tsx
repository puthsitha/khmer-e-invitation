import { Suspense } from "react";
import { ViewerExperience } from "@/components/viewer/ViewerExperience";

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

