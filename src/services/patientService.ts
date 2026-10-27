import { db } from "@/lib/db";

export interface CreatePatientInput {
  clinicId: string;
  fullName: string;
  phone: string;
  email?: string;
  gender: string;
  age?: number;
  dateOfBirth?: Date;
  bloodGroup?: string;
  address?: string;
  area?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  notes?: string;
}

/**
 * Generate clinic patient ID: PAT-YYYY-XXXX
 */
export async function generatePatientIdNumber(clinicId: string): Promise<string> {
  const count = await db.patient.count({ where: { clinicId } });
  const year = new Date().getFullYear();
  return `PAT-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Search patients with multi-field search and pagination
 */
export async function searchPatients(
  clinicId: string,
  query?: string,
  skip = 0,
  take = 25
) {
  const where: any = { clinicId };

  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { fullName: { contains: q } },
      { phone: { contains: q } },
      { patientIdNumber: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [patients, total] = await Promise.all([
    db.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        _count: {
          select: {
            appointments: true,
            encounters: true,
            invoices: true,
          },
        },
      },
    }),
    db.patient.count({ where }),
  ]);

  return { patients, total };
}

/**
 * Register a new patient with duplicate phone detection
 */
export async function registerPatient(input: CreatePatientInput) {
  // Check duplicate phone in clinic
  const existing = await db.patient.findFirst({
    where: {
      clinicId: input.clinicId,
      phone: input.phone,
    },
  });

  if (existing) {
    throw new Error(
      `DUPLICATE_PATIENT: A patient with phone ${input.phone} already exists (${existing.fullName}, ID: ${existing.patientIdNumber})`
    );
  }

  const patientIdNumber = await generatePatientIdNumber(input.clinicId);

  const patient = await db.patient.create({
    data: {
      clinicId: input.clinicId,
      patientIdNumber,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      gender: input.gender,
      age: input.age,
      dateOfBirth: input.dateOfBirth,
      bloodGroup: input.bloodGroup,
      address: input.address,
      area: input.area,
      city: input.city || "Pune",
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      allergies: input.allergies,
      medicalConditions: input.medicalConditions,
      currentMedications: input.currentMedications,
      notes: input.notes,
    },
  });

  return patient;
}
