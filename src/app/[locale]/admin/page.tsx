"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";

export default function AdminPage() {
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
    <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
      <p>Admin — user/template management lands in Phase 3.</p>
    </main>
  );
}
