"use client";

import { useEffect, useState } from "react";
import { listAllInvitations, listAllUsers } from "@/lib/firebase/firestore";

export default function AdminOverviewPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [invitationCounts, setInvitationCounts] = useState<{
    total: number;
    published: number;
  } | null>(null);

  useEffect(() => {
    listAllUsers().then((users) => setUserCount(users.length));
    listAllInvitations().then((invitations) =>
      setInvitationCounts({
        total: invitations.length,
        published: invitations.filter((i) => i.status === "published").length,
      }),
    );
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
        Overview
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Registered users" value={userCount} />
        <StatCard label="Invitations" value={invitationCounts?.total ?? null} />
        <StatCard label="Published" value={invitationCounts?.published ?? null} />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-white p-6 text-center">
      <p className="text-3xl font-semibold text-maroon">{value ?? "…"}</p>
      <p className="text-sm text-foreground/60">{label}</p>
    </div>
  );
}
