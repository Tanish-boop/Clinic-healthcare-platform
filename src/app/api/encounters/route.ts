import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClinicalEncounter } from "@/services/clinicalService";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const encounter = await createClinicalEncounter({
      clinicId: session.clinicId || body.clinicId,
      doctorId: session.doctorId || body.doctorId,
      patientId: body.patientId,
      appointmentId: body.appointmentId,
      specialtyType: body.specialtyType || "DENTAL",
      vitals: body.vitals,
      subjectiveNotes: body.subjectiveNotes,
      objectiveNotes: body.objectiveNotes,
      assessment: body.assessment,
      plan: body.plan,
      specialtyData: body.specialtyData,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      followUpNotes: body.followUpNotes,
      prescriptionItems: body.prescriptionItems,
      generalAdvice: body.generalAdvice,
    });

    return NextResponse.json({ success: true, encounter });
  } catch (error: any) {
    console.error("Encounter save error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save clinical encounter" },
      { status: 500 }
    );
  }
}
