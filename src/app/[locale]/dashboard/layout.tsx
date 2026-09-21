"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
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
  const pathname = usePathname();
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
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-gold/30 border-t-maroon" />
          <p className="font-[family-name:var(--font-heading-km)] text-sm text-maroon/70">
            {t("loading")}
          </p>
        </div>
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

  // Check if we are inside an invitation editor dashboard (/dashboard/[invitationId])
  const isInvitationEditor =
    pathname.startsWith("/dashboard/") && pathname !== "/dashboard/new";

  return (
    <div className="min-h-screen bg-cream">
      {/* Standard top header shown on /dashboard and /dashboard/new */}
      {!isInvitationEditor && (
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 z-40 flex items-center justify-between border-b border-gold/30 bg-cream/85 px-6 py-4 backdrop-blur-md"
        >
          <Link
            href="/dashboard"
            className="font-[family-name:var(--font-heading-km)] text-xl text-maroon transition-opacity hover:opacity-80"
          >
            {appUser?.name ?? user.displayName ?? user.email?.split("@")[0]}
          </Link>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <motion.button
              type="button"
              onClick={() => setConfirmingSignOut(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer rounded-full border border-gold/60 px-4 py-1.5 text-xs font-semibold text-maroon transition-colors hover:bg-maroon hover:text-cream"
            >
              {t("signOut")}
            </motion.button>
          </div>
        </motion.header>
      )}

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
