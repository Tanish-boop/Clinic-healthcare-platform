import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE_NAME = "medinexus_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "fallback-secret-for-dev-min-32-chars-long";

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
  clinicId?: string;
  role?: string; // SUPERADMIN, CLINIC_OWNER, DOCTOR, RECEPTIONIST, ACCOUNTANT, NURSE, PATIENT
  doctorId?: string;
  patientId?: string;
  exp: number; // Expiration timestamp
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(base64Payload)
    .digest("base64url");
  return `${base64Payload}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [base64Payload, signature] = token.split(".");
    if (!base64Payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(base64Payload)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "exp">, days = 7) {
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const token = signToken({ ...payload, exp });
  const isSecure = process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost");
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });
  return token;
}

export async function destroySession() {
  const isSecure = process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost");
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(req?: Request): Promise<SessionPayload | null> {
  try {
    let token: string | undefined = undefined;
    if (req) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
        if (match) token = match[1];
      }
    }
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      doctorProfile: {
        include: {
          clinic: true,
        },
      },
      staffMembership: {
        include: {
          clinic: true,
        },
      },
      patientProfile: {
        include: {
          clinic: true,
        },
      },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    ...user,
    sessionRole: session.role,
    activeClinicId: session.clinicId,
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (session.isSuperAdmin) {
    return session;
  }
  if (!session.role || !allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Requires one of [${allowedRoles.join(", ")}]`);
  }
  return session;
}

export async function requireClinicTenant(clinicId: string) {
  const session = await requireAuth();
  if (session.isSuperAdmin) {
    return session;
  }
  if (session.clinicId !== clinicId) {
    throw new Error("TENANT_VIOLATION: Access to this clinic data is forbidden");
  }
  return session;
}
