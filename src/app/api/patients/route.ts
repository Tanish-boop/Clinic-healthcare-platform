import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { registerPatient, searchPatients } from "@/services/patientService";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || undefined;
    const page = Number(searchParams.get("page") || "1");
    const take = Number(searchParams.get("take") || "25");
    const skip = (page - 1) * take;

    const data = await searchPatients(clinicId, query, skip, take);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const body = await req.json();

    const patient = await registerPatient({
      clinicId,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      gender: body.gender || "PREFER_NOT_TO_SAY",
      age: body.age ? Number(body.age) : undefined,
      allergies: body.allergies,
      medicalConditions: body.medicalConditions,
      area: body.area,
      city: body.city || "Pune",
      notes: body.notes,
    });

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    if (error?.message?.includes("DUPLICATE_PATIENT")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message || "Failed to register patient" }, { status: 500 });
  }
}
