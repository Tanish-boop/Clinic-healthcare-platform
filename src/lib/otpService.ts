import crypto from "crypto";
import { db } from "./db";
import { hashPassword } from "./auth";

export type OtpType = "EMAIL_VERIFY" | "PHONE_VERIFY" | "PASSWORD_RESET";
export type OtpChannel = "EMAIL" | "SMS";

interface SendOtpParams {
  identifier: string; // Email or 10-digit mobile number
  type: OtpType;
  channel?: OtpChannel;
}

interface VerifyOtpParams {
  identifier: string;
  code: string;
  type: OtpType;
}

interface ResetPasswordParams {
  identifier: string;
  code: string;
  newPassword: string;
}

/**
 * Normalizes email or mobile number to ensure consistent lookups.
 */
export function normalizeIdentifier(raw: string): { normalized: string; channel: OtpChannel } {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    return { normalized: trimmed.toLowerCase(), channel: "EMAIL" };
  }
  // Strip non-digits for phone numbers (e.g. "+91 98230 45678" -> "+919823045678")
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return { normalized: `+91${digits}`, channel: "SMS" };
  } else if (digits.length > 10 && digits.startsWith("91")) {
    return { normalized: `+${digits}`, channel: "SMS" };
  }
  return { normalized: trimmed, channel: "SMS" };
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateSecureCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Dispatches a 6-digit OTP code to an email address or mobile number.
 */
export async function sendOtp({ identifier, type, channel: explicitChannel }: SendOtpParams) {
  const { normalized, channel: detectedChannel } = normalizeIdentifier(identifier);
  const channel = explicitChannel || detectedChannel;

  // 1. Rate Limit Cooldown (60 seconds)
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentOtp = await db.otpVerification.findFirst({
    where: {
      identifier: normalized,
      type,
      createdAt: { gte: oneMinuteAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
    const retryAfter = Math.max(1, 60 - elapsedSeconds);
    return {
      success: false,
      error: `Please wait ${retryAfter} seconds before requesting a new OTP code.`,
      retryAfter,
    };
  }

  // 2. Invalidate older pending OTPs for this identifier & type
  await db.otpVerification.deleteMany({
    where: {
      identifier: normalized,
      type,
      verified: false,
    },
  });

  // 3. Generate 6-digit code with 10-minute validity
  const code = generateSecureCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.otpVerification.create({
    data: {
      identifier: normalized,
      code,
      type,
      channel,
      expiresAt,
      attempts: 0,
      verified: false,
    },
  });

  // 4. Clinical Provider Dispatch / Terminal Simulation
  console.log(`\n======================================================`);
  console.log(`🔐 [OTP DISPATCH - ${channel} / ${type}]`);
  console.log(`To: ${normalized}`);
  console.log(`Verification Code: >> ${code} << (Valid for 10 minutes)`);
  console.log(`Clinic: Apex Dental & Aesthetic Lounge`);
  console.log(`======================================================\n`);

  return {
    success: true,
    message: `A 6-digit verification code has been dispatched to ${
      channel === "EMAIL" ? normalized : `${normalized.slice(0, 6)}****${normalized.slice(-2)}`
    }.`,
    channel,
    expiresInSeconds: 600,
    devCode: code, // Accessible for development & seamless pairing testing
  };
}

/**
 * Validates a 6-digit OTP code against the database.
 */
export async function verifyOtp({ identifier, code, type }: VerifyOtpParams) {
  const { normalized } = normalizeIdentifier(identifier);
  const cleanCode = code.trim();

  // Find latest unverified OTP
  const record = await db.otpVerification.findFirst({
    where: {
      identifier: normalized,
      type,
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return {
      success: false,
      error: "No active verification code found for this destination. Please request a new OTP.",
    };
  }

  // Check Expiration
  if (Date.now() > record.expiresAt.getTime()) {
    return {
      success: false,
      error: "This verification code has expired (10-minute limit). Please request a fresh OTP.",
    };
  }

  // Check Brute-Force Lockout (Max 5 attempts)
  if (record.attempts >= 5) {
    return {
      success: false,
      error: "Too many incorrect attempts. This OTP has been invalidated for security. Please request a new code.",
    };
  }

  // Compare Code
  if (record.code !== cleanCode) {
    const updated = await db.otpVerification.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    const remaining = Math.max(0, 5 - updated.attempts);
    return {
      success: false,
      error: `Invalid verification code. ${remaining} attempts remaining before lockout.`,
    };
  }

  // Mark as verified
  await db.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  // If email or phone verification, mark user verified flag
  if (type === "EMAIL_VERIFY") {
    await db.user.updateMany({
      where: { email: normalized },
      data: { isEmailVerified: true },
    });
  } else if (type === "PHONE_VERIFY") {
    const cleanPhoneDigits = normalized.replace(/\D/g, "").slice(-10);
    await db.user.updateMany({
      where: { phone: { contains: cleanPhoneDigits } },
      data: { isPhoneVerified: true },
    });
  }

  return {
    success: true,
    message: "Identity verified successfully.",
  };
}

/**
 * Resets a user's password using an OTP verified code.
 */
export async function resetPasswordWithOtp({ identifier, code, newPassword }: ResetPasswordParams) {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "New password must be at least 6 characters in length.",
    };
  }

  // 1. Verify OTP first
  const verification = await verifyOtp({
    identifier,
    code,
    type: "PASSWORD_RESET",
  });

  if (!verification.success) {
    return verification;
  }

  const { normalized } = normalizeIdentifier(identifier);

  // 2. Find matching user by email or phone
  let user = await db.user.findFirst({
    where: {
      OR: [
        { email: normalized },
        { phone: normalized },
        { phone: { contains: normalized.replace(/\D/g, "").slice(-10) } },
      ],
    },
  });

  if (!user) {
    return {
      success: false,
      error: "No registered patient or clinic staff account found matching this email or phone.",
    };
  }

  // 3. Hash new password securely with bcrypt
  const passwordHash = await hashPassword(newPassword);

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // 4. Invalidate all OTPs for this user
  await db.otpVerification.deleteMany({
    where: { identifier: normalized },
  });

  return {
    success: true,
    message: "Your password has been reset successfully. You can now log in with your new password.",
  };
}
