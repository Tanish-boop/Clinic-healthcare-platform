import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  age: z.coerce.number().min(1).max(120).optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  currentMedications: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify patient profile belongs to this user
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { patientProfile: true },
    });

    if (!user?.patientProfile) {
      return NextResponse.json({ error: "No patient profile associated with this account" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = profileSchema.parse(body);

    const updated = await db.patient.update({
      where: { id: user.patientProfile.id },
      data: {
        ...parsed,
      },
    });

    if (parsed.fullName && parsed.fullName !== user.fullName) {
      await db.user.update({
        where: { id: user.id },
        data: { fullName: parsed.fullName },
      });
    }

    return NextResponse.json({ success: true, patient: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
