"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/firebase/auth";

export default function DashboardPage() {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream text-maroon">
      <p>Welcome, {appUser?.name ?? user.email}.</p>
      <p className="text-sm text-foreground/70">
        Invitation CRUD, template selection, and media upload land in Phase 3.
      </p>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-full border border-gold/60 px-6 py-2"
      >
        Sign out
      </button>
    </main>
  );
}
