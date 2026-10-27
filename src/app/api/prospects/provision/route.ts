import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { provisionClinicFromProspect } from "@/services/prospectService";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { prospectId, ownerEmail } = body;

    if (!prospectId) {
      return NextResponse.json({ error: "prospectId is required" }, { status: 400 });
    }

    const clinic = await provisionClinicFromProspect(prospectId, { ownerEmail });

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        city: clinic.city,
        specialty: clinic.specialty,
        status: clinic.status,
      },
    });
  } catch (error: any) {
    console.error("Provisioning error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to provision clinic from prospect" },
      { status: 500 }
    );
  }
}
