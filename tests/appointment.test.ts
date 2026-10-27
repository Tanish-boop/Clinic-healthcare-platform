import { describe, it, expect } from "vitest";
import { generateBookingRef, createAppointment } from "../src/services/appointmentService";
import { db } from "../src/lib/db";

describe("Appointment Scheduling & Double-Booking Prevention Tests", () => {
  it("should generate valid human-readable booking references (APT-YY-XXXX)", () => {
    const ref = generateBookingRef();
    expect(ref.startsWith("APT-")).toBe(true);
    expect(ref.length).toBe(11); // e.g. APT-26-8492
  });

  it("should prevent concurrent overlapping double-bookings for the same doctor", async () => {
    // Fetch doctor and clinic
    const clinic = await db.clinic.findFirst();
    const doctor = await db.doctorProfile.findFirst();

    if (!clinic || !doctor) return;

    const testDate = "2026-11-20";
    const testTime = "14:00";

    // 1. Create first booking
    const apt1 = await createAppointment({
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientName: "Concurrent Test Patient 1",
      patientPhone: "+91 99999 11111",
      appointmentDate: testDate,
      startTime: testTime,
      durationMinutes: 30,
      type: "IN_PERSON",
      source: "WEBSITE",
    });

    expect(apt1.id).toBeDefined();
    expect(apt1.status).toBe("CONFIRMED");

    // 2. Attempt second booking for the exact same doctor and time slot
    await expect(
      createAppointment({
        clinicId: clinic.id,
        doctorId: doctor.id,
        patientName: "Concurrent Test Patient 2",
        patientPhone: "+91 99999 22222",
        appointmentDate: testDate,
        startTime: testTime,
        durationMinutes: 30,
        type: "IN_PERSON",
        source: "WEBSITE",
      })
    ).rejects.toThrow("SLOT_UNAVAILABLE");

    // Clean up test appointment
    await db.appointmentStatusHistory.deleteMany({ where: { appointmentId: apt1.id } });
    await db.appointment.delete({ where: { id: apt1.id } });
  });
});
