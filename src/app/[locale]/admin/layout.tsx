"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/firebase/auth";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import {
  LayoutDashboard,
  Menu,
  Palette,
  Users,
  X,
  LayoutTemplate,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    { href: "/admin", label: t("nav.overview"), icon: LayoutDashboard },
    { href: "/admin/users", label: t("nav.users"), icon: Users },
    { href: "/admin/templates", label: t("nav.templates"), icon: LayoutTemplate },
    { href: "/admin/palettes", label: t("nav.palettes"), icon: Palette },
  ] as const;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navLinks = (onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-maroon text-cream"
                : "text-maroon/70 hover:bg-gold/10 hover:text-maroon"
            }`}
          >
            <Icon size={18} strokeWidth={1.75} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream lg:flex">
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gold/30 bg-cream/80 py-6 backdrop-blur-md lg:flex"
      >
        <Link
          href="/admin"
          className="mb-8 px-6 font-[family-name:var(--font-heading-km)] text-xl text-maroon transition-opacity hover:opacity-80"
        >
          {t("nav.overview")}
        </Link>
        {navLinks()}
        <div className="mt-auto flex flex-col gap-3 px-6 pt-6">
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
      </motion.aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile top bar */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-gold/30 bg-cream/80 px-6 py-4 backdrop-blur-md lg:hidden"
        >
          <Link
            href="/admin"
            className="font-[family-name:var(--font-heading-km)] text-xl text-maroon transition-opacity hover:opacity-80"
          >
            {t("nav.overview")}
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t("nav.overview")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-maroon transition-colors hover:bg-gold/10"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
        </motion.header>

        {/* Mobile nav drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 bg-maroon/40 lg:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-cream py-6 shadow-xl lg:hidden"
              >
                <div className="mb-8 flex items-center justify-between px-6">
                  <span className="font-[family-name:var(--font-heading-km)] text-xl text-maroon">
                    {t("nav.overview")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label={t("signOut")}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-maroon transition-colors hover:bg-gold/10"
                  >
                    <X size={20} strokeWidth={1.75} />
                  </button>
                </div>
                {navLinks(() => setMobileNavOpen(false))}
                <div className="mt-auto flex flex-col gap-3 px-6 pt-6">
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
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
