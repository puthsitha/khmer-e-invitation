"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  X,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (email: string) => void;
}

type Step = "email" | "otp" | "new_password" | "success";

export function ForgotPasswordModal({
  isOpen,
  onClose,
  initialEmail = "",
  onSuccess,
}: ForgotPasswordModalProps) {
  const t = useTranslations("auth");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Resend countdown timer
  const [resendCountdown, setResendCountdown] = useState(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const resetAll = () => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setDevCode(null);
    setResendCountdown(60);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // STEP 1: SEND CODE
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("emailRequired"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_code", email: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      if (data.devCode) {
        setDevCode(data.devCode);
      }

      setStep("otp");
      setResendCountdown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleOtpChange = (index: number, val: string) => {
    setError(null);
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto advance focus to next field
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError(t("invalidCode"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_code",
          email: email.trim(),
          code: fullCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("invalidCode"));
      }

      setStep("new_password");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(t("passwordLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          email: email.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("genericError"));
      }

      setStep("success");
      onSuccess?.(email.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-gold/40 bg-[#fffdfa] p-6 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-maroon/60 transition-colors hover:bg-gold/15 hover:text-maroon focus:outline-hidden cursor-pointer"
              aria-label={t("close")}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Back button (when in OTP or new password step) */}
            {step === "otp" && (
              <button
                type="button"
                onClick={() => setStep("email")}
                className="absolute left-4 top-4 flex items-center gap-1 rounded-full p-2 text-xs font-medium text-maroon/70 transition-colors hover:bg-gold/15 hover:text-maroon cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-light shadow-2xs">
                {step === "success" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <KeyRound className="h-6 w-6 text-maroon" />
                )}
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
                {step === "success"
                  ? t("resetSuccessTitle")
                  : t("forgotPasswordTitle")}
              </h2>
              <p className="mt-1 text-xs text-maroon/75">
                {step === "email" && t("forgotPasswordSubtitle")}
                {step === "otp" && t("enterCodeSubtitle", { email })}
                {step === "new_password" &&
                  "Enter and confirm your new secure password"}
                {step === "success" && t("resetSuccessMessage")}
              </p>
              <div className="my-2.5 flex justify-center">
                <OrnamentDivider variant={2} />
              </div>
            </div>

            {/* Error Notification */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 1: EMAIL */}
            {step === "email" && (
              <form onSubmit={handleSendCode} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-medium text-maroon/80 mb-1.5"
                  >
                    {t("email")}
                  </label>
                  <div className="relative">
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full rounded-xl border border-gold/30 bg-cream/50 px-4 py-3 text-sm text-maroon placeholder:text-maroon/40 focus:border-gold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-gold/20"
                    />
                    <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-maroon/40 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-maroon py-3 text-sm font-semibold text-cream shadow-md transition-all hover:bg-maroon/95 disabled:opacity-75 cursor-pointer"
                >
                  {loading ? t("sendingCode") : t("sendVerificationCode")}
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="mt-4 space-y-5">
                {/* Dev Mode Code Assist Box (Strictly local development only, NEVER in production) */}
                {process.env.NODE_ENV === "development" && devCode && (
                  <div className="rounded-xl border border-gold/40 bg-gold/10 p-2.5 text-center text-xs text-maroon">
                    <span className="font-semibold text-gold-light">
                      🧪 Dev/Demo Code:{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = devCode.split("");
                        setOtp(digits);
                      }}
                      className="ml-1 font-mono font-bold tracking-widest text-maroon underline cursor-pointer"
                    >
                      {devCode} (Click to auto-fill)
                    </button>
                  </div>
                )}

                <div>
                  <div
                    className="flex justify-between gap-2"
                    onPaste={handlePasteOtp}
                  >
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="h-12 w-12 rounded-xl border border-gold/35 bg-cream/50 text-center font-mono text-xl font-bold text-maroon transition-all focus:border-gold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-gold/30 sm:h-13 sm:w-13"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-maroon/70">
                  <span>
                    {resendCountdown > 0
                      ? t("resendIn", { seconds: resendCountdown })
                      : ""}
                  </span>
                  {resendCountdown === 0 && (
                    <button
                      type="button"
                      onClick={() => handleSendCode()}
                      disabled={loading}
                      className="inline-flex items-center gap-1 font-semibold text-gold-light hover:text-maroon underline cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>{t("resendCode")}</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full rounded-xl bg-maroon py-3 text-sm font-semibold text-cream shadow-md transition-all hover:bg-maroon/95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? t("verifyingCode") : t("verifyCode")}
                </button>
              </form>
            )}

            {/* STEP 3: NEW PASSWORD */}
            {step === "new_password" && (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-medium text-maroon/80 mb-1.5"
                  >
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gold/30 bg-cream/50 px-4 py-3 pr-10 text-sm text-maroon placeholder:text-maroon/40 focus:border-gold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-gold/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-maroon/50 hover:text-maroon cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-medium text-maroon/80 mb-1.5"
                  >
                    {t("confirmPassword")}
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gold/30 bg-cream/50 px-4 py-3 text-sm text-maroon placeholder:text-maroon/40 focus:border-gold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-maroon py-3 text-sm font-semibold text-cream shadow-md transition-all hover:bg-maroon/95 disabled:opacity-75 cursor-pointer"
                >
                  {loading ? t("resettingPassword") : t("resetPasswordButton")}
                </button>
              </form>
            )}

            {/* STEP 4: SUCCESS */}
            {step === "success" && (
              <div className="mt-5 space-y-4 text-center">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-800">
                  {t("resetSuccessMessage")}
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl bg-maroon py-3 text-sm font-semibold text-cream shadow-md transition-all hover:bg-maroon/95 cursor-pointer"
                >
                  {t("backToLogin")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
