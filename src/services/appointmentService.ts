import { db } from "@/lib/db";
import { format, parse, isWithinInterval, addMinutes } from "date-fns";

export interface AvailableSlot {
  time: string; // "10:30"
  formatted: string; // "10:30 AM"
  available: boolean;
}

export interface CreateAppointmentInput {
  clinicId: string;
  doctorId: string;
  serviceId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender?: string;
  patientAge?: number;
  appointmentDate: string; // "YYYY-MM-DD"
  startTime: string; // "10:30"
  durationMinutes?: number;
  type?: "IN_PERSON" | "VIDEO_TELECONSULT";
  chiefComplaint?: string;
  source?: "WEBSITE" | "PHONE" | "WALK_IN" | "STAFF";
}

/**
 * Generate unique human-readable booking reference e.g. APT-2610-8492
 */
export function generateBookingRef(): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `APT-${yearSuffix}-${randomPart}`;
}

/**
 * Converts "10:30" and a base date into a Date object
 */
function parseTimeToDate(baseDate: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Check if two time intervals overlap: [startA, endA) and [startB, endB)
 */
function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

/**
 * Calculate all strictly available slots for a doctor on a specific date
 */
export async function getDoctorAvailableSlots(
  clinicId: string,
  doctorId: string,
  dateStr: string // "YYYY-MM-DD"
): Promise<AvailableSlot[]> {
  const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday...

  // 1. Fetch clinic details & rules
  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    include: {
      operatingHours: {
        where: { dayOfWeek },
      },
    },
  });

  if (!clinic) return [];
  const clinicDay = clinic.operatingHours[0];
  if (clinicDay && !clinicDay.isOpen) {
    return []; // Clinic closed on this day
  }

  // 2. Fetch doctor profile & schedule
  const doctor = await db.doctorProfile.findUnique({
    where: { id: doctorId },
    include: {
      availability: {
        where: { dayOfWeek, isActive: true },
      },
      leaves: {
        where: {
          isApproved: true,
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
      },
    },
  });

  if (!doctor || !doctor.isActive) return [];
  if (doctor.leaves.length > 0) return []; // Doctor on approved leave

  const availability = doctor.availability[0];
  // If doctor doesn't have custom availability, fallback to clinic hours or default 10:00-19:00
  const startTimeStr = availability?.startTime || clinicDay?.openTime || "10:00";
  const endTimeStr = availability?.endTime || clinicDay?.closeTime || "19:00";
  const slotDuration = availability?.slotDuration || doctor.defaultSlotDuration || 30;

  // 3. Fetch all active appointments on this day
  const existingAppointments = await db.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: targetDate,
      status: {
        notIn: ["CANCELLED", "NO_SHOW"],
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // 4. Generate candidate time slots
  const startDateTime = parseTimeToDate(targetDate, startTimeStr);
  const endDateTime = parseTimeToDate(targetDate, endTimeStr);

  const slots: AvailableSlot[] = [];
  let currentSlotStart = new Date(startDateTime);

  while (currentSlotStart < endDateTime) {
    const currentSlotEnd = addMinutes(currentSlotStart, slotDuration);
    if (currentSlotEnd > endDateTime) break;

    const timeString = format(currentSlotStart, "HH:mm");
    const formatted12Hr = format(currentSlotStart, "hh:mm a");

    // Check lunch break collision
    let isBreak = false;
    if (clinicDay?.lunchBreakStart && clinicDay?.lunchBreakEnd) {
      const lunchStart = parseTimeToDate(targetDate, clinicDay.lunchBreakStart);
      const lunchEnd = parseTimeToDate(targetDate, clinicDay.lunchBreakEnd);
      if (isOverlapping(currentSlotStart, currentSlotEnd, lunchStart, lunchEnd)) {
        isBreak = true;
      }
    }

    // Check appointment collision
    let hasConflict = false;
    if (!isBreak) {
      for (const apt of existingAppointments) {
        const aptStart = parseTimeToDate(targetDate, apt.startTime);
        const aptEnd = parseTimeToDate(targetDate, apt.endTime);
        if (isOverlapping(currentSlotStart, currentSlotEnd, aptStart, aptEnd)) {
          hasConflict = true;
          break;
        }
      }
    }

    if (!isBreak && !hasConflict) {
      slots.push({
        time: timeString,
        formatted: formatted12Hr,
        available: true,
      });
    }

    currentSlotStart = addMinutes(currentSlotStart, slotDuration);
  }

  return slots;
}

/**
 * Create a new appointment with transaction-level conflict validation
 */
export async function createAppointment(input: CreateAppointmentInput) {
  const targetDate = new Date(`${input.appointmentDate}T00:00:00.000Z`);
  const duration = input.durationMinutes || 30;
  const startDateTime = parseTimeToDate(targetDate, input.startTime);
  const endDateTime = addMinutes(startDateTime, duration);
  const endTimeStr = format(endDateTime, "HH:mm");

  return await db.$transaction(async (tx) => {
    // 1. Conflict check: make sure doctor is not already booked during this exact window
    const conflicts = await tx.appointment.findMany({
      where: {
        doctorId: input.doctorId,
        appointmentDate: targetDate,
        status: {
          notIn: ["CANCELLED", "NO_SHOW"],
        },
      },
    });

    for (const apt of conflicts) {
      const existingStart = parseTimeToDate(targetDate, apt.startTime);
      const existingEnd = parseTimeToDate(targetDate, apt.endTime);
      if (isOverlapping(startDateTime, endDateTime, existingStart, existingEnd)) {
        throw new Error(
          `SLOT_UNAVAILABLE: Doctor is already booked from ${apt.startTime} to ${apt.endTime} on ${input.appointmentDate}. Please choose another time.`
        );
      }
    }

    // 2. Find or register patient in this clinic
    let patient = await tx.patient.findFirst({
      where: {
        clinicId: input.clinicId,
        phone: input.patientPhone,
      },
    });

    if (!patient) {
      // Generate clinic-specific patient ID e.g. PAT-2026-0001
      const patientCount = await tx.patient.count({
        where: { clinicId: input.clinicId },
      });
      const year = new Date().getFullYear();
      const patientIdNumber = `PAT-${year}-${String(patientCount + 1).padStart(4, "0")}`;

      patient = await tx.patient.create({
        data: {
          clinicId: input.clinicId,
          patientIdNumber,
          fullName: input.patientName,
          phone: input.patientPhone,
          email: input.patientEmail,
          gender: input.patientGender || "PREFER_NOT_TO_SAY",
          age: input.patientAge,
        },
      });
    }

    // 3. Create appointment
    const bookingRef = generateBookingRef();
    const appointment = await tx.appointment.create({
      data: {
        clinicId: input.clinicId,
        bookingReference: bookingRef,
        patientId: patient.id,
        doctorId: input.doctorId,
        serviceId: input.serviceId,
        appointmentDate: targetDate,
        startTime: input.startTime,
        endTime: endTimeStr,
        durationMinutes: duration,
        type: input.type || "IN_PERSON",
        status: "CONFIRMED",
        source: input.source || "WEBSITE",
        chiefComplaint: input.chiefComplaint,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { fullName: true },
            },
          },
        },
        service: true,
        patient: true,
        clinic: true,
      },
    });

    // 4. Record status history
    await tx.appointmentStatusHistory.create({
      data: {
        appointmentId: appointment.id,
        fromStatus: null,
        toStatus: "CONFIRMED",
        notes: `Appointment created via ${input.source || "WEBSITE"}`,
        changedBy: "System",
      },
    });

    // 5. Create notification log
    await tx.notification.create({
      data: {
        clinicId: input.clinicId,
        recipientPhone: input.patientPhone,
        recipientEmail: input.patientEmail,
        type: "APPOINTMENT_CONFIRMATION",
        channel: "WHATSAPP",
        status: "LOGGED",
        payload: `Appointment confirmed with Dr. ${appointment.doctor.user.fullName} on ${input.appointmentDate} at ${input.startTime}. Ref: ${bookingRef}`,
      },
    });

    return appointment;
  });
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  appointmentId: string,
  newDateStr: string,
  newStartTime: string,
  reason?: string
) {
  const targetDate = new Date(`${newDateStr}T00:00:00.000Z`);

  return await db.$transaction(async (tx) => {
    const apt = await tx.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!apt) throw new Error("Appointment not found");

    const startDateTime = parseTimeToDate(targetDate, newStartTime);
    const endDateTime = addMinutes(startDateTime, apt.durationMinutes);
    const endTimeStr = format(endDateTime, "HH:mm");

    // Check conflicts
    const conflicts = await tx.appointment.findMany({
      where: {
        id: { not: appointmentId },
        doctorId: apt.doctorId,
        appointmentDate: targetDate,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    });

    for (const c of conflicts) {
      const existingStart = parseTimeToDate(targetDate, c.startTime);
      const existingEnd = parseTimeToDate(targetDate, c.endTime);
      if (isOverlapping(startDateTime, endDateTime, existingStart, existingEnd)) {
        throw new Error(
          `SLOT_UNAVAILABLE: Time slot ${newStartTime} conflicts with existing booking.`
        );
      }
    }

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        appointmentDate: targetDate,
        startTime: newStartTime,
        endTime: endTimeStr,
        status: "RESCHEDULED",
      },
    });

    await tx.appointmentStatusHistory.create({
      data: {
        appointmentId,
        fromStatus: apt.status,
        toStatus: "RESCHEDULED",
        notes: reason || "Appointment rescheduled",
        changedBy: "Staff / Patient",
      },
    });

    return updated;
  });
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  appointmentId: string,
  reason: string,
  cancelledBy = "Patient"
) {
  return await db.$transaction(async (tx) => {
    const apt = await tx.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!apt) throw new Error("Appointment not found");

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason,
      },
    });

    await tx.appointmentStatusHistory.create({
      data: {
        appointmentId,
        fromStatus: apt.status,
        toStatus: "CANCELLED",
        notes: reason,
        changedBy: cancelledBy,
      },
    });

    return updated;
  });
}
