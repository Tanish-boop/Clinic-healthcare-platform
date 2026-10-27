import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth";

describe("Authentication & Session Security Tests", () => {
  it("should securely hash and verify passwords using bcrypt", async () => {
    const password = "SecureClinicPassword@2026";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(password, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should create cryptographically signed HMAC session tokens", () => {
    const payload = {
      userId: "user-test-123",
      email: "doctor@apexdental.in",
      fullName: "Dr. Ananya Kulkarni",
      isSuperAdmin: false,
      role: "DOCTOR",
      clinicId: "clinic-pune-001",
      exp: Date.now() + 3600 * 1000, // 1 hr future
    };

    const token = signToken(payload);
    expect(token).toContain(".");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe("user-test-123");
    expect(decoded?.role).toBe("DOCTOR");
    expect(decoded?.clinicId).toBe("clinic-pune-001");
  });

  it("should reject tampered or forged session tokens", () => {
    const payload = {
      userId: "user-test-123",
      email: "doctor@apexdental.in",
      fullName: "Dr. Ananya",
      isSuperAdmin: false,
      exp: Date.now() + 3600 * 1000,
    };

    const token = signToken(payload);
    const [payloadB64, signature] = token.split(".");

    // Tamper with payload (e.g. attempting privilege escalation to superadmin)
    const tamperedJson = JSON.stringify({ ...payload, isSuperAdmin: true });
    const tamperedPayloadB64 = Buffer.from(tamperedJson).toString("base64url");
    const tamperedToken = `${tamperedPayloadB64}.${signature}`;

    const result = verifyToken(tamperedToken);
    expect(result).toBeNull(); // Cryptographic signature must fail
  });

  it("should reject expired session tokens", () => {
    const expiredPayload = {
      userId: "user-expired",
      email: "patient@example.com",
      fullName: "Patient",
      isSuperAdmin: false,
      exp: Date.now() - 5000, // 5 seconds in the past
    };

    const token = signToken(expiredPayload);
    const result = verifyToken(token);
    expect(result).toBeNull();
  });
});
