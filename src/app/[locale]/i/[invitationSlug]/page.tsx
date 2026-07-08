export default async function ViewerPage({
  params,
}: {
  params: Promise<{ invitationSlug: string }>;
}) {
  const { invitationSlug } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
      <p>Invitation &ldquo;{invitationSlug}&rdquo; — viewer experience coming in Phase 4.</p>
    </main>
  );
}
