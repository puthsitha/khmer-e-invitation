"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function SiteNav() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { user, appUser, loading } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  return (
    <nav className="flex items-center gap-4 text-sm text-maroon">
      {loading ? null : user ? (
        <>
          <Link href="/dashboard" className="hover:underline">
            {t("dashboard")}
          </Link>
          {appUser?.role === "admin" && (
            <Link href="/admin" className="hover:underline">
              {t("admin")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setConfirmingSignOut(true)}
            className="hover:underline"
          >
            {t("logout")}
          </button>
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
        </>
      ) : (
        <Link href="/login" className="hover:underline">
          {t("login")}
        </Link>
      )}
    </nav>
  );
}
