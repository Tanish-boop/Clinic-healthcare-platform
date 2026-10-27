import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordPayment } from "@/services/billingService";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const body = await req.json();

    const payment = await recordPayment({
      clinicId,
      invoiceId: body.invoiceId,
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || "UPI",
      referenceNumber: body.referenceNumber,
      receivedBy: session.fullName,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to record payment" },
      { status: 500 }
    );
  }
}
