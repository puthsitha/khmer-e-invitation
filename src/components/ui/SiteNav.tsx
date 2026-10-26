"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useRouter } from "@/i18n/navigation";

export function SiteNav() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { user, appUser, loading } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  return (
    <nav className="flex items-center gap-4 text-sm text-maroon dark:text-[#f6eee8]">
      {loading ? (
        <div className="h-5 w-14 rounded-full bg-gold/20 dark:bg-gold/15 animate-pulse" />
      ) : user ? (
        <>
          {appUser?.role === "admin" ? (
            <Link href="/admin" className="hover:underline">
              {t("adminDashboard")}
            </Link>
          ) : (
            <Link href="/dashboard" className="hover:underline">
              {t("dashboard")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setConfirmingSignOut(true)}
            className="cursor-pointer hover:underline">
            {t("logout")}
          </button>
          <ConfirmDialog
            open={confirmingSignOut}
            title={tCommon("signOutTitle")}
            body={tCommon("signOutBody")}
            confirmLabel={tCommon("signOut")}
            cancelLabel={tCommon("cancel")}
            onConfirm={async () => {
              setConfirmingSignOut(false);
              try {
                await logout();
              } catch (err) {
                console.warn("Logout error:", err);
              }
              window.location.href = `/${locale}`;
            }}
            onCancel={() => setConfirmingSignOut(false)}
          />
        </>
      ) : (
        <Link href="/login" className="hover:underline">
          {t("login")}
        </Link>
      )}
    </nav>
  );
}
