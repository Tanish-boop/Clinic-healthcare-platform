import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const patients = await db.patient.findMany({
      where: { clinicId },
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Patient ID",
      "Full Name",
      "Phone",
      "Email",
      "Gender",
      "Age",
      "Blood Group",
      "Area",
      "City",
      "Allergies",
      "Medical Conditions",
      "Registration Date",
    ];

    const rows = patients.map((p) => [
      `"${p.patientIdNumber}"`,
      `"${p.fullName.replace(/"/g, '""')}"`,
      `"${p.phone}"`,
      `"${p.email || ""}"`,
      `"${p.gender}"`,
      `"${p.age || ""}"`,
      `"${p.bloodGroup || ""}"`,
      `"${p.area || ""}"`,
      `"${p.city || ""}"`,
      `"${(p.allergies || "").replace(/"/g, '""')}"`,
      `"${(p.medicalConditions || "").replace(/"/g, '""')}"`,
      `"${p.createdAt.toISOString().split("T")[0]}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="patients-export-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
