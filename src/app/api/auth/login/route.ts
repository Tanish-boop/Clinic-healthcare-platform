import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        doctorProfile: {
          include: { clinic: true },
        },
        staffMembership: {
          include: { clinic: true },
        },
        patientProfile: {
          include: { clinic: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or account is inactive" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password credentials" },
        { status: 401 }
      );
    }

    // Determine primary role & clinic context
    let role = "PATIENT";
    let clinicId: string | undefined = undefined;
    let redirectUrl = "/portal";

    if (user.isSuperAdmin) {
      role = "SUPERADMIN";
      redirectUrl = "/app/superadmin";
    } else if (user.staffMembership) {
      role = user.staffMembership.role;
      clinicId = user.staffMembership.clinicId;
      redirectUrl = "/app";
    } else if (user.doctorProfile) {
      role = "DOCTOR";
      clinicId = user.doctorProfile.clinicId;
      redirectUrl = "/app/doctor";
    } else if (user.patientProfile) {
      role = "PATIENT";
      clinicId = user.patientProfile.clinicId;
      redirectUrl = "/portal";
    }

    // Set cookie
    const token = await createSession({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      isSuperAdmin: user.isSuperAdmin,
      role,
      clinicId,
      doctorId: user.doctorProfile?.id,
      patientId: user.patientProfile?.id,
    });

    // Update lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
        clinicId,
      },
      redirectUrl,
    });

    response.cookies.set("medinexus_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"),
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "Authentication failed" },
      { status: 400 }
    );
  }
}
