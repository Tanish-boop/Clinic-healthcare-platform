import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query || "").trim();
    const phone = String(body.phone || "").trim();

    if (!query && !phone) {
      return NextResponse.json(
        { error: "Please provide a Booking Reference (e.g., APT-26-XXXX) or Mobile Number" },
        { status: 400 }
      );
    }

    // Try finding by Booking Reference first
    let appointment = null;
    let patient = null;

    if (query.toUpperCase().startsWith("APT-") || query.length >= 8) {
      appointment = await db.appointment.findFirst({
        where: {
          bookingReference: query.toUpperCase(),
        },
        include: {
          patient: true,
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          service: true,
        },
      });

      if (appointment) {
        patient = appointment.patient;
      }
    }

    // If patient not found yet, try searching by Phone or Patient ID
    if (!patient) {
      const searchNumber = phone || query;
      // Strip out spaces and non-digits
      const cleanDigits = searchNumber.replace(/\D/g, "").slice(-10);
      const spacedDigits = cleanDigits.length === 10 ? `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}` : cleanDigits;

      patient = await db.patient.findFirst({
        where: {
          OR: [
            { phone: { contains: cleanDigits } },
            { phone: { contains: spacedDigits } },
            { phone: { contains: searchNumber } },
            { patientIdNumber: query.toUpperCase() },
          ],
        },
      });

      // Fallback: if still not found and digits are at least 10, check in memory across patients
      if (!patient && cleanDigits.length >= 10) {
        const patients = await db.patient.findMany({
          select: { id: true, phone: true },
        });
        const matched = patients.find((p) => p.phone.replace(/\D/g, "").endsWith(cleanDigits));
        if (matched) {
          patient = await db.patient.findUnique({ where: { id: matched.id } });
        }
      }
    }

    if (!patient) {
      return NextResponse.json(
        {
          error:
            "No matching patient or booking record found. Please verify your reference number or contact clinic reception at +91 98230 45678.",
        },
        { status: 404 }
      );
    }

    // Fetch full patient records
    const [appointments, prescriptions, invoices] = await Promise.all([
      db.appointment.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          service: true,
        },
        orderBy: { appointmentDate: "desc" },
        take: 10,
      }),
      db.prescription.findMany({
        where: {
          patientId: patient.id,
          isAuthorizedForPatient: true,
        },
        include: {
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
          items: true,
        },
        orderBy: { prescriptionDate: "desc" },
        take: 10,
      }),
      db.invoice.findMany({
        where: { patientId: patient.id },
        include: {
          items: true,
          payments: true,
        },
        orderBy: { invoiceDate: "desc" },
        take: 10,
      }),
    ]);

    // Format safe response
    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email || "",
        age: patient.age,
        gender: patient.gender,
        patientIdNumber: patient.patientIdNumber,
        bloodGroup: patient.bloodGroup || "O+",
        address: patient.address || "",
        area: patient.area || "",
        city: patient.city || "Pune",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        allergies: patient.allergies || "",
        medicalConditions: patient.medicalConditions || "",
        currentMedications: patient.currentMedications || "",
        notes: patient.notes || "",
      },
      appointments: appointments.map((a) => ({
        id: a.id,
        bookingReference: a.bookingReference,
        appointmentDate: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        type: a.type,
        doctorName: a.doctor.user.fullName,
        doctorSpecialty: a.doctor.specialty,
        doctorQualification: a.doctor.qualification,
        doctorRegNumber: a.doctor.regNumber,
        serviceName: a.service?.name,
        price: a.service?.price,
      })),
      prescriptions: prescriptions.map((p) => ({
        id: p.id,
        prescriptionDate: p.prescriptionDate,
        doctorName: p.doctor.user.fullName,
        doctorSpecialty: p.doctor.specialty,
        doctorQualification: p.doctor.qualification,
        doctorRegNumber: p.doctor.regNumber,
        generalAdvice: p.generalAdvice,
        items: p.items.map((i) => ({
          medicineName: i.medicineName,
          dosage: i.dosage,
          frequency: i.frequency,
          timing: i.timing,
          durationDays: i.durationDays,
          instructions: i.instructions || "",
        })),
      })),
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceDue: inv.balanceDue,
        status: inv.status,
        items: inv.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        payments: inv.payments.map((pm) => ({
          receiptNumber: pm.receiptNumber,
          amount: pm.amount,
          paymentMethod: pm.paymentMethod,
          paymentDate: pm.paymentDate,
        })),
      })),
    });
  } catch (error: any) {
    console.error("Portal lookup error:", error);
    return NextResponse.json(
      { error: "Failed to look up medical records. Please try again." },
      { status: 500 }
    );
  }
}
