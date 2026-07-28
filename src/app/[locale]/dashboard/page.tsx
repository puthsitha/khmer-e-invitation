"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import { listInvitationsByOwner } from "@/lib/firebase/firestore";
import type { Invitation } from "@/types";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const t = useTranslations("dashboard.list");

  useEffect(() => {
    if (!user) return;
    listInvitationsByOwner(user.uid).then(setInvitations);
  }, [user]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 flex flex-wrap items-center justify-between gap-4"
      >
        <h1 className="font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl">
          {t("title")}
        </h1>
        <Link href="/dashboard/new">
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-cream shadow-md shadow-maroon/20 transition-colors hover:bg-maroon/90"
          >
            <span aria-hidden className="text-base leading-none">+</span>
            {t("newInvitation")}
          </motion.span>
        </Link>
      </motion.div>

      {invitations === null && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-maroon/60"
        >
          {t("loading")}
        </motion.p>
      )}

      {invitations?.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-white/60 px-6 py-16 text-center"
        >
          <span aria-hidden className="text-4xl">✉️</span>
          <p className="font-[family-name:var(--font-heading-km)] text-lg text-maroon">
            {t("emptyTitle")}
          </p>
          <p className="text-sm text-maroon/60">{t("emptyBody")}</p>
        </motion.div>
      )}

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        <AnimatePresence>
          {invitations?.map((invitation) => (
            <motion.li
              key={invitation.invitationId}
              variants={itemVariants}
              layout
            >
              <Link
                href={`/dashboard/${invitation.invitationId}`}
                className="group flex items-center justify-between rounded-2xl border border-gold/30 bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-lg hover:shadow-gold/10"
              >
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-maroon">
                    {invitation.slug}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-maroon/50">
                    <span className="rounded-full bg-cream px-2 py-0.5">
                      {t(`category.${invitation.category}`)}
                    </span>
                    <span
                      className={
                        invitation.status === "published"
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-green-700"
                          : "rounded-full bg-gold/10 px-2 py-0.5 text-maroon/60"
                      }
                    >
                      {t(`status.${invitation.status}`)}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-1 text-sm text-maroon/40 transition-all group-hover:gap-2 group-hover:text-maroon">
                  {t("edit")}
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </main>
  );
}
