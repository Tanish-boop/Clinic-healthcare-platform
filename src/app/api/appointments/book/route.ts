import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAppointment } from "@/services/appointmentService";

const bookSchema = z.object({
  clinicId: z.string().min(1, "Clinic ID is required"),
  doctorId: z.string().min(1, "Doctor selection is required"),
  serviceId: z.string().optional(),
  patientName: z.string().min(2, "Full name must have at least 2 characters"),
  patientPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[0-9+\s\-()]+$/, "Invalid phone number format"),
  patientEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  patientGender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  patientAge: z.number().int().min(1).max(120).optional(),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:mm"),
  type: z.enum(["IN_PERSON", "VIDEO_TELECONSULT"]).default("IN_PERSON"),
  chiefComplaint: z.string().max(500, "Chief complaint is too long").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = bookSchema.parse(body);

    const appointment = await createAppointment({
      clinicId: validated.clinicId,
      doctorId: validated.doctorId,
      serviceId: validated.serviceId,
      patientName: validated.patientName.trim(),
      patientPhone: validated.patientPhone.trim(),
      patientEmail: validated.patientEmail || undefined,
      patientGender: validated.patientGender,
      patientAge: validated.patientAge,
      appointmentDate: validated.appointmentDate,
      startTime: validated.startTime,
      type: validated.type,
      chiefComplaint: validated.chiefComplaint?.trim(),
      source: "WEBSITE",
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        bookingReference: appointment.bookingReference,
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        type: appointment.type,
        doctorName: appointment.doctor.user.fullName,
        doctorSpecialty: appointment.doctor.specialty,
        doctorQualification: appointment.doctor.qualification,
        doctorRegNumber: appointment.doctor.regNumber,
        serviceName: appointment.service?.name,
        consultationFee: appointment.service?.price || appointment.doctor.consultationFee,
        patientName: appointment.patient.fullName,
        patientPhone: appointment.patient.phone,
        patientAge: appointment.patient.age,
        patientGender: appointment.patient.gender,
        patientIdNumber: appointment.patient.patientIdNumber,
        clinicName: appointment.clinic?.name,
        clinicAddress: appointment.clinic?.address,
        clinicPhone: appointment.clinic?.primaryPhone,
        status: appointment.status,
      },
    });
  } catch (error: any) {
    console.error("Booking error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    if (error?.message?.includes("SLOT_UNAVAILABLE")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { error: error?.message || "Internal server error occurred while booking" },
      { status: 500 }
    );
  }
}
