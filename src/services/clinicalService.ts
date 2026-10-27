import { db } from "@/lib/db";

export interface CreateEncounterInput {
  clinicId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  specialtyType: "DENTAL" | "DERMATOLOGY" | "PHYSIOTHERAPY" | "GENERAL_PRACTICE";
  vitals?: {
    bpSystolic?: number;
    bpDiastolic?: number;
    pulse?: number;
    temperatureF?: number;
    weightKg?: number;
    spo2?: number;
  };
  subjectiveNotes?: string;
  objectiveNotes?: string;
  assessment?: string;
  plan?: string;
  specialtyData?: Record<string, any>; // JSON structured specialty findings
  followUpDate?: Date;
  followUpNotes?: string;
  prescriptionItems?: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
    durationDays: number;
    instructions?: string;
  }>;
  generalAdvice?: string;
}

/**
 * Record a clinical encounter with vitals, SOAP notes, specialty data, and optional prescription
 */
export async function createClinicalEncounter(input: CreateEncounterInput) {
  return await db.$transaction(async (tx) => {
    // 1. Create the encounter
    const encounter = await tx.clinicalEncounter.create({
      data: {
        clinicId: input.clinicId,
        patientId: input.patientId,
        doctorId: input.doctorId,
        appointmentId: input.appointmentId,
        specialtyType: input.specialtyType,
        bpSystolic: input.vitals?.bpSystolic,
        bpDiastolic: input.vitals?.bpDiastolic,
        pulse: input.vitals?.pulse,
        temperatureF: input.vitals?.temperatureF,
        weightKg: input.vitals?.weightKg,
        spo2: input.vitals?.spo2,
        subjectiveNotes: input.subjectiveNotes,
        objectiveNotes: input.objectiveNotes,
        assessment: input.assessment,
        plan: input.plan,
        specialtyData: input.specialtyData
          ? JSON.stringify(input.specialtyData)
          : null,
        followUpDate: input.followUpDate,
        followUpNotes: input.followUpNotes,
      },
    });

    // 2. If prescription items provided, create prescription
    if (input.prescriptionItems && input.prescriptionItems.length > 0) {
      await tx.prescription.create({
        data: {
          clinicId: input.clinicId,
          patientId: input.patientId,
          doctorId: input.doctorId,
          encounterId: encounter.id,
          generalAdvice: input.generalAdvice,
          isAuthorizedForPatient: true,
          items: {
            create: input.prescriptionItems.map((item) => ({
              medicineName: item.medicineName,
              dosage: item.dosage,
              frequency: item.frequency,
              timing: item.timing,
              durationDays: item.durationDays,
              instructions: item.instructions,
            })),
          },
        },
      });
    }

    // 3. If associated with an appointment, mark appointment as COMPLETED
    if (input.appointmentId) {
      await tx.appointment.update({
        where: { id: input.appointmentId },
        data: { status: "COMPLETED" },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: input.appointmentId,
          fromStatus: "IN_CONSULTATION",
          toStatus: "COMPLETED",
          notes: "Consultation completed and encounter recorded",
          changedBy: "Doctor",
        },
      });
    }

    // 4. Audit log entry
    await tx.auditLog.create({
      data: {
        clinicId: input.clinicId,
        action: "RECORD_CREATED",
        entityType: "ClinicalEncounter",
        entityId: encounter.id,
        details: `Clinical encounter recorded for patient ${input.patientId}`,
      },
    });

    return encounter;
  });
}

/**
 * Finalize an encounter to lock it from casual modifications
 */
export async function finalizeClinicalEncounter(encounterId: string, doctorId: string) {
  return await db.clinicalEncounter.update({
    where: { id: encounterId, doctorId },
    data: {
      isFinalized: true,
      finalizedAt: new Date(),
    },
  });
}

/**
 * Retrieve patient's complete clinical timeline
 */
export async function getPatientClinicalHistory(clinicId: string, patientId: string) {
  return await db.clinicalEncounter.findMany({
    where: { clinicId, patientId },
    include: {
      doctor: {
        include: {
          user: {
            select: { fullName: true },
          },
        },
      },
      prescriptions: {
        include: {
          items: true,
        },
      },
      documents: true,
    },
    orderBy: { encounterDate: "desc" },
  });
}
