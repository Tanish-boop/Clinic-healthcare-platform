import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "10-digit mobile number required"),
  accountType: z.enum(["PATIENT", "DOCTOR", "CLINIC_OWNER", "STAFF"]),
  // Doctor fields
  specialty: z.string().optional(),
  qualification: z.string().optional(),
  regNumber: z.string().optional(),
  experienceYears: z.union([z.number(), z.string()]).optional(),
  consultationFee: z.union([z.number(), z.string()]).optional(),
  // Clinic Owner fields
  clinicName: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  // Staff fields
  staffRole: z.enum(["RECEPTIONIST", "ACCOUNTANT"]).optional(),
  // Patient fields
  age: z.union([z.number(), z.string()]).optional(),
  gender: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const normalizedEmail = data.email.toLowerCase().trim();

    // 1. Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email address already exists. Please sign in or use a different email.",
        },
        { status: 400 }
      );
    }

    // 2. Hash password securely
    const passwordHash = await hashPassword(data.password);

    // 3. Find default clinic or target clinic
    const defaultClinic = await db.clinic.findFirst();
    if (!defaultClinic) {
      return NextResponse.json(
        { error: "No active clinic found in the system to link accounts." },
        { status: 500 }
      );
    }

    // Check if email or phone has been verified via OTP
    const cleanPhoneDigits = data.phone.replace(/\D/g, "").slice(-10);
    const verifiedEmailOtp = await db.otpVerification.findFirst({
      where: { identifier: normalizedEmail, type: "EMAIL_VERIFY", verified: true },
    });
    const verifiedPhoneOtp = cleanPhoneDigits ? await db.otpVerification.findFirst({
      where: { identifier: { contains: cleanPhoneDigits }, type: "PHONE_VERIFY", verified: true },
    }) : null;

    const isEmailVerified = Boolean(verifiedEmailOtp);
    const isPhoneVerified = Boolean(verifiedPhoneOtp);

    let createdUser: any = null;
    let redirectUrl = "/app";
    let role = "PATIENT";
    let targetClinicId = defaultClinic.id;
    let doctorId: string | undefined = undefined;
    let patientId: string | undefined = undefined;

    // -------------------------------------------------------------
    // Case A: Real Patient Account
    // -------------------------------------------------------------
    if (data.accountType === "PATIENT") {
      role = "PATIENT";
      redirectUrl = "/portal";

      // Check if an unlinked patient profile exists with this phone number
      const existingPatient = await db.patient.findFirst({
        where: {
          phone: { contains: cleanPhoneDigits },
          userId: null,
        },
      });

      if (existingPatient) {
        // Link existing patient chart to new user
        createdUser = await db.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            fullName: data.fullName,
            phone: data.phone,
            isEmailVerified,
            isPhoneVerified,
          },
        });

        await db.patient.update({
          where: { id: existingPatient.id },
          data: {
            userId: createdUser.id,
            fullName: data.fullName,
            email: normalizedEmail,
          },
        });
        patientId = existingPatient.id;
        targetClinicId = existingPatient.clinicId;
      } else {
        // Create fresh patient chart
        const randId = Math.floor(1000 + Math.random() * 9000);
        createdUser = await db.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            fullName: data.fullName,
            phone: data.phone,
            isEmailVerified,
            isPhoneVerified,
            patientProfile: {
              create: {
                clinicId: targetClinicId,
                fullName: data.fullName,
                phone: data.phone,
                email: normalizedEmail,
                patientIdNumber: `PAT-2026-${randId}`,
                gender: data.gender || "PREFER_NOT_TO_SAY",
                age: data.age ? Number(data.age) : 30,
                city: data.city || "Pune",
              },
            },
          },
          include: { patientProfile: true },
        });
        patientId = createdUser.patientProfile?.id;
      }
    }

    // -------------------------------------------------------------
    // Case B: Real Doctor Account
    // -------------------------------------------------------------
    else if (data.accountType === "DOCTOR") {
      role = "DOCTOR";
      redirectUrl = "/app/doctor";

      createdUser = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          isEmailVerified,
          isPhoneVerified,
          doctorProfile: {
            create: {
              clinicId: targetClinicId,
              specialty: data.specialty || "Prosthodontist & Implantologist",
              qualification: data.qualification || "BDS, MDS",
              regNumber:
                data.regNumber || `MDC-${Math.floor(10000 + Math.random() * 90000)}`,
              experienceYears: data.experienceYears ? Number(data.experienceYears) : 8,
              consultationFee: data.consultationFee ? Number(data.consultationFee) : 500,
              bio: `Dr. ${data.fullName} is a registered specialist serving with Apex Dental & Aesthetic Lounge.`,
            },
          },
        },
        include: { doctorProfile: true },
      });

      doctorId = createdUser.doctorProfile?.id;

      // Seed standard recurring availability Monday through Saturday (10:00 to 19:00)
      if (doctorId) {
        for (let day = 1; day <= 6; day++) {
          await db.doctorAvailability.create({
            data: {
              doctorId,
              dayOfWeek: day,
              startTime: "10:00",
              endTime: "19:00",
              slotDuration: 30,
              isActive: true,
            },
          });
        }
      }
    }

    // -------------------------------------------------------------
    // Case C: Real Clinic Owner / Practice Director
    // -------------------------------------------------------------
    else if (data.accountType === "CLINIC_OWNER") {
      role = "CLINIC_OWNER";
      redirectUrl = "/app";

      // If user supplied custom clinic name, provision a fresh clinic tenant!
      if (data.clinicName && data.clinicName.trim()) {
        const slug =
          data.clinicName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-") + `-${Date.now().toString().slice(-4)}`;

        const newClinic = await db.clinic.create({
          data: {
            name: data.clinicName.trim(),
            slug,
            city: data.city || "Pune",
            address: data.address || "Plot 42, West Avenue, Pune",
            primaryPhone: data.phone,
            email: normalizedEmail,
            specialty: "Dental & Aesthetics",
            status: "ACTIVE",
          },
        });
        targetClinicId = newClinic.id;
      }

      createdUser = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          isEmailVerified,
          isPhoneVerified,
          staffMembership: {
            create: {
              clinicId: targetClinicId,
              role: "CLINIC_OWNER",
              canManageBilling: true,
              canManageStaff: true,
              canEditClinical: true,
            },
          },
        },
      });
    }

    // -------------------------------------------------------------
    // Case D: Real Staff / Receptionist / Accountant
    // -------------------------------------------------------------
    else if (data.accountType === "STAFF") {
      const assignedRole = data.staffRole || "RECEPTIONIST";
      role = assignedRole;
      redirectUrl = "/app";

      createdUser = await db.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName: data.fullName,
          phone: data.phone,
          isEmailVerified,
          isPhoneVerified,
          staffMembership: {
            create: {
              clinicId: targetClinicId,
              role: assignedRole,
              canManageBilling: assignedRole === "ACCOUNTANT",
              canManageStaff: false,
              canEditClinical: false,
            },
          },
        },
      });
    }

    // 4. Establish signed server session cookie
    const token = await createSession({
      userId: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName,
      isSuperAdmin: false,
      role,
      clinicId: targetClinicId,
      doctorId,
      patientId,
    });

    const res = NextResponse.json({
      success: true,
      message: `Account created successfully! Welcome, ${createdUser.fullName}.`,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        role,
        clinicId: targetClinicId,
      },
      redirectUrl,
    });

    res.cookies.set("medinexus_session", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" &&
        !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"),
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error("Registration error:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
