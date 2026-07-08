import { ViewerExperience } from "@/components/viewer/ViewerExperience";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ invitationSlug: string }>;
}) {
  const { invitationSlug } = await params;

  return <ViewerExperience slug={invitationSlug} />;
}
