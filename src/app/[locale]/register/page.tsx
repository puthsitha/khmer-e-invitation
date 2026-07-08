"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { loginWithGoogle, registerWithEmail } from "@/lib/firebase/auth";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerWithEmail(name, email, password);
      router.push("/dashboard");
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6">
      <h1 className="font-[family-name:var(--font-heading-km)] text-3xl text-maroon">
        {t("registerTitle")}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="text"
          required
          placeholder={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gold/40 bg-white px-4 py-2"
        />
        <input
          type="email"
          required
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gold/40 bg-white px-4 py-2"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gold/40 bg-white px-4 py-2"
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-maroon px-6 py-2 text-cream disabled:opacity-60"
        >
          {t("registerButton")}
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="rounded-full border border-gold/60 px-6 py-2 text-maroon disabled:opacity-60"
        >
          {t("googleButton")}
        </button>
      </form>
      <p className="text-sm text-maroon/70">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-maroon underline">
          {t("goLogin")}
        </Link>
      </p>
    </main>
  );
}
