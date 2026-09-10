"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { loginWithEmail } from "@/lib/firebase/auth";
import { getUserDoc } from "@/lib/firebase/firestore";
import { MuiInput } from "@/components/ui/MuiInput";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { InteractiveAuthHero } from "@/components/auth/InteractiveAuthHero";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { AlertCircle } from "lucide-react";

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // States driving the hero character animations
  const [activeField, setActiveField] = useState<"email" | "password" | null>(
    null,
  );
  const [passwordVisible, setPasswordVisible] = useState(false);

  function validateGmail(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return t("emailRequired");
    }
    if (!GMAIL_REGEX.test(trimmed)) {
      return t("invalidGmail");
    }
    return null;
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setFormError(null);
    if (emailError) {
      // Clear or update error in real-time once user starts fixing it
      setEmailError(validateGmail(value));
    }
  }

  function handleEmailBlur() {
    setActiveField(null);
    if (email.length > 0) {
      setEmailError(validateGmail(email));
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setFormError(null);
    if (passwordError && value.length > 0) {
      setPasswordError(null);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const gmailErr = validateGmail(email);
    if (gmailErr) {
      setEmailError(gmailErr);
      return;
    }

    if (!password) {
      setPasswordError(t("passwordRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const user = await loginWithEmail(email.trim(), password);
      const appUser = await getUserDoc(user.uid);
      router.push(appUser?.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setFormError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-12 sm:px-6">
      {/* Top right Language Switcher */}
      <div className="absolute right-4 top-4 z-30">
        <LocaleSwitcher />
      </div>

      {/* Ambient animated backdrop: soft drifting gold/maroon orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="login-orb absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/30 blur-3xl"
          style={{
            ["--orb-drift-x" as string]: "6%",
            ["--orb-drift-y" as string]: "8%",
          }}
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

      {/* Main Card Container with Two-Column Hero layout on Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-4xl grid-cols-1 items-stretch gap-6 overflow-hidden rounded-3xl border border-gold/30 bg-white/75 p-4 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-2 lg:gap-8">
        {/* Left Column: Interactive Animated Characters Hero (inspired by reference video) */}
        <div className="flex items-center justify-center bg-transparent p-2 sm:p-4">
          <InteractiveAuthHero
            activeField={activeField}
            passwordVisible={passwordVisible}
            isSubmitting={submitting}
            hasError={Boolean(formError || emailError)}
            className="w-full max-w-sm"
          />
        </div>

        {/* Right Column: Material UI Outlined Form Card */}
        <div className="flex flex-col justify-center px-2 py-4 sm:px-6">
          <div className="mb-6 flex flex-col items-center text-center">
            <h1 className="font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl">
              {t("loginTitle")}
            </h1>
            <p className="mt-1 text-sm text-maroon/70">{t("subtitle")}</p>
            <div className="mt-2 flex w-full justify-center">
              <OrnamentDivider variant={2} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Material UI Outlined Email Input with Gmail Validation */}
            <MuiInput
              id="login-email"
              label={t("email")}
              type="email"
              value={email}
              onChange={handleEmailChange}
              onFocus={() => setActiveField("email")}
              onBlur={handleEmailBlur}
              error={emailError}
              required
              autoComplete="email"
              disabled={submitting}
            />

            {/* Material UI Outlined Password Input with Toggle */}
            <MuiInput
              id="login-password"
              label={t("password")}
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setActiveField("password")}
              onBlur={() => setActiveField(null)}
              error={passwordError}
              required
              autoComplete="current-password"
              disabled={submitting}
              showPasswordToggle
              onPasswordVisibilityChange={setPasswordVisible}
            />

            {/* Form-level Error Message */}
            <AnimatePresence>
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs font-medium text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{formError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated Loading Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? undefined : { scale: 1.015 }}
              whileTap={submitting ? undefined : { scale: 0.985 }}
              transition={{ duration: 0.15 }}
              className="group relative mt-2 flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-maroon text-sm font-semibold text-cream shadow-md transition-all duration-200 hover:bg-maroon/95 disabled:cursor-not-allowed disabled:opacity-75">
              <AnimatePresence mode="wait">
                {submitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2.5">
                    <svg
                      className="h-4 w-4 animate-spin text-cream"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{t("loggingIn")}</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}>
                    {t("loginButton")}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
