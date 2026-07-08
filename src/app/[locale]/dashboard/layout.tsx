"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/firebase/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (appUser?.suspended) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <p>Your account has been suspended. Contact the site admin for help.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-gold/30 px-6 py-4">
        <Link href="/dashboard" className="font-[family-name:var(--font-heading-km)] text-xl text-maroon">
          {appUser?.name ?? user.email}
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon"
        >
          Sign out
        </button>
      </header>
      {children}
    </div>
  );
}
