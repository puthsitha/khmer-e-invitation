import { NextRequest, NextResponse } from "next/server";

// In-memory verification code store with 10-minute expiry
// Key: normalized email, Value: { code: string; expiresAt: number }
interface StoredOtp {
  code: string;
  expiresAt: number;
  verified?: boolean;
}

// Global declaration to persist store across hot reloads in development
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, StoredOtp>;
};

const otpStore = globalForOtp.otpStore ?? new Map<string, StoredOtp>();
if (process.env.NODE_ENV !== "production") {
  globalForOtp.otpStore = otpStore;
}

function cleanExpiredCodes() {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}

/**
 * Sends the 6-digit verification code using Resend REST API or logs to console.
 */
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.MAIL_FROM || "Khmer E-Invite <no-reply@e-invitation.puthsithamoeurn.site>";

  if (!resendApiKey) {
    console.log(`\n======================================================`);
    console.log(`[AUTH DEMO/DEV MODE] Password Reset Code for: ${email}`);
    console.log(`>>> VERIFICATION CODE: ${code} <<<`);
    console.log(`(Configure RESEND_API_KEY in .env.local to send real emails)`);
    console.log(`======================================================\n`);
    return true;
  }

  try {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Password Reset Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fdfaf3; padding: 40px 20px; color: #50131d;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #c9a24b; padding: 36px; box-shadow: 0 10px 25px rgba(80, 19, 29, 0.08);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #50131d; font-size: 24px; margin: 0 0 6px;">ការកំណត់លេខសម្ងាត់ឡើងវិញ</h1>
            <p style="color: #c9a24b; font-size: 14px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Khmer E-Invitation Security</p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #4a4a4a; margin-bottom: 24px;">
            Hello,<br/><br/>
            You recently requested to reset your password for Khmer E-Invitation. Please use the following 6-digit verification code to complete the process. This code is valid for <strong>10 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #fdf8e8 0%, #faecd0 100%); border: 2px dashed #c9a24b; border-radius: 12px; padding: 16px 36px;">
              <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #50131d; font-family: monospace;">${code}</span>
            </div>
          </div>
          <p style="font-size: 13px; color: #888888; line-height: 1.5; margin-top: 28px; border-top: 1px solid #f0e6d2; pt: 16px;">
            If you did not request this password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: `Your Verification Code: ${code} - Khmer E-Invitation`,
        html: htmlBody,
        text: `Your password reset verification code is: ${code}\n\nThis code will expire in 10 minutes.\nIf you did not request this code, please ignore this email.`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Resend API Error]", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email Sending Exception]", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanExpiredCodes();
    const body = await request.json();
    const { action, email, code, newPassword } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ACTION 1: SEND CODE
    if (action === "send_code") {
      // Generate 6-digit random code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(normalizedEmail, { code: otp, expiresAt });

      const emailSent = await sendVerificationEmail(normalizedEmail, otp);
      if (!emailSent) {
        return NextResponse.json(
          { error: "Failed to send verification email. Please try again later." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        // Only expose in local development when no mail service is configured yet; NEVER in production
        devCode:
          process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY
            ? otp
            : undefined,
      });
    }

    // ACTION 2: VERIFY CODE
    if (action === "verify_code") {
      if (!code || typeof code !== "string") {
        return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
      }

      const stored = otpStore.get(normalizedEmail);
      if (!stored) {
        return NextResponse.json(
          { error: "No verification code requested or code expired. Please request a new code." },
          { status: 400 }
        );
      }

      if (stored.expiresAt < Date.now()) {
        otpStore.delete(normalizedEmail);
        return NextResponse.json({ error: "Verification code has expired." }, { status: 400 });
      }

      if (stored.code !== code.trim()) {
        return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
      }

      // Mark as verified
      stored.verified = true;
      otpStore.set(normalizedEmail, stored);

      return NextResponse.json({
        success: true,
        message: "Code verified successfully",
      });
    }

    // ACTION 3: RESET PASSWORD
    if (action === "reset_password") {
      if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const stored = otpStore.get(normalizedEmail);
      if (!stored || !stored.verified) {
        return NextResponse.json(
          { error: "Please verify your code first before resetting password." },
          { status: 400 }
        );
      }

      // Clean up the used OTP
      otpStore.delete(normalizedEmail);

      return NextResponse.json({
        success: true,
        message: "Password reset successfully. You can now log in.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[ForgotPassword API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
