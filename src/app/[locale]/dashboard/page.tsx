"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import { listInvitationsByOwner } from "@/lib/firebase/firestore";
import type { Invitation } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);

  useEffect(() => {
    if (!user) return;
    listInvitationsByOwner(user.uid).then(setInvitations);
  }, [user]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
          Your invitations
        </h1>
        <Link
          href="/dashboard/new"
          className="rounded-full bg-maroon px-5 py-2 text-sm text-cream"
        >
          + New invitation
        </Link>
      </div>

      {invitations === null && <p className="text-maroon/60">Loading…</p>}
      {invitations?.length === 0 && (
        <p className="text-maroon/60">
          No invitations yet — create your first one.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {invitations?.map((invitation) => (
          <li key={invitation.invitationId}>
            <Link
              href={`/dashboard/${invitation.invitationId}`}
              className="flex items-center justify-between rounded-xl border border-gold/30 bg-white px-5 py-4 hover:border-gold"
            >
              <span>
                <span className="font-medium text-maroon">
                  {invitation.slug}
                </span>{" "}
                <span className="text-sm text-maroon/60">
                  ({invitation.category}, {invitation.status})
                </span>
              </span>
              <span className="text-sm text-maroon/40">Edit →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
