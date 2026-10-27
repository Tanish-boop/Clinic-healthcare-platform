import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export interface ParsedProspectRow {
  leadId: string;
  city: string;
  specialty: string;
  practiceName: string;
  area?: string;
  publicPhone?: string;
  websiteStatus?: string;
  websiteUrl?: string;
  mapsUrl?: string;
  sourceUrl?: string;
  priority?: string;
  nextAction?: string;
  notes?: string;
  doctorContact?: string;
}

/**
 * Standard default services tailored to Indian clinic specialties
 */
const DEFAULT_SPECIALTY_SERVICES: Record<
  string,
  Array<{ name: string; category: string; durationMinutes: number; price: number; description: string }>
> = {
  Dental: [
    {
      name: "Comprehensive Dental Examination & Consultation",
      category: "Consultation",
      durationMinutes: 30,
      price: 500,
      description: "Complete intra-oral evaluation, digital X-ray review, and individualized treatment planning.",
    },
    {
      name: "Ultrasonic Scaling & Tooth Polishing",
      category: "Procedure",
      durationMinutes: 45,
      price: 1500,
      description: "Removal of calculus, plaque, and extrinsic surface stains with enamel polish.",
    },
    {
      name: "Single-Sitting Rotary Root Canal Treatment (RCT)",
      category: "Procedure",
      durationMinutes: 60,
      price: 4500,
      description: "Advanced rotary endodontic biomechanical preparation, apex locator measurement, and hermetic obturation.",
    },
    {
      name: "Zirconia / Ceramic Dental Crown",
      category: "Procedure",
      durationMinutes: 45,
      price: 6500,
      description: "Precision-milled aesthetic restoration with natural shade matching and 10-year warranty.",
    },
  ],
  Dermatology: [
    {
      name: "Clinical Dermatology & Trichology Consultation",
      category: "Consultation",
      durationMinutes: 30,
      price: 700,
      description: "Evaluation of acne, eczema, psoriasis, skin pigmentation, or acute hair loss patterns.",
    },
    {
      name: "Salicylic / Glycolic Medi-Facial Peel",
      category: "Procedure",
      durationMinutes: 45,
      price: 2500,
      description: "Dermatologist-formulated chemical peel for active acne control and skin rejuvenation.",
    },
    {
      name: "Platelet-Rich Plasma (PRP) Therapy for Hair",
      category: "Procedure",
      durationMinutes: 60,
      price: 4500,
      description: "Autologous growth factor centrifugation and micro-injection for follicular density.",
    },
  ],
  Physiotherapy: [
    {
      name: "Comprehensive Musculoskeletal & Spine Assessment",
      category: "Consultation",
      durationMinutes: 45,
      price: 600,
      description: "Postural analysis, joint range of motion (ROM), pain grading, and neurological screening.",
    },
    {
      name: "Advanced Targeted Physical Therapy Session",
      category: "Procedure",
      durationMinutes: 45,
      price: 800,
      description: "Manual mobilization, ultrasound/IFT electrotherapy, dry needling, and corrective exercise.",
    },
  ],
  "General Practice": [
    {
      name: "General Physician Consultation",
      category: "Consultation",
      durationMinutes: 20,
      price: 400,
      description: "Evaluation for viral fever, hypertension, diabetes mellitus monitoring, and preventive care.",
    },
    {
      name: "Executive Annual Health Checkup Review",
      category: "Consultation",
      durationMinutes: 30,
      price: 1000,
      description: "Review of complete blood count, lipid profile, liver & renal panels with lifestyle prescriptions.",
    },
  ],
};

/**
 * Parse an Excel (.xlsx) or CSV file buffer and return validated prospect records
 */
