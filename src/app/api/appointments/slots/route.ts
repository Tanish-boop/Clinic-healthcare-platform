import { NextRequest, NextResponse } from "next/server";
import { getDoctorAvailableSlots } from "@/services/appointmentService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clinicId = searchParams.get("clinicId");
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date"); // "YYYY-MM-DD"

    if (!clinicId || !doctorId || !date) {
      return NextResponse.json(
        { error: "clinicId, doctorId, and date query parameters are required" },
        { status: 400 }
      );
    }

    const slots = await getDoctorAvailableSlots(clinicId, doctorId, date);
    return NextResponse.json({ slots });
  } catch (error: any) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compute available slots" },
      { status: 500 }
    );
  }
}
