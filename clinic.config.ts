/**
 * ============================================================================
 * MEDINEXUS CLINIC OS - WHITELABEL BASE CONFIGURATION
 * ============================================================================
 * Edit this single configuration file to instantly re-brand and personalize
 * the entire website and clinic management system for any new doctor or clinic.
 * ============================================================================
 */

export interface DoctorConfig {
  id: string;
  fullName: string;
  shortName: string;
  email: string;
  phone: string;
  qualification: string;
  specialty: string;
  regNumber: string;
  experienceYears: number;
  consultationFee: number;
  avatarUrl: string;
  bio: string;
  shiftBadge: string;
  whatsappMessage: string;
}

export interface ServiceConfig {
  name: string;
  category: "Consultation" | "Dental" | "Aesthetics" | "Surgery" | "Preventive";
  durationMinutes: number;
  price: number;
  description: string;
  imageUrl?: string;
}

export interface ClinicConfig {
  // 1. Brand Identity
  name: string;
  tagline: string;
  description: string;
  slug: string;

  // 2. Contact & Communications
  primaryPhone: string;
  secondaryPhone?: string;
  whatsappNumber: string;
  email: string;
  websiteUrl: string;

  // 3. Physical Locations & Google Maps
  flagshipLocation: {
    title: string;
    address: string;
    area: string;
    city: string;
    state: string;
    postalCode: string;
    landmark: string;
    googleMapsDirectionsUrl: string;
    googleMapsEmbedUrl: string;
  };
  branchLocation?: {
    title: string;
    address: string;
    area: string;
    city: string;
    landmark: string;
    googleMapsDirectionsUrl: string;
  };

  // 4. Timings
  timings: {
    weekdays: string;
    saturday: string;
    sunday: string;
    lunchRecess: string;
  };

  // 5. Medical Staff & Doctors
  doctors: DoctorConfig[];

  // 6. Transparent Procedure & Pricing Menu
  services: ServiceConfig[];
}

export const clinicConfig: ClinicConfig = {
  // 1. Clinic Brand Name & Tagline
  name: "Apex Dental & Aesthetic Lounge",
  tagline: "Advanced Dental Care & Clinical Aesthetics in Somwar Peth & Baner, Pune",
  description:
    "Apex Dental & Aesthetic Lounge offers state-of-the-art restorative dentistry, painless rotary root canals, orthodontic smile designing, and clinical dermatology in Pune. Led by experienced specialists with over 12 years of clinical excellence.",
  slug: "apex-dental-pune",

  // 2. Contact Details
  primaryPhone: "+91 91408 92818",
  secondaryPhone: "+91 84465 71232",
  whatsappNumber: "+91 98230 45678",
  email: "care@apexdental.in",
  websiteUrl: "https://apexdental.in",

  // 3. Physical Addresses & Google Maps Navigation
  flagshipLocation: {
    title: "Central Pune Flagship Lounge — Somwar Peth",
    address: "Shop 12-14, Ground Floor, Royal Heritage Complex, Somwar Peth, Pune, Maharashtra 411011",
    area: "Somwar Peth",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411011",
    landmark: "Near KEM Hospital & Pune Railway Station (Step-free ground floor wheelchair entry)",
    googleMapsDirectionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011",
    googleMapsEmbedUrl:
      "https://maps.google.com/maps?q=Royal+Heritage+Complex+Somwar+Peth+Pune+411011&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  branchLocation: {
    title: "West Pune Consultation Lounge — Baner-Pashan",
    address: "Baner-Pashan Link Road, Baner, Pune, Maharashtra 411045",
    area: "Baner",
    city: "Pune",
    landmark: "Near Symbiosis International University Road & Aundh-Baner Corridor",
    googleMapsDirectionsUrl:
      "https://www.google.com/maps/search/?api=1&query=Baner-Pashan+Link+Road+Baner+Pune+411045",
  },

  // 4. Timetable
  timings: {
    weekdays: "09:00 AM – 08:30 PM",
    saturday: "09:00 AM – 08:00 PM",
    sunday: "10:00 AM – 02:00 PM (Emergency Trauma & Pre-booked)",
    lunchRecess: "01:30 PM – 02:30 PM (Daily Sterilization Recess)",
  },

  // 5. Doctors List
  doctors: [
    {
      id: "doctor-1",
      fullName: "Dr. Ananya Kulkarni",
      shortName: "Dr. Ananya Kulkarni (MDS)",
      email: "dr.ananya@apexdental.in",
      phone: "+91 84465 71232",
      qualification: "BDS, MDS (Prosthodontics & Oral Implantology)",
      specialty: "Senior Prosthodontist & Oral Implantologist",
      regNumber: "MDC Reg: A-28491 / MSDC",
      experienceYears: 12,
      consultationFee: 1000,
      avatarUrl: "/images/doctor-ananya.jpg",
      bio: "MUHS Gold Medalist specializing in single-sitting rotary root canals, full mouth rehabilitation, dental implants, and porcelain smile design.",
      shiftBadge: "In Clinic Today (Morning & Evening)",
      whatsappMessage: "Hello Dr. Ananya / Apex Dental, I would like to book a dental consultation in Pune.",
    },
    {
      id: "doctor-2",
      fullName: "Dr. Rohan Deshmukh",
      shortName: "Dr. Rohan Deshmukh (MD Derm)",
      email: "dr.rohan@apexdental.in",
      phone: "+91 82083 17142",
      qualification: "MBBS, MD (Dermatology, Venereology & Leprosy)",
      specialty: "Consultant Dermatologist & Aesthetic Physician",
      regNumber: "MMC Reg: 2012/05/1429",
      experienceYears: 9,
      consultationFee: 1200,
      avatarUrl: "/images/doctor-rohan.jpg",
      bio: "Ex-KEM Mumbai alumnus specializing in clinical acne management, acne scar subcision, medical HydraFacials, and anti-aging dermatology.",
      shiftBadge: "In Clinic Today (Afternoon Shift)",
      whatsappMessage: "Hello Dr. Rohan / Apex Lounge, I would like to book a clinical dermatology consultation in Pune.",
    },
  ],

  // 6. Clinical Menu
  services: [
    {
      name: "Comprehensive Oral Examination & Digital RVG X-Rays",
      category: "Consultation",
      durationMinutes: 30,
      price: 500,
      description: "Intraoral camera imaging, digital low-radiation RVG X-rays, caries detection, and periodontal screening.",
    },
    {
      name: "Single-Sitting Rotary Root Canal (RCT)",
      category: "Dental",
      durationMinutes: 60,
      price: 4500,
      description: "Painless computerized apex locator measurement, motorized rotary file cleaning, and 3D biocompatible obturation.",
      imageUrl: "/images/treatment-invisalign.jpg",
    },
    {
      name: "Invisible Clear Aligners Workup & 3D Scan",
      category: "Dental",
      durationMinutes: 30,
      price: 3500,
      description: "3D digital intraoral scan, personalized smile simulation, and comprehensive orthodontic treatment roadmap.",
      imageUrl: "/images/treatment-invisalign.jpg",
    },
    {
      name: "Medical HydraFacial & Skin Rejuvenation",
      category: "Aesthetics",
      durationMinutes: 45,
      price: 3500,
      description: "Medical-grade vacuum pore exfoliation, painless blackhead extraction, and antioxidant hyaluronic infusion.",
      imageUrl: "/images/treatment-dermatology.jpg",
    },
  ],
};