export function parseProspectsBuffer(buffer: Buffer): ParsedProspectRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of arrays
  const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  if (rows.length < 2) return [];

  // Header inspection
  const header = rows[0].map((h: any) => String(h || "").trim().toLowerCase());
  const leadIdIdx = header.findIndex((h) => h.includes("lead id") || h.includes("id"));
  const cityIdx = header.findIndex((h) => h.includes("city"));
  const specialtyIdx = header.findIndex((h) => h.includes("specialty") || h.includes("speciality"));
  const practiceIdx = header.findIndex((h) => h.includes("clinic") || h.includes("practice"));
  const areaIdx = header.findIndex((h) => h.includes("area") || h.includes("locality"));
  const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("contact"));
  const webStatusIdx = header.findIndex((h) => h.includes("website status"));
  const webUrlIdx = header.findIndex((h) => h.includes("website /") || h.includes("website link"));
  const mapsIdx = header.findIndex((h) => h.includes("maps"));
  const sourceIdx = header.findIndex((h) => h.includes("source"));
  const priorityIdx = header.findIndex((h) => h.includes("priority"));
  const nextActionIdx = header.findIndex((h) => h.includes("next action"));
  const doctorContactIdx = header.findIndex((h) => h.includes("doctor"));

  const parsedList: ParsedProspectRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const leadId = String(row[leadIdIdx >= 0 ? leadIdIdx : 0] || "").trim();
    const practiceName = String(row[practiceIdx >= 0 ? practiceIdx : 3] || "").trim();

    if (!leadId && !practiceName) continue;

    parsedList.push({
      leadId: leadId || `LEAD-${Date.now()}-${i}`,
      city: String(row[cityIdx >= 0 ? cityIdx : 1] || "Pune").trim(),
      specialty: String(row[specialtyIdx >= 0 ? specialtyIdx : 2] || "General Practice").trim(),
      practiceName,
      area: areaIdx >= 0 ? String(row[areaIdx] || "").trim() : undefined,
      publicPhone: phoneIdx >= 0 ? String(row[phoneIdx] || "").trim() : undefined,
      websiteStatus: webStatusIdx >= 0 ? String(row[webStatusIdx] || "").trim() : undefined,
      websiteUrl: webUrlIdx >= 0 ? String(row[webUrlIdx] || "").trim() : undefined,
      mapsUrl: mapsIdx >= 0 ? String(row[mapsIdx] || "").trim() : undefined,
      sourceUrl: sourceIdx >= 0 ? String(row[sourceIdx] || "").trim() : undefined,
      priority: priorityIdx >= 0 ? String(row[priorityIdx] || "").trim() : undefined,
      nextAction: nextActionIdx >= 0 ? String(row[nextActionIdx] || "").trim() : undefined,
      doctorContact: doctorContactIdx >= 0 ? String(row[doctorContactIdx] || "").trim() : undefined,
    });
  }

  return parsedList;
}

/**
 * Save parsed prospects into the database
 */
export async function importProspects(prospects: ParsedProspectRow[]) {
  const results = {
    total: prospects.length,
    created: 0,
    updated: 0,
  };

  for (const p of prospects) {
    const existing = await db.clinicProspect.findUnique({
      where: { leadId: p.leadId },
    });

    if (existing) {
      await db.clinicProspect.update({
        where: { leadId: p.leadId },
        data: {
          city: p.city,
          specialty: p.specialty,
          practiceName: p.practiceName,
          area: p.area,
          publicPhone: p.publicPhone,
          websiteStatus: p.websiteStatus,
          websiteUrl: p.websiteUrl,
          mapsUrl: p.mapsUrl,
          sourceUrl: p.sourceUrl,
          priority: p.priority,
          nextAction: p.nextAction,
          doctorContact: p.doctorContact,
        },
      });
      results.updated++;
    } else {
      await db.clinicProspect.create({
        data: {
          leadId: p.leadId,
          city: p.city,
          specialty: p.specialty,
          practiceName: p.practiceName,
          area: p.area,
          publicPhone: p.publicPhone,
          websiteStatus: p.websiteStatus,
          websiteUrl: p.websiteUrl,
          mapsUrl: p.mapsUrl,
          sourceUrl: p.sourceUrl,
          priority: p.priority,
          nextAction: p.nextAction,
          doctorContact: p.doctorContact,
        },
      });
      results.created++;
    }
  }

  return results;
}

/**
 * One-click provision a DRAFT clinic website from an approved prospect record
 */
