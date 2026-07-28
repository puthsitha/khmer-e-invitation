"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/firebase/auth";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin");

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
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="font-[family-name:var(--font-body-km)]"
        >
          {t("loading")}
        </motion.p>
      </main>
    );
  }

  const links = [
    { href: "/admin", label: t("nav.overview") },
    { href: "/admin/users", label: t("nav.users") },
    { href: "/admin/templates", label: t("nav.templates") },
    { href: "/admin/palettes", label: t("nav.palettes") },
  ] as const;

  return (
    <div className="min-h-screen bg-cream">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-gold/30 bg-cream/80 px-6 py-4 backdrop-blur-md"
      >
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link, index) => {
            const isOverview = link.href === "/admin";
            const active = isOverview
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
            return index === 0 ? (
              <Link
                key={link.href}
                href={link.href}
                className="mr-3 font-[family-name:var(--font-heading-km)] text-xl text-maroon transition-opacity hover:opacity-80"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-maroon text-cream"
                    : "text-maroon/70 hover:bg-gold/10 hover:text-maroon"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <motion.button
            type="button"
            onClick={() => logout()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon transition-colors hover:bg-maroon hover:text-cream"
          >
            {t("signOut")}
          </motion.button>
        </div>
      </motion.header>
      {children}
    </div>
  );
}
