"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";

export function SiteNav() {
  const t = useTranslations("nav");
  const { user, appUser, loading } = useAuth();

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
          <button type="button" onClick={() => logout()} className="hover:underline">
            {t("logout")}
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:underline">
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-maroon px-4 py-1.5 text-cream hover:opacity-90"
          >
            {t("register")}
          </Link>
        </>
      )}
    </nav>
  );
}
