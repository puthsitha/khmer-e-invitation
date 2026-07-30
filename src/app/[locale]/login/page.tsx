"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { loginWithEmail } from "@/lib/firebase/auth";
import { getUserDoc } from "@/lib/firebase/firestore";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await loginWithEmail(email, password);
      const appUser = await getUserDoc(user.uid);
      router.push(appUser?.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-cream px-6">
      {/* Ambient animated backdrop: soft, slow-drifting gold/maroon orbs. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="login-orb absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/30 blur-3xl"
          style={{ ["--orb-drift-x" as string]: "6%", ["--orb-drift-y" as string]: "8%" }}
        />
        <div
          className="login-orb absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-maroon/20 blur-3xl"
          style={{
            ["--orb-drift-x" as string]: "-5%",
            ["--orb-drift-y" as string]: "-7%",
            animationDelay: "-4s",
          }}
        />
        <div
          className="login-orb absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-gold-light/30 blur-3xl"
          style={{
            ["--orb-drift-x" as string]: "4%",
            ["--orb-drift-y" as string]: "-6%",
            animationDelay: "-8s",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-3"
      >
        <h1 className="font-[family-name:var(--font-heading-km)] text-3xl text-maroon">
          {t("loginTitle")}
        </h1>
        <OrnamentDivider variant={2} />
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-gold/30 bg-white/70 p-6 shadow-lg backdrop-blur-md"
      >
        <input
          type="email"
          required
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gold/40 bg-white px-4 py-2"
        />
        <PasswordInput
          required
          placeholder={t("password")}
          value={password}
          onChange={setPassword}
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="rounded-full bg-maroon px-6 py-2 text-cream disabled:opacity-60"
        >
          {t("loginButton")}
        </motion.button>
      </motion.form>
    </main>
  );
}
