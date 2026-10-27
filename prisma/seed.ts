import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import { parseProspectsBuffer } from "../src/services/prospectService";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MediNexus OS database seed...");

  // 1. Password hashing for demo accounts (Default dev password: "Password@123")
  const defaultPasswordHash = await bcrypt.hash("Password@123", 10);

  // Clean slate for demo
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.clinicalDocument.deleteMany();
  await prisma.clinicalEncounter.deleteMany();
  await prisma.appointmentStatusHistory.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.clinicRoom.deleteMany();
  await prisma.clinicService.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctorLeave.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.staffMembership.deleteMany();
  await prisma.clinicOperatingHour.deleteMany();
  await prisma.clinicCmsSection.deleteMany();
  await prisma.clinicSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinicProspect.deleteMany();

  console.log("🧹 Cleaned existing records.");

  // 2. Subscription Plans
  const soloPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Solo Practitioner",
      slug: "solo-practitioner",
      description: "Ideal for single-doctor clinics and private consultations.",
      priceMonthly: 1499,
      priceAnnual: 14990,
      maxDoctors: 1,
      maxStaff: 2,
      maxPatients: 1000,
      hasOnlineBooking: true,
      hasEHR: true,
      hasBilling: true,
      hasWhatsApp: false,
      hasCustomDomain: false,
    },
  });

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: "Clinic Pro (Multi-Specialty)",
      slug: "clinic-pro",
      description: "Complete operational suite for busy multi-chair clinics and aesthetic centers.",
      priceMonthly: 3499,
      priceAnnual: 34990,
      maxDoctors: 5,
      maxStaff: 10,
      maxPatients: 10000,
      hasOnlineBooking: true,
      hasEHR: true,
      hasBilling: true,
      hasWhatsApp: true,
      hasCustomDomain: true,
    },
  });

  // 3. Platform Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      email: "superadmin@medinexus.in",
      passwordHash: defaultPasswordHash,
      fullName: "MediNexus Platform Admin",
      phone: "+91 98200 11223",
      isSuperAdmin: true,
      isActive: true,
    },
  });

  // 4. Demo Flagship Clinic in Pune
  const clinic = await prisma.clinic.create({
    data: {
      name: "Apex Dental & Aesthetic Lounge",
      slug: "apex-dental-pune",
      tagline: "Advanced Dental Care & Clinical Aesthetics in Somwar Peth, Pune",
      description:
        "Apex Dental & Aesthetic Lounge offers state-of-the-art restorative dentistry, painless rotary root canals, orthodontic smile designing, and clinical dermatology in Pune. Led by experienced specialists with over 12 years of clinical excellence.",
      specialty: "Dental",
      city: "Pune",
      area: "Somwar Peth",
      address: "Shop 12-14, Ground Floor, Royal Heritage Complex, Somwar Peth, Pune 411011",
      postalCode: "411011",
      primaryPhone: "+91 91408 92818",
      secondaryPhone: "+91 84465 71232",
      email: "care@apexdental.in",
      websiteUrl: "https://apexdental.medinexus.in",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011",
      isVerified: true,
      status: "ACTIVE",
      appointmentBufferMinutes: 10,
      cancellationNoticeHours: 4,
      currencySymbol: "₹",
      currencyCode: "INR",
      timezone: "Asia/Kolkata",
    },
  });

  // Link Subscription
  await prisma.clinicSubscription.create({
    data: {
      clinicId: clinic.id,
      planId: proPlan.id,
      status: "ACTIVE",
      startDate: new Date("2026-01-01"),
      renewalDate: new Date("2027-01-01"),
      currentPeriodEnd: new Date("2027-01-01"),
    },
  });

  // 5. Clinic Operating Hours (Mon - Sat 09:00 - 20:30, Sun 10:00 - 14:00)
  for (let day = 0; day <= 6; day++) {
    await prisma.clinicOperatingHour.create({
      data: {
        clinicId: clinic.id,
        dayOfWeek: day,
        isOpen: true,
        openTime: day === 0 ? "10:00" : "09:00",
        closeTime: day === 0 ? "14:00" : "20:30",
        lunchBreakStart: day === 0 ? null : "13:30",
        lunchBreakEnd: day === 0 ? null : "14:30",
      },
    });
  }

  // 6. Clinic Rooms
  const room1 = await prisma.clinicRoom.create({
    data: {
      clinicId: clinic.id,
      name: "Operatory A (Restorative & RCT)",
      type: "PROCEDURE",
    },
  });

  const room2 = await prisma.clinicRoom.create({
    data: {
      clinicId: clinic.id,
      name: "Consultation Suite 1 (Aesthetic & Derma)",
      type: "CONSULTATION",
    },
  });

  // 7. Clinical Services
  const serviceExam = await prisma.clinicService.create({
    data: {
      clinicId: clinic.id,
      name: "Comprehensive Oral Examination & Digital Radiovisiography",
      category: "Consultation",
      durationMinutes: 30,
      price: 500,
      description: "Intraoral camera imaging, RVG digital X-rays, caries detection, and periodontal screening.",
      displayOrder: 1,
    },
  });

  const serviceScaling = await prisma.clinicService.create({
    data: {
      clinicId: clinic.id,
      name: "Ultrasonic Deep Scaling & Fluoride Polishing",
      category: "Procedure",
      durationMinutes: 45,
      price: 1500,
      description: "Subgingival calculus removal, stain elimination, and enamel polishing with remineralizing paste.",
      displayOrder: 2,
    },
  });

  const serviceRCT = await prisma.clinicService.create({
    data: {
      clinicId: clinic.id,
      name: "Single-Sitting Rotary Root Canal Treatment (RCT)",
      category: "Procedure",
      durationMinutes: 60,
      price: 4500,
      description: "Modern endodontic therapy with electronic apex locator, nickel-titanium rotary instrumentation, and thermal obturation.",
      displayOrder: 3,
    },
  });

  const serviceCrown = await prisma.clinicService.create({
    data: {
      clinicId: clinic.id,
      name: "CAD/CAM Monolithic Zirconia Crown",
      category: "Procedure",
      durationMinutes: 45,
      price: 6500,
      description: "High-translucency metal-free crown with natural aesthetics, custom shade matching, and 10-year warranty.",
      displayOrder: 4,
    },
  });

  const serviceDerma = await prisma.clinicService.create({
    data: {
      clinicId: clinic.id,
      name: "Medical Dermatology Consultation",
      category: "Consultation",
      durationMinutes: 30,
      price: 700,
      description: "Clinical evaluation for acne vulgaris, hyperpigmentation, hair thinning, or contact dermatitis.",
      displayOrder: 5,
    },
  });

  // 8. Staff & Doctor Users
  // Clinic Owner User
  const ownerUser = await prisma.user.create({
    data: {
      email: "owner@apexdental.in",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Vikramaditya Joshi",
      phone: "+91 91408 92818",
      isActive: true,
    },
  });

  await prisma.staffMembership.create({
    data: {
      userId: ownerUser.id,
      clinicId: clinic.id,
      role: "CLINIC_OWNER",
      canManageBilling: true,
      canManageStaff: true,
      canEditClinical: true,
    },
  });

  // Doctor 1: Dr. Ananya Kulkarni (BDS, MDS - Prosthodontics)
  const doctorUser1 = await prisma.user.create({
    data: {
      email: "dr.ananya@apexdental.in",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Ananya Kulkarni",
      phone: "+91 84465 71232",
      isActive: true,
    },
  });

  const doctor1 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser1.id,
      clinicId: clinic.id,
      specialty: "Senior Prosthodontist & Implantologist",
      qualification: "BDS, MDS (Prosthodontics & Crown Bridge)",
      regNumber: "MCI-DEN-48291 / MSDC-2014/08",
      experienceYears: 11,
      bio: "Dr. Ananya Kulkarni specializes in cosmetic smile design, single-sitting root canals, full-mouth rehabilitations, and dental implants. Certified by the Indian Prosthodontic Society with over 4,500 successful procedures.",
      consultationFee: 500,
      defaultSlotDuration: 30,
    },
  });

  // Availability for Doctor 1 (Mon - Sat 10:00 - 19:00)
  for (let day = 1; day <= 6; day++) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor1.id,
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "19:00",
        slotDuration: 30,
      },
    });
  }

  // Doctor 2: Dr. Rohan Deshmukh (MBBS, MD - Dermatology)
  const doctorUser2 = await prisma.user.create({
    data: {
      email: "dr.rohan@apexdental.in",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Rohan Deshmukh",
      phone: "+91 82083 17142",
      isActive: true,
    },
  });

  const doctor2 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser2.id,
      clinicId: clinic.id,
      specialty: "Consultant Dermatologist & Cosmetologist",
      qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
      regNumber: "MMC-2016/04/1824",
      experienceYears: 8,
      bio: "Dr. Rohan Deshmukh is an experienced dermatologist focused on evidence-based acne protocols, chemical peels, hyperpigmentation correction, and clinical laser therapies.",
      consultationFee: 700,
      defaultSlotDuration: 30,
    },
  });

  for (let day = 1; day <= 6; day++) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor2.id,
        dayOfWeek: day,
        startTime: "11:00",
        endTime: "18:00",
        slotDuration: 30,
      },
    });
  }

  // Receptionist User: Pooja Shinde
  const receptionistUser = await prisma.user.create({
    data: {
      email: "reception@apexdental.in",
      passwordHash: defaultPasswordHash,
      fullName: "Pooja Shinde",
      phone: "+91 97669 30926",
      isActive: true,
    },
  });

  await prisma.staffMembership.create({
    data: {
      userId: receptionistUser.id,
      clinicId: clinic.id,
      role: "RECEPTIONIST",
      canManageBilling: true,
      canManageStaff: false,
      canEditClinical: false,
    },
  });

  // Accountant User: Suresh Joshi
  const accountantUser = await prisma.user.create({
    data: {
      email: "accounts@apexdental.in",
      passwordHash: defaultPasswordHash,
      fullName: "Suresh Joshi",
      phone: "+91 99234 59984",
      isActive: true,
    },
  });

  await prisma.staffMembership.create({
    data: {
      userId: accountantUser.id,
      clinicId: clinic.id,
      role: "ACCOUNTANT",
      canManageBilling: true,
      canManageStaff: false,
      canEditClinical: false,
    },
  });

  // 9. Realistic Synthetic Patients (22 Indian Patients)
  const syntheticPatients = [
    { fullName: "Rajesh Sharma", gender: "MALE", age: 42, phone: "+91 98220 12345", email: "rajesh.sharma@example.com", area: "Kothrud", allergies: "Penicillin" },
    { fullName: "Priya Deshpande", gender: "FEMALE", age: 34, phone: "+91 98220 23456", email: "priya.deshpande@example.com", area: "Somwar Peth", allergies: "Latex" },
    { fullName: "Amit Kulkarni", gender: "MALE", age: 29, phone: "+91 98220 34567", email: "amit.k@example.com", area: "Aundh", allergies: null },
    { fullName: "Sunita Patil", gender: "FEMALE", age: 52, phone: "+91 98220 45678", email: "sunita.patil@example.com", area: "Shivajinagar", allergies: "Sulfa drugs" },
    { fullName: "Vikram Joshi", gender: "MALE", age: 38, phone: "+91 98220 56789", email: "vikram.j@example.com", area: "Hadapsar", allergies: null },
    { fullName: "Neha Kadam", gender: "FEMALE", age: 27, phone: "+91 98220 67890", email: "neha.kadam@example.com", area: "Viman Nagar", allergies: null },
    { fullName: "Sneha Roy", gender: "FEMALE", age: 31, phone: "+91 98220 78901", email: "sneha.roy@example.com", area: "Koregaon Park", allergies: "Aspirin" },
    { fullName: "Rahul Mehta", gender: "MALE", age: 45, phone: "+91 98220 89012", email: "rahul.mehta@example.com", area: "Camp", allergies: null },
    { fullName: "Aditi Sane", gender: "FEMALE", age: 23, phone: "+91 98220 90123", email: "aditi.sane@example.com", area: "Erandwane", allergies: null },
    { fullName: "Makarand Bapat", gender: "MALE", age: 60, phone: "+91 98221 01234", email: "makarand.bapat@example.com", area: "Sadashiv Peth", allergies: "Ibuprofen" },
    { fullName: "Kavita Chitnis", gender: "FEMALE", age: 48, phone: "+91 98221 12345", email: "kavita.chitnis@example.com", area: "Model Colony", allergies: null },
    { fullName: "Sachin Gaikwad", gender: "MALE", age: 36, phone: "+91 98221 23456", email: "sachin.gaikwad@example.com", area: "Bhosari", allergies: null },
    { fullName: "Aniket More", gender: "MALE", age: 26, phone: "+91 98221 34567", email: "aniket.more@example.com", area: "Wakad", allergies: null },
    { fullName: "Tanvi Jog", gender: "FEMALE", age: 30, phone: "+91 98221 45678", email: "tanvi.jog@example.com", area: "Baner", allergies: null },
    { fullName: "Sanjay Dixit", gender: "MALE", age: 55, phone: "+91 98221 56789", email: "sanjay.dixit@example.com", area: "Deccan", allergies: "Cephalosporins" },
    { fullName: "Rituja Salvi", gender: "FEMALE", age: 39, phone: "+91 98221 67890", email: "rituja.salvi@example.com", area: "Karve Nagar", allergies: null },
    { fullName: "Deepak Shirodkar", gender: "MALE", age: 41, phone: "+91 98221 78901", email: "deepak.s@example.com", area: "Wanowrie", allergies: null },
    { fullName: "Meera Sen", gender: "FEMALE", age: 33, phone: "+91 98221 89012", email: "meera.sen@example.com", area: "Kalyani Nagar", allergies: null },
    { fullName: "Gaurav Inamdar", gender: "MALE", age: 35, phone: "+91 98221 90123", email: "gaurav.inamdar@example.com", area: "Warje", allergies: null },
    { fullName: "Swati Tendulkar", gender: "FEMALE", age: 46, phone: "+91 98222 01234", email: "swati.t@example.com", area: "Sinhagad Road", allergies: null },
    { fullName: "Nitin Jagtap", gender: "MALE", age: 50, phone: "+91 98222 12345", email: "nitin.jagtap@example.com", area: "Hadapsar", allergies: null },
    { fullName: "Pooja Vaze", gender: "FEMALE", age: 28, phone: "+91 98222 23456", email: "pooja.vaze@example.com", area: "Bibwewadi", allergies: null },
  ];

  const createdPatients = [];
  for (let i = 0; i < syntheticPatients.length; i++) {
    const p = syntheticPatients[i];
    const pat = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        patientIdNumber: `PAT-2026-${String(i + 1).padStart(4, "0")}`,
        fullName: p.fullName,
        gender: p.gender,
        age: p.age,
        phone: p.phone,
        email: p.email,
        area: p.area,
        city: "Pune",
        address: `${p.area}, Pune, Maharashtra`,
        allergies: p.allergies,
        medicalConditions: p.age > 45 ? "Mild Hypertension (managed)" : null,
      },
    });
    createdPatients.push(pat);
  }

  // Also create a patient portal user account for patient 1: Rajesh Sharma
  const patientPortalUser = await prisma.user.create({
    data: {
      email: "rajesh.sharma@example.com",
      passwordHash: defaultPasswordHash,
      fullName: "Rajesh Sharma",
      phone: "+91 98220 12345",
      isActive: true,
    },
  });

  await prisma.patient.update({
    where: { id: createdPatients[0].id },
    data: { userId: patientPortalUser.id },
  });

  // 10. Appointments Across Statuses
  const todayStr = new Date().toISOString().split("T")[0];
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

  const sampleAppointments = [
    // Completed visits with full encounters & invoices
    { patientIdx: 0, docId: doctor1.id, serviceId: serviceRCT.id, date: "2026-10-18", time: "10:30", status: "COMPLETED", complaint: "Severe throbbing pain in upper left molar (Tooth 26)", source: "WEBSITE" },
    { patientIdx: 1, docId: doctor1.id, serviceId: serviceScaling.id, date: "2026-10-18", time: "11:30", status: "COMPLETED", complaint: "Bleeding gums during brushing and calculus deposition", source: "PHONE" },
    { patientIdx: 2, docId: doctor2.id, serviceId: serviceDerma.id, date: "2026-10-19", time: "11:00", status: "COMPLETED", complaint: "Persistent cystic acne along jawline and cheeks", source: "WEBSITE" },
    { patientIdx: 3, docId: doctor1.id, serviceId: serviceCrown.id, date: "2026-10-19", time: "15:00", status: "COMPLETED", complaint: "Final crown cementation for lower right molar", source: "STAFF" },
    { patientIdx: 4, docId: doctor1.id, serviceId: serviceExam.id, date: "2026-10-19", time: "16:30", status: "COMPLETED", complaint: "Routine dental health checkup and sensitivity evaluation", source: "WALK_IN" },
    { patientIdx: 5, docId: doctor2.id, serviceId: serviceDerma.id, date: "2026-10-20", time: "12:00", status: "COMPLETED", complaint: "Dark pigmentation patches on forehead and bridge of nose", source: "WEBSITE" },
    
    // Today's appointments (In consultation, checked in, confirmed)
    { patientIdx: 6, docId: doctor1.id, serviceId: serviceExam.id, date: todayStr, time: "10:30", status: "COMPLETED", complaint: "Mild discomfort on chewing cold foods", source: "WEBSITE" },
    { patientIdx: 7, docId: doctor1.id, serviceId: serviceRCT.id, date: todayStr, time: "11:30", status: "IN_CONSULTATION", complaint: "Second sitting for obturation of Tooth 46", source: "PHONE" },
    { patientIdx: 8, docId: doctor1.id, serviceId: serviceScaling.id, date: todayStr, time: "14:30", status: "CHECKED_IN", complaint: "Pre-wedding teeth cleaning and stain removal", source: "WEBSITE" },
    { patientIdx: 9, docId: doctor1.id, serviceId: serviceExam.id, date: todayStr, time: "16:00", status: "CONFIRMED", complaint: "Bleeding gums and sensitivity", source: "WEBSITE" },
    { patientIdx: 10, docId: doctor2.id, serviceId: serviceDerma.id, date: todayStr, time: "11:30", status: "CHECKED_IN", complaint: "Recurrent fungal infection on hands", source: "WALK_IN" },
    { patientIdx: 11, docId: doctor2.id, serviceId: serviceDerma.id, date: todayStr, time: "15:00", status: "CONFIRMED", complaint: "Sudden hair loss over circular patch", source: "WEBSITE" },
    
    // Future / Requested / Cancelled / No-show appointments
    { patientIdx: 12, docId: doctor1.id, serviceId: serviceExam.id, date: "2026-10-22", time: "10:30", status: "CONFIRMED", complaint: "Wisdom tooth eruption pain", source: "WEBSITE" },
    { patientIdx: 13, docId: doctor1.id, serviceId: serviceScaling.id, date: "2026-10-22", time: "11:30", status: "CONFIRMED", complaint: "Preventive scaling", source: "PHONE" },
    { patientIdx: 14, docId: doctor1.id, serviceId: serviceCrown.id, date: "2026-10-22", time: "15:00", status: "CONFIRMED", complaint: "Crown shade trial", source: "STAFF" },
    { patientIdx: 15, docId: doctor2.id, serviceId: serviceDerma.id, date: "2026-10-23", time: "11:30", status: "REQUESTED", complaint: "Chemical peel inquiry", source: "WEBSITE" },
    { patientIdx: 16, docId: doctor1.id, serviceId: serviceExam.id, date: "2026-10-23", time: "14:30", status: "REQUESTED", complaint: "Broken tooth repair inquiry", source: "WEBSITE" },
    { patientIdx: 17, docId: doctor1.id, serviceId: serviceExam.id, date: "2026-10-17", time: "10:30", status: "CANCELLED", complaint: "Tooth ache", source: "WEBSITE" },
    { patientIdx: 18, docId: doctor2.id, serviceId: serviceDerma.id, date: "2026-10-17", time: "12:00", status: "NO_SHOW", complaint: "Skin rash", source: "PHONE" },
  ];

  const createdAppointments = [];
  for (let i = 0; i < sampleAppointments.length; i++) {
    const s = sampleAppointments[i];
    const pat = createdPatients[s.patientIdx];
    const aptDate = new Date(`${s.date}T00:00:00.000Z`);
    const [h, m] = s.time.split(":").map(Number);
    const endMinutes = m + 30;
    const endH = endMinutes >= 60 ? h + 1 : h;
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    const apt = await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        bookingReference: `APT-2610-${String(1000 + i)}`,
        patientId: pat.id,
        doctorId: s.docId,
        serviceId: s.serviceId,
        roomId: s.docId === doctor1.id ? room1.id : room2.id,
        appointmentDate: aptDate,
        startTime: s.time,
        endTime: endTimeStr,
        durationMinutes: 30,
        type: "IN_PERSON",
        status: s.status,
        source: s.source,
        chiefComplaint: s.complaint,
        queueNumber: i + 1,
      },
    });

    await prisma.appointmentStatusHistory.create({
      data: {
        appointmentId: apt.id,
        fromStatus: null,
        toStatus: s.status,
        notes: `Appointment status initialized as ${s.status}`,
        changedBy: "System",
      },
    });

    createdAppointments.push(apt);
  }

  // 11. Clinical Encounters for Completed Visits with Structured Specialty Data
  // Encounter 1 (Dental RCT for Rajesh Sharma - Tooth 26)
  const encounter1 = await prisma.clinicalEncounter.create({
    data: {
      clinicId: clinic.id,
      patientId: createdPatients[0].id,
      doctorId: doctor1.id,
      appointmentId: createdAppointments[0].id,
      specialtyType: "DENTAL",
      bpSystolic: 124,
      bpDiastolic: 82,
      pulse: 74,
      temperatureF: 98.4,
      weightKg: 76.5,
      subjectiveNotes: "Patient reports severe nocturnal throbbing pain in upper left quadrant radiating to temple. Aggravated by hot liquids.",
      objectiveNotes: "Deep occlusal carious lesion on Tooth 26 with pulpal exposure. Tender on vertical percussion. No periapical swelling.",
      assessment: "Acute Irreversible Pulpitis with Symptomatic Apical Periodontitis in relation to Tooth 26.",
      plan: "Biomechanical preparation under local anesthesia (Lignox 2%). Working lengths established with apex locator: MB-19mm, DB-18.5mm, Palatal-20.5mm. Canal shaping up to ProTaper Gold F2. Calcium hydroxide intracanal medicament placed.",
      specialtyData: JSON.stringify({
        teethExamined: [
          { number: 26, condition: "Deep Dental Caries / Pulpal Involvement", plan: "Root Canal Treatment" },
          { number: 27, condition: "Incipient enamel caries", plan: "Preventive topical fluoride / monitoring" },
        ],
        periapicalRadiograph: "Periapical widening noted at mesiobuccal root apex of 26",
      }),
      followUpDate: new Date("2026-10-25"),
      followUpNotes: "Review for second sitting: Canal dry, verify asymptomatic status, and proceed with gutta-percha obturation.",
      isFinalized: true,
      finalizedAt: new Date("2026-10-18T11:15:00.000Z"),
    },
  });

  // Prescription for Encounter 1
  const rx1 = await prisma.prescription.create({
    data: {
      clinicId: clinic.id,
      patientId: createdPatients[0].id,
      doctorId: doctor1.id,
      encounterId: encounter1.id,
      generalAdvice: "Chew from the opposite side. Warm saline rinses after 24 hours. Avoid very hot or hard food items.",
      isAuthorizedForPatient: true,
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: rx1.id,
        medicineName: "Amoxicillin + Potassium Clavulanate (Augmentin 625mg)",
        dosage: "625 mg",
        frequency: "1-0-1 (Twice daily)",
        timing: "After food",
        durationDays: 5,
        instructions: "Complete full 5-day course without skipping doses.",
      },
      {
        prescriptionId: rx1.id,
        medicineName: "Aceclofenac + Paracetamol (Zerodol-P)",
        dosage: "100mg/325mg",
        frequency: "1-0-1 (Twice daily)",
        timing: "After food",
        durationDays: 3,
        instructions: "Take for pain relief. Stop when pain completely subsides.",
      },
      {
        prescriptionId: rx1.id,
        medicineName: "Pantoprazole 40mg (Pan-40)",
        dosage: "40 mg",
        frequency: "1-0-0 (Once daily)",
        timing: "30 minutes before breakfast",
        durationDays: 5,
        instructions: "For gastro-protection during antibiotic therapy.",
      },
    ],
  });

  // Encounter 2 (Dermatology for Amit Kulkarni - Acne)
  const encounter2 = await prisma.clinicalEncounter.create({
    data: {
      clinicId: clinic.id,
      patientId: createdPatients[2].id,
      doctorId: doctor2.id,
      appointmentId: createdAppointments[2].id,
      specialtyType: "DERMATOLOGY",
      bpSystolic: 118,
      bpDiastolic: 78,
      pulse: 72,
      temperatureF: 98.2,
      weightKg: 68.0,
      subjectiveNotes: "29-year-old male presenting with inflammatory facial breakouts for past 6 months, worsened by helmet strap friction.",
      objectiveNotes: "Multiple erythematous papules and closed comedones across bilateral zygomatic and mandibular areas. Fitzpatrick skin type IV.",
      assessment: "Grade II-III Acne Vulgaris with Post-Inflammatory Hyperpigmentation (PIH).",
      plan: "Gentle non-comedogenic foaming cleanser, topical Adapalene + Clindamycin gel at bedtime, broad-spectrum sunscreen SPF 50+. Plan for 20% Salicylic peel after 3 weeks.",
      specialtyData: JSON.stringify({
        fitzpatrickSkinType: "IV",
        lesionTypes: ["Inflammatory Papules", "Closed Comedones", "Post-Inflammatory Hyperpigmentation"],
        sunscreenAdvised: "SPF 50 PA++++ Mineral Sunscreen gel",
      }),
      followUpDate: new Date("2026-11-10"),
      followUpNotes: "Assess skin tolerance to retinoid and evaluate suitability for medical peel.",
      isFinalized: true,
      finalizedAt: new Date("2026-10-19T11:40:00.000Z"),
    },
  });

  const rx2 = await prisma.prescription.create({
    data: {
      clinicId: clinic.id,
      patientId: createdPatients[2].id,
      doctorId: doctor2.id,
      encounterId: encounter2.id,
      generalAdvice: "Avoid picking or popping lesions. Wash face twice daily with cool water. Keep helmet foam sanitized.",
      isAuthorizedForPatient: true,
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: rx2.id,
        medicineName: "Adapalene 0.1% + Clindamycin 1% Gel (Deriva-CMS)",
        dosage: "Pea-sized amount",
        frequency: "0-0-1 (Nightly)",
        timing: "Before bedtime",
        durationDays: 30,
        instructions: "Apply thin layer to affected face areas only at night after mild cleanser.",
      },
      {
        prescriptionId: rx2.id,
        medicineName: "Zinc & Nicotinamide Oral Capsules",
        dosage: "1 capsule",
        frequency: "1-0-0 (Once daily)",
        timing: "After lunch",
        durationDays: 30,
        instructions: "Nutritional sebum regulation support.",
      },
    ],
  });

  // 12. Invoices & Payments (Reconciled Financial Ledger)
  // Invoice 1: Rajesh Sharma (RCT Procedure - ₹4,500, Paid in full via UPI)
  const inv1 = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      invoiceNumber: "INV-2026-0001",
      patientId: createdPatients[0].id,
      appointmentId: createdAppointments[0].id,
      invoiceDate: new Date("2026-10-18T11:20:00.000Z"),
      subtotal: 4500,
      discountAmount: 0,
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 4500,
      paidAmount: 4500,
      balanceDue: 0,
      status: "PAID",
      notes: "Rotary RCT Single Sitting for Tooth 26",
      items: {
        create: [
          {
            serviceId: serviceRCT.id,
            description: "Single-Sitting Rotary Root Canal Treatment (RCT) - Tooth 26",
            quantity: 1,
            unitPrice: 4500,
            totalPrice: 4500,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      receiptNumber: "REC-2026-0001",
      amount: 4500,
      paymentMethod: "UPI",
      referenceNumber: "UPI/329108429102",
      receivedBy: "Pooja Shinde (Front Desk)",
      paymentDate: new Date("2026-10-18T11:25:00.000Z"),
      notes: "Received via Google Pay QR code",
    },
  });

  // Invoice 2: Priya Deshpande (Scaling - ₹1,500, Paid in Cash)
  const inv2 = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      invoiceNumber: "INV-2026-0002",
      patientId: createdPatients[1].id,
      appointmentId: createdAppointments[1].id,
      invoiceDate: new Date("2026-10-18T12:05:00.000Z"),
      subtotal: 1500,
      discountAmount: 0,
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 1500,
      paidAmount: 1500,
      balanceDue: 0,
      status: "PAID",
      notes: "Full mouth ultrasonic prophylaxis",
      items: {
        create: [
          {
            serviceId: serviceScaling.id,
            description: "Ultrasonic Deep Scaling & Fluoride Polishing",
            quantity: 1,
            unitPrice: 1500,
            totalPrice: 1500,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv2.id,
      receiptNumber: "REC-2026-0002",
      amount: 1500,
      paymentMethod: "CASH",
      receivedBy: "Pooja Shinde",
      paymentDate: new Date("2026-10-18T12:10:00.000Z"),
      notes: "Cash collected at desk",
    },
  });

  // Invoice 3: Sunita Patil (Zirconia Crown - ₹6,500, Partial Payment ₹3,000 via Card, ₹3,500 Due)
  const inv3 = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      invoiceNumber: "INV-2026-0003",
      patientId: createdPatients[3].id,
      appointmentId: createdAppointments[3].id,
      invoiceDate: new Date("2026-10-19T15:45:00.000Z"),
      subtotal: 6500,
      discountAmount: 500, // Senior citizen discount
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 6000,
      paidAmount: 3000,
      balanceDue: 3000,
      status: "PARTIALLY_PAID",
      notes: "CAD/CAM Zirconia crown delivery with 5-year warranty card",
      items: {
        create: [
          {
            serviceId: serviceCrown.id,
            description: "CAD/CAM Monolithic Zirconia Crown - Tooth 46",
            quantity: 1,
            unitPrice: 6500,
            totalPrice: 6500,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv3.id,
      receiptNumber: "REC-2026-0003",
      amount: 3000,
      paymentMethod: "CREDIT_CARD",
      referenceNumber: "POS/TXN-840192",
      receivedBy: "Suresh Joshi",
      paymentDate: new Date("2026-10-19T15:50:00.000Z"),
      notes: "HDFC POS terminal swipe",
    },
  });

  // Invoice 4: Amit Kulkarni (Derma Consultation - ₹700, Paid via UPI)
  const inv4 = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      invoiceNumber: "INV-2026-0004",
      patientId: createdPatients[2].id,
      appointmentId: createdAppointments[2].id,
      invoiceDate: new Date("2026-10-19T11:45:00.000Z"),
      subtotal: 700,
      discountAmount: 0,
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 700,
      paidAmount: 700,
      balanceDue: 0,
      status: "PAID",
      notes: "Clinical Dermatology consultation",
      items: {
        create: [
          {
            serviceId: serviceDerma.id,
            description: "Medical Dermatology Consultation",
            quantity: 1,
            unitPrice: 700,
            totalPrice: 700,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv4.id,
      receiptNumber: "REC-2026-0004",
      amount: 700,
      paymentMethod: "UPI",
      referenceNumber: "UPI/329210948192",
      receivedBy: "Pooja Shinde",
      paymentDate: new Date("2026-10-19T11:50:00.000Z"),
      notes: "PhonePe QR payment",
    },
  });

  // Invoice 5: Vikram Joshi (Consultation - ₹500, Pending / Unpaid)
  await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      invoiceNumber: "INV-2026-0005",
      patientId: createdPatients[4].id,
      appointmentId: createdAppointments[4].id,
      invoiceDate: new Date("2026-10-19T17:00:00.000Z"),
      subtotal: 500,
      discountAmount: 0,
      taxRatePercent: 0,
      taxAmount: 0,
      totalAmount: 500,
      paidAmount: 0,
      balanceDue: 500,
      status: "PENDING",
      notes: "Consultation - Patient requested payment on next appointment",
      items: {
        create: [
          {
            serviceId: serviceExam.id,
            description: "Comprehensive Oral Examination & Digital Radiovisiography",
            quantity: 1,
            unitPrice: 500,
            totalPrice: 500,
          },
        ],
      },
    },
  });

  // 13. Clinic Operating Expenses
  const expCategories = [
    { name: "Clinic Rent", amount: 45000, method: "BANK_TRANSFER", title: "Monthly Rent - Somwar Peth Complex (Oct 2026)", vendor: "Royal Heritage Realty Ltd" },
    { name: "Staff Salaries", amount: 65000, method: "BANK_TRANSFER", title: "Front Desk & Nursing Staff Salaries", vendor: "Direct Staff Payroll" },
    { name: "Dental Consumables", amount: 18450, method: "UPI", title: "Dental Restorative Materials & Biomechanical Rotary Files", vendor: "Dentsply Sirona Pune Agency" },
    { name: "Utilities & Electricity", amount: 8200, method: "UPI", title: "MSEDCL Clinic Electricity Bill (Commercial 3-Phase)", vendor: "Maharashtra State Electricity Distribution" },
    { name: "Software & IT", amount: 3499, method: "UPI", title: "MediNexus OS SaaS Cloud Subscription", vendor: "MediNexus HealthTech Technologies" },
  ];

  for (const exp of expCategories) {
    const cat = await prisma.expenseCategory.create({
      data: {
        clinicId: clinic.id,
        name: exp.name,
      },
    });

    await prisma.expense.create({
      data: {
        clinicId: clinic.id,
        categoryId: cat.id,
        title: exp.title,
        amount: exp.amount,
        paymentMethod: exp.method,
        vendorName: exp.vendor,
        paymentDate: new Date("2026-10-15"),
      },
    });
  }

  // 14. Ingest Prospect Workbook (`prospects.xlsx`)
  const xlsxPath = path.resolve(__dirname, "../prospects.xlsx");
  if (fs.existsSync(xlsxPath)) {
    console.log("📊 Ingesting prospect workbook into database...");
    const buffer = fs.readFileSync(xlsxPath);
    const parsedProspects = parseProspectsBuffer(buffer);
    console.log(`Found ${parsedProspects.length} prospect records.`);

    for (const p of parsedProspects) {
      await prisma.clinicProspect.create({
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
    }
    console.log(`✅ Seeded ${parsedProspects.length} clinic prospects for Pune & Mumbai.`);
  }

  // 15. Website CMS Sections for Flagship Clinic
  await prisma.clinicCmsSection.createMany({
    data: [
      {
        clinicId: clinic.id,
        sectionKey: "hero",
        title: "Painless Dental Precision & Gold-Standard Clinical Care",
        subtitle: "Serving Pune with advanced rotary endodontics, CAD/CAM aesthetic crowns, and clinical dermatology in Somwar Peth.",
        content: JSON.stringify({
          badge: "Trusted by 4,500+ Patients in Pune",
          ctaButton: "Book Consultation",
          features: [
            "Single-Sitting Painless Root Canals",
            "Full Mouth Digital RVG & OPG Imaging",
            "Hospital-Grade Autoclave Sterilization",
            "Direct Insurance & UPI Billing",
          ],
        }),
      },
      {
        clinicId: clinic.id,
        sectionKey: "about",
        title: "About Apex Dental & Aesthetic Lounge",
        subtitle: "Evidence-Based Clinical Dentistry & Dermatology",
        content:
          "Founded with a vision to deliver transparent, empathetic, and technologically superior healthcare in Pune, Apex Dental & Aesthetic Lounge bridges the gap between patient comfort and surgical precision. Every procedure is performed following strict sterilisation protocols adhering to international OSHA and Indian Dental Council standards.",
      },
      {
        clinicId: clinic.id,
        sectionKey: "philosophy",
        title: "Our Philosophy of Patient Care",
        subtitle: "Conservative, Honest & Transparent",
        content:
          "We believe in preserving natural tooth structure whenever clinically viable. We explain every diagnosis with high-definition intra-oral photographs and digital X-rays before beginning treatment, giving patients complete clarity over procedures, durations, and costs.",
      },
    ],
  });

  console.log("🎉 Seed completed successfully!");
  console.log("-----------------------------------------------------------------");
  console.log("Demo Accounts (Password for all accounts: Password@123)");
  console.log("• Platform Super Admin: superadmin@medinexus.in");
  console.log("• Clinic Owner / Director: owner@apexdental.in");
  console.log("• Doctor 1 (Dentist): dr.ananya@apexdental.in");
  console.log("• Doctor 2 (Dermatologist): dr.rohan@apexdental.in");
  console.log("• Receptionist: reception@apexdental.in");
  console.log("• Accountant: accounts@apexdental.in");
  console.log("• Patient Portal: rajesh.sharma@example.com");
  console.log("-----------------------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
