import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordExpense } from "@/services/billingService";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const body = await req.json();

    const expense = await recordExpense({
      clinicId,
      categoryId: body.categoryId,
      title: body.title,
      amount: Number(body.amount),
      paymentMethod: body.paymentMethod || "UPI",
      vendorName: body.vendorName,
      invoiceRef: body.invoiceRef,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to record expense" },
      { status: 500 }
    );
  }
}
