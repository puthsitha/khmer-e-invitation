"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/navigation";
import { listInvitationsByOwner, deleteInvitation } from "@/lib/firebase/firestore";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Invitation } from "@/types";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.25 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [deletingInvitation, setDeletingInvitation] = useState<Invitation | null>(null);
  const t = useTranslations("dashboard.list");
  const tCommon = useTranslations("common");

  useEffect(() => {
    if (!user) return;
    listInvitationsByOwner(user.uid).then(setInvitations);
  }, [user]);

  async function handleConfirmDelete() {
    if (!deletingInvitation) return;
    const targetId = deletingInvitation.invitationId;
    try {
      await deleteInvitation(targetId);
      setInvitations((prev) => (prev ? prev.filter((i) => i.invitationId !== targetId) : []));
    } catch (err) {
      console.error("Failed to delete invitation:", err);
    } finally {
      setDeletingInvitation(null);
    }
  }

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
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/new">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-maroon/20 transition-colors hover:bg-maroon/90 cursor-pointer"
            >
              <span aria-hidden className="text-base leading-none">+</span>
              {t("newInvitation")}
            </motion.span>
          </Link>
        </div>
      </motion.div>

      {invitations === null && <DashboardSkeleton type="list" />}

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
        <AnimatePresence initial={false}>
          {invitations?.map((invitation) => (
            <motion.li
              key={invitation.invitationId}
              variants={itemVariants}
              layout
            >
              <div className="group flex items-center justify-between rounded-2xl border border-gold/30 bg-white p-4 shadow-xs transition-all duration-300 hover:border-gold/60 hover:shadow-md sm:px-5 sm:py-4">
                {/* Left Info (Link to Editor) */}
                <Link
                  href={`/dashboard/${invitation.invitationId}`}
                  className="flex-1 min-w-0"
                >
                  <span className="flex flex-col gap-1 min-w-0">
                    <span className="font-semibold text-maroon text-base transition-colors group-hover:text-gold truncate">
                      {invitation.slug}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-maroon/50">
                      <span className="rounded-full bg-cream border border-gold/20 px-2.5 py-0.5 font-medium">
                        {t(`category.${invitation.category}`)}
                      </span>
                      <span
                        className={
                          invitation.status === "published"
                            ? "rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-emerald-700 font-semibold"
                            : "rounded-full bg-gold/10 border border-gold/25 px-2.5 py-0.5 text-maroon/60 font-medium"
                        }
                      >
                        {t(`status.${invitation.status}`)}
                      </span>
                    </span>
                  </span>
                </Link>

                {/* Right Actions: Edit Button + Delete Button */}
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Link
                    href={`/dashboard/${invitation.invitationId}`}
                    className="flex items-center gap-1.5 rounded-xl border border-gold/30 bg-cream/40 px-3.5 py-2 text-xs font-semibold text-maroon/80 hover:bg-gold/15 hover:text-maroon transition-all cursor-pointer"
                  >
                    <span>{t("edit")}</span>
                    <span aria-hidden>→</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeletingInvitation(invitation)}
                    title={t("delete")}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-maroon/40 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Delete Invitation Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingInvitation)}
        title={t("deleteTitle")}
        body={`${t("deleteConfirm")} (${deletingInvitation?.slug})`}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive={true}
        onCancel={() => setDeletingInvitation(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
