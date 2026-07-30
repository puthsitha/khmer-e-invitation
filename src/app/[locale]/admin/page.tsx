"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { listAllInvitations, listAllUsers } from "@/lib/firebase/firestore";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function AdminOverviewPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [invitationCounts, setInvitationCounts] = useState<{
    total: number;
    published: number;
  } | null>(null);
  const t = useTranslations("admin.overview");

  useEffect(() => {
    listAllUsers().then((users) => setUserCount(users.length));
    listAllInvitations().then((invitations) =>
      setInvitationCounts({
        total: invitations.length,
        published: invitations.filter((i) => i.status === "published").length,
      }),
    );
  }, []);

  return (
    <main className="max-w-3xl px-6 py-10 sm:py-14">
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard label={t("users")} value={userCount} />
        <StatCard label={t("invitations")} value={invitationCounts?.total ?? null} />
        <StatCard label={t("published")} value={invitationCounts?.published ?? null} />
      </motion.div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-gold/30 bg-white p-6 text-center shadow-sm"
    >
      <p className="text-3xl font-semibold text-maroon">{value ?? "…"}</p>
      <p className="text-sm text-maroon/60">{label}</p>
    </motion.div>
  );
}