export async function provisionClinicFromProspect(prospectId: string, options?: { ownerEmail?: string }) {
  const prospect = await db.clinicProspect.findUnique({
    where: { id: prospectId },
  });

  if (!prospect) throw new Error("Prospect lead not found");

  // Generate safe unique slug e.g. "vinaykia-dental-care-pune"
  const baseSlug = `${prospect.practiceName}-${prospect.city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let counter = 1;
  while (await db.clinic.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return await db.$transaction(async (tx) => {
    // 1. Create Clinic in DRAFT mode
    const clinic = await tx.clinic.create({
      data: {
        name: prospect.practiceName,
        slug,
        specialty: prospect.specialty || "General Practice",
        city: prospect.city || "Pune",
        area: prospect.area,
        address: `${prospect.area || ""}, ${prospect.city || "Pune"}, Maharashtra, India`.trim(),
        primaryPhone: prospect.publicPhone?.split(";")[0]?.trim() || "+91 98000 00000",
        email: options?.ownerEmail || `contact@${slug}.medinexus.in`,
        googleMapsUrl: prospect.mapsUrl,
        websiteUrl: prospect.websiteUrl,
        status: "DRAFT",
        source: "PROSPECT_IMPORT",
        tagline: `Premier ${prospect.specialty} Care in ${prospect.area ? prospect.area + ", " : ""}${prospect.city}`,
        description: `${prospect.practiceName} provides compassionate, evidence-based healthcare with modern diagnostics and personalized patient care.`,
      },
    });

    // 2. Set default operating hours (Monday - Saturday 09:00 - 20:00, Sunday closed)
    for (let day = 0; day <= 6; day++) {
      await tx.clinicOperatingHour.create({
        data: {
          clinicId: clinic.id,
          dayOfWeek: day,
          isOpen: day !== 0, // Sunday closed by default
          openTime: "09:00",
          closeTime: "20:00",
          lunchBreakStart: "13:30",
          lunchBreakEnd: "14:30",
        },
      });
    }

    // 3. Create default services based on specialty
    const servicesList =
      DEFAULT_SPECIALTY_SERVICES[prospect.specialty] ||
      DEFAULT_SPECIALTY_SERVICES["General Practice"];

    for (let i = 0; i < servicesList.length; i++) {
      const s = servicesList[i];
      await tx.clinicService.create({
        data: {
          clinicId: clinic.id,
          name: s.name,
          category: s.category,
          durationMinutes: s.durationMinutes,
          price: s.price,
          description: s.description,
          displayOrder: i + 1,
        },
      });
    }

    // 4. Create default consultation room
    await tx.clinicRoom.create({
      data: {
        clinicId: clinic.id,
        name: "Consultation Suite 1",
        type: "CONSULTATION",
      },
    });

    // 5. Create default expense categories
    const categories = [
      "Clinic Rent",
      "Staff Salaries",
      "Consumables & Materials",
      "Utilities & Electricity",
      "Software & IT",
      "Marketing & Outreach",
    ];
    for (const cat of categories) {
      await tx.expenseCategory.create({
        data: {
          clinicId: clinic.id,
          name: cat,
        },
      });
    }

    // 6. Create default CMS sections for public website
    await tx.clinicCmsSection.create({
      data: {
        clinicId: clinic.id,
        sectionKey: "hero",
        title: `Exceptional ${prospect.specialty} Care You Can Trust`,
        subtitle: `Serving families across ${prospect.area || prospect.city} with advanced clinical precision, hygiene, and compassionate care.`,
        content: JSON.stringify({
          appointmentCtaText: "Book an Appointment",
          features: [
            "Experienced Clinical Specialists",
            "Modern Sterilization & Diagnostics",
            "Zero Wait-Time Scheduled Appointments",
            "Transparent Consultation & Procedure Fees",
          ],
        }),
      },
    });

    await tx.clinicCmsSection.create({
      data: {
        clinicId: clinic.id,
        sectionKey: "about",
        title: `Welcome to ${prospect.practiceName}`,
        subtitle: `Patient-First Healthcare in ${prospect.city}`,
        content: `At ${prospect.practiceName}, we are dedicated to delivering gold-standard clinical treatments in a welcoming and comfortable setting. Our practice brings together experienced practitioners, verified credentials, and state-of-the-art medical technology to ensure your health outcomes are optimized.`,
      },
    });

    // 7. Mark prospect as imported
    await tx.clinicProspect.update({
      where: { id: prospectId },
      data: {
        isImported: true,
        importedClinicId: clinic.id,
      },
    });

    return clinic;
  });
}
