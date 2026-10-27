import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createInvoice } from "@/services/billingService";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (session.role === "PATIENT" && !session.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden: Patients cannot access clinic billing ledger" }, { status: 403 });
    }

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const invoices = await db.invoice.findMany({
      where: { clinicId },
      include: { patient: true, items: true, payments: true },
      orderBy: { invoiceDate: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const body = await req.json();

    const invoice = await createInvoice({
      clinicId,
      patientId: body.patientId,
      appointmentId: body.appointmentId || undefined,
      items: body.items,
      discountAmount: body.discountAmount ? Number(body.discountAmount) : 0,
      taxRatePercent: body.taxRatePercent ? Number(body.taxRatePercent) : 0,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
