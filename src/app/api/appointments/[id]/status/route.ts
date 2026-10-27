import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, notes } = body;

    const apt = await db.appointment.findUnique({
      where: { id: params.id },
    });

    if (!apt) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updated = await db.$transaction(async (tx) => {
      const u = await tx.appointment.update({
        where: { id: params.id },
        data: { status },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: params.id,
          fromStatus: apt.status,
          toStatus: status,
          notes: notes || `Status updated to ${status}`,
          changedBy: session.fullName,
        },
      });

      return u;
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update appointment status" },
      { status: 500 }
    );
  }
}
