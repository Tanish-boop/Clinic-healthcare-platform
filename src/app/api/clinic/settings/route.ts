import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clinicId = session.clinicId || (await db.clinic.findFirst())?.id;
    if (!clinicId) return NextResponse.json({ error: "No clinic found" }, { status: 400 });

    const body = await req.json();

    const updated = await db.clinic.update({
      where: { id: clinicId },
      data: {
        name: body.name,
        tagline: body.tagline,
        primaryPhone: body.primaryPhone,
        secondaryPhone: body.secondaryPhone,
        email: body.email,
        address: body.address,
        area: body.area,
        city: body.city,
        appointmentBufferMinutes: body.appointmentBufferMinutes
          ? Number(body.appointmentBufferMinutes)
          : undefined,
        cancellationNoticeHours: body.cancellationNoticeHours
          ? Number(body.cancellationNoticeHours)
          : undefined,
        googleMapsUrl: body.googleMapsUrl,
      },
    });

    // Update hero CMS if provided
    if (body.heroTitle || body.heroSubtitle) {
      await db.clinicCmsSection.upsert({
        where: {
          clinicId_sectionKey: {
            clinicId,
            sectionKey: "hero",
          },
        },
        create: {
          clinicId,
          sectionKey: "hero",
          title: body.heroTitle,
          subtitle: body.heroSubtitle,
          content: JSON.stringify({ ctaButton: "Book Consultation" }),
        },
        update: {
          title: body.heroTitle,
          subtitle: body.heroSubtitle,
        },
      });
    }

    return NextResponse.json({ success: true, clinic: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update clinic settings" },
      { status: 500 }
    );
  }
}
