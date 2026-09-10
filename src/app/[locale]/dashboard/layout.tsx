"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/firebase/auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (appUser?.role === "admin") {
      router.replace("/admin");
    }
  }, [loading, user, appUser, router]);

  if (loading || !user || appUser?.role === "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream text-maroon">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="font-[family-name:var(--font-body-km)]">
          {t("loading")}
        </motion.p>
      </main>
    );
  }

  if (appUser?.suspended) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-center text-maroon">
        <p className="font-[family-name:var(--font-body-km)] max-w-md">
          {t("suspended")}
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-40 flex items-center justify-between border-b border-gold/30 bg-cream/80 px-6 py-4 backdrop-blur-md">
        <Link
          href="/dashboard"
          className="font-[family-name:var(--font-heading-km)] text-xl text-maroon transition-opacity hover:opacity-80">
          {appUser?.name ?? user.email}
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <motion.button
            type="button"
            onClick={() => setConfirmingSignOut(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon transition-colors hover:bg-maroon hover:text-cream">
            {t("signOut")}
          </motion.button>
        </div>
      </motion.header>
      {children}
      <ConfirmDialog
        open={confirmingSignOut}
        title={tCommon("signOutTitle")}
        body={tCommon("signOutBody")}
        confirmLabel={tCommon("signOut")}
        cancelLabel={tCommon("cancel")}
        onConfirm={() => {
          setConfirmingSignOut(false);
          logout();
        }}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </div>
  );
}
