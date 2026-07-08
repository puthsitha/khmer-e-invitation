"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/firebase/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (appUser && appUser.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, appUser, router]);

  if (loading || !user || appUser?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-gold/30 px-6 py-4">
        <nav className="flex gap-4">
          <Link href="/admin" className="font-[family-name:var(--font-heading-km)] text-xl text-maroon">
            Admin
          </Link>
          <Link href="/admin/users" className="self-center text-sm text-maroon/80">
            Users
          </Link>
          <Link href="/admin/templates" className="self-center text-sm text-maroon/80">
            Templates
          </Link>
        </nav>
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
