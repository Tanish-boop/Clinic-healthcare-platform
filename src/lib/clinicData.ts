import { db } from "./db";
import { clinicConfig } from "../../clinic.config";

export async function getFlagshipClinic() {
  try {
    const clinic = await db.clinic.findFirst({
      where: { status: "ACTIVE" },
      include: {
        doctors: {
          where: { isActive: true },
          include: {
            user: {
              select: { fullName: true, avatarUrl: true },
            },
          },
        },
        services: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        cmsSections: true,
      },
    });

    if (clinic && clinic.doctors.length > 0) {
      return clinic;
    }
  } catch (error) {
    console.warn("[ClinicData] Fallback to clinicConfig:", error);
  }

  // Synthesize from clinicConfig so the website NEVER crashes on any deployment
  return {
    id: "clinic-flagship",
    name: clinicConfig.name,
    tagline: clinicConfig.tagline,
    description: clinicConfig.description,
    slug: clinicConfig.slug,
    primaryPhone: clinicConfig.primaryPhone,
    secondaryPhone: clinicConfig.secondaryPhone,
    whatsappNumber: clinicConfig.whatsappNumber,
    email: clinicConfig.email,
    area: clinicConfig.flagshipLocation.area,
    city: clinicConfig.flagshipLocation.city,
    address: clinicConfig.flagshipLocation.address,
    rating: 4.9,
    reviewCount: 320,
    cancellationNoticeHours: 4,
    emergencyNotice: "For immediate dental trauma or urgent skin emergencies, call our priority desk.",
    doctors: clinicConfig.doctors.map((d, index) => ({
      id: d.id || `doc-${index + 1}`,
      specialty: d.specialty,
      qualification: d.qualification,
      regNumber: d.regNumber,
      experienceYears: d.experienceYears,
      consultationFee: d.consultationFee,
      bio: d.bio,
      user: {
        fullName: d.fullName,
        avatarUrl: d.avatarUrl,
      },
    })),
    services: clinicConfig.services.map((s, index) => ({
      id: `srv-${index + 1}`,
      name: s.name,
      category: s.category,
      durationMinutes: s.durationMinutes,
      price: s.price,
      description: s.description,
    })),
    operatingHours: [
      { dayOfWeek: 1, openTime: "09:00", closeTime: "20:30", isClosed: false },
      { dayOfWeek: 2, openTime: "09:00", closeTime: "20:30", isClosed: false },
      { dayOfWeek: 3, openTime: "09:00", closeTime: "20:30", isClosed: false },
      { dayOfWeek: 4, openTime: "09:00", closeTime: "20:30", isClosed: false },
      { dayOfWeek: 5, openTime: "09:00", closeTime: "20:30", isClosed: false },
      { dayOfWeek: 6, openTime: "09:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: 0, openTime: "10:00", closeTime: "14:00", isClosed: false },
    ],
    cmsSections: [],
  };
}
