"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { listAllUsers, setUserStatus } from "@/lib/firebase/firestore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AppUser } from "@/types";

type PendingAction = { user: AppUser; type: "suspend" | "role" };

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");

  useEffect(() => {
    listAllUsers().then(setUsers);
  }, []);

  async function toggleSuspended(u: AppUser) {
    await setUserStatus(u.uid, { suspended: !u.suspended });
    setUsers((prev) =>
      prev.map((x) => (x.uid === u.uid ? { ...x, suspended: !x.suspended } : x)),
    );
  }

  async function toggleRole(u: AppUser) {
    const role = u.role === "admin" ? "user" : "admin";
    await setUserStatus(u.uid, { role });
    setUsers((prev) => prev.map((x) => (x.uid === u.uid ? { ...x, role } : x)));
  }

  async function confirmPendingAction() {
    if (!pendingAction) return;
    if (pendingAction.type === "suspend") {
      await toggleSuspended(pendingAction.user);
    } else {
      await toggleRole(pendingAction.user);
    }
    setPendingAction(null);
  }

  const confirmCopy = (() => {
    if (!pendingAction) return null;
    const { user, type } = pendingAction;
    if (type === "suspend") {
      return user.suspended
        ? {
            title: t("confirmReinstateTitle", { name: user.name }),
            body: t("confirmReinstateBody"),
            confirmLabel: t("reinstate"),
            destructive: false,
          }
        : {
            title: t("confirmSuspendTitle", { name: user.name }),
            body: t("confirmSuspendBody"),
            confirmLabel: t("suspend"),
            destructive: true,
          };
    }
    return user.role === "admin"
      ? {
          title: t("confirmDemoteTitle", { name: user.name }),
          body: t("confirmDemoteBody"),
          confirmLabel: t("demote"),
          destructive: true,
        }
      : {
          title: t("confirmMakeAdminTitle", { name: user.name }),
          body: t("confirmMakeAdminBody"),
          confirmLabel: t("makeAdmin"),
          destructive: false,
        };
  })();

  return (
    <main className="max-w-4xl px-6 py-10 sm:py-14">
      <div className="overflow-x-auto rounded-2xl border border-gold/30 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gold/20 text-xs uppercase tracking-wide text-maroon/50">
              <th className="px-5 py-3 font-medium">{t("name")}</th>
              <th className="px-2 py-3 font-medium">{t("email")}</th>
              <th className="px-2 py-3 font-medium">{t("role")}</th>
              <th className="px-2 py-3 font-medium">{t("status")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <motion.tbody variants={listVariants} initial="hidden" animate="show">
            {users.map((u) => (
              <motion.tr
                key={u.uid}
                variants={rowVariants}
                className="border-b border-gold/10 last:border-0 transition-colors hover:bg-cream/60"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-maroon">
                      {u.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="font-medium text-maroon">{u.name}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-maroon/70">{u.email}</td>
                <td className="px-2 py-3">
                  <span
                    className={
                      u.role === "admin"
                        ? "rounded-full bg-maroon/10 px-2.5 py-1 text-xs font-medium text-maroon"
                        : "rounded-full bg-cream px-2.5 py-1 text-xs text-maroon/60"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      aria-hidden
                      className={
                        u.suspended
                          ? "h-2 w-2 rounded-full bg-red-500"
                          : "h-2 w-2 rounded-full bg-green-500"
                      }
                    />
                    {u.suspended ? t("suspended") : t("active")}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setPendingAction({ user: u, type: "suspend" })}
                      disabled={u.uid === currentUser?.uid}
                      whileHover={{ scale: u.uid === currentUser?.uid ? 1 : 1.04 }}
                      whileTap={{ scale: u.uid === currentUser?.uid ? 1 : 0.96 }}
                      className="cursor-pointer rounded-full border border-gold/60 px-3 py-1 text-xs text-maroon transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {u.suspended ? t("reinstate") : t("suspend")}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setPendingAction({ user: u, type: "role" })}
                      disabled={u.uid === currentUser?.uid}
                      whileHover={{ scale: u.uid === currentUser?.uid ? 1 : 1.04 }}
                      whileTap={{ scale: u.uid === currentUser?.uid ? 1 : 0.96 }}
                      className="cursor-pointer rounded-full border border-gold/60 px-3 py-1 text-xs text-maroon transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {u.role === "admin" ? t("demote") : t("makeAdmin")}
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={confirmCopy?.title ?? ""}
        body={confirmCopy?.body}
        confirmLabel={confirmCopy?.confirmLabel ?? ""}
        cancelLabel={tCommon("cancel")}
        destructive={confirmCopy?.destructive}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </main>
  );
}
