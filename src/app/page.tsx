import Link from "next/link";
import { getFlagshipClinic } from "@/lib/clinicData";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BookingWidget } from "@/components/public/BookingWidget";
import { MobileHeroShowcase } from "@/components/public/MobileHeroShowcase";
import { MobileStickyBottomBar } from "@/components/public/MobileStickyBottomBar";
import { DoctorSelectButton } from "@/components/public/DoctorSelectButton";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Star,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const clinic = await getFlagshipClinic();

  const doctorOptions = clinic.doctors.map((d) => ({
    id: d.id,
    name: d.user.fullName,
    specialty: d.specialty,
    qualification: d.qualification,
    consultationFee: d.consultationFee,
    avatarUrl: d.user.avatarUrl,
  }));

  const serviceOptions = clinic.services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price,
    category: s.category,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || "Somwar Peth / Koregaon Park"}
        city={clinic.city}
      />

      <main className="flex-1">
        {/* ------------------------------------------------------------- */}
        {/* 1. HERO SECTION: Authentic Medical Brand & High-Trust Visuals */}
        {/* ------------------------------------------------------------- */}
        <section className="relative bg-gradient-to-b from-white via-slate-50 to-slate-100/80 border-b border-slate-200 pt-5 sm:pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* MOBILE-FIRST DOCTOR & CLINIC SHOWCASE (Rendered FIRST on mobile < 1024px) */}
            <div className="block lg:hidden mb-6">
              <MobileHeroShowcase
                clinicName={clinic.name}
                phone={clinic.primaryPhone}
                area={clinic.area || "Somwar Peth / Baner"}
                city={clinic.city}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Clinic Value Proposition */}
              <div className="lg:col-span-7 space-y-6">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-200/90 text-teal-800 text-xs font-bold tracking-wide shadow-2xs transition group"
                  title="Open Pune Clinic on Google Maps"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>Verified Medical Practice • Somwar Peth & Baner, Pune</span>
                  <ExternalLink className="w-3 h-3 text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                  Painless Dental Surgery & Clinical Aesthetic Care
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Led by <strong>Dr. Ananya Kulkarni (MDS)</strong> and <strong>Dr. Rohan Deshmukh (MD)</strong>. 
                  Experience precision single-sitting root canals, invisible clear aligners, dental implants, and evidence-based dermatology in an unhurried, sterile private lounge environment.
                </p>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
                    <Award className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">MDS & MD Faculty</div>
                      <div className="text-[11px] text-slate-500">MDC & MMC Verified</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Guaranteed Slots</div>
                      <div className="text-[11px] text-slate-500">Zero Waiting Room Delay</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5 col-span-2 sm:col-span-1">
                    <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Class-B Autoclave</div>
                      <div className="text-[11px] text-slate-500">100% Sterile Six-Step Chain</div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#booking-section"
                    className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition duration-150"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reserve Priority Consultation</span>
                  </a>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-teal-700 px-4 py-3.5 rounded-xl border border-slate-300 hover:border-teal-600 transition bg-white shadow-2xs"
                  >
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>Google Maps Directions</span>
                  </a>

                  <a
                    href={`tel:${clinic.primaryPhone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-3.5 rounded-xl transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>Call: {clinic.primaryPhone}</span>
                  </a>
                </div>

                {/* Doctor Avatar Chips */}
                <div className="pt-2 flex items-center gap-4 border-t border-slate-200/80">
                  <div className="flex -space-x-2">
                    <img
                      src="/images/doctor-ananya.jpg"
                      alt="Dr. Ananya Kulkarni"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <img
                      src="/images/doctor-rohan.jpg"
                      alt="Dr. Rohan Deshmukh"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-900">Consulting Today:</span> Dr. Ananya (MDS) & Dr. Rohan (MD)
                    <div className="text-[11px] text-teal-700 font-medium">Standard Specialist Fee: ₹1,000 (Incl. RVG X-Rays)</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual & Floating Trust Credentials (Desktop only, mobile has MobileHeroShowcase at the top) */}
              <div className="hidden lg:block lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                  <img
                    src="/images/clinic-operatory.jpg"
                    alt="Apex Dental & Aesthetic Lounge Operatory Suite Pune"
                    className="w-full h-[380px] sm:h-[440px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-white/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">Carl Zeiss Microscopic Operatory</div>
                      <div className="text-[10px] text-slate-500">Painless Rotary Endodontics</div>
                    </div>
                  </div>

                  {/* Bottom Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/60 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-teal-300">Apex Dental & Aesthetic Lounge</div>
                        <div className="text-[11px] text-slate-300">Somwar Peth / Koregaon Park, Pune</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">Next Slot: 04:30 PM</div>
                        <div className="text-[10px] text-slate-400">Dr. Ananya Kulkarni</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute -bottom-5 -left-4 sm:left-4 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-200 flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">4.9 / 5.0</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">(620+ Pune Patients)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 2. CLINIC INTERIOR & FACILITIES GALLERY                       */}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                Hospital-Grade Facility
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Designed for Absolute Patient Comfort & Sterile Safety
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                A look inside our Koregaon Park / Somwar Peth lounge. We invest in medical-grade infrastructure to ensure an unhurried, reassuring clinical experience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Photo 1: Lounge */}
              <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/images/reception-lounge.jpg"
                    alt="Executive Patient Welcome Lounge"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">Executive Patient Lounge</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Zero crowded waiting areas. Calm boutique lounge with warm lighting and private check-ins.
                  </p>
                </div>
              </div>

              {/* Photo 2: Operatory */}
              <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/images/clinic-operatory.jpg"
                    alt="Carl Zeiss Microscopic Operatory"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">Microscopic Dental Suite</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Carl Zeiss surgical microscope for sub-millimeter precision root canals and painless restorative care.
                  </p>
                </div>
              </div>

              {/* Photo 3: Sterilization */}
              <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/images/sterilization-suite.jpg"
                    alt="European Class-B Autoclave Center"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">European Class-B Autoclave</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Melag vacuum autoclave with individually sealed surgical cassettes opened in front of each patient.
                  </p>
                </div>
              </div>

              {/* Photo 4: Aesthetic Suite */}
              <div className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs hover:shadow-md transition">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/images/treatment-dermatology.jpg"
                    alt="Clinical Dermatology & HydraFacial Suite"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">Dermatology & Skin Suite</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Medical-grade HydraFacial systems, dermoscopic skin analysis, and evidence-based acne care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 3. VERIFIED SPECIALIST DOCTORS (Real Photos & Medical Councils)*/}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                Medical Council Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Meet Your Specialist Consultants
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                We believe in complete clinical transparency. Both senior practitioners hold postgraduate degrees from accredited Indian medical universities with active state council licenses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Doctor 1: Dr. Ananya Kulkarni */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <img
                      src="/images/doctor-ananya.jpg"
                      alt="Dr. Ananya Kulkarni MDS"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                        Senior Prosthodontist & Endodontist
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Dr. Ananya Kulkarni
                      </h3>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        BDS, MDS (Prosthodontics & Endodontics)
                      </div>
                      <div className="text-[11px] text-teal-700 font-semibold mt-1">
                        11+ Yrs Experience • 4,500+ Procedures
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Specializes in single-sitting microscopic root canal therapy, aesthetic porcelain veneers, and full mouth rehabilitations. Former consulting specialist at Ruby Hall Clinic and Jehangir Hospital. Certified member of the Indian Dental Association.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Council Registration</div>
                      <div className="font-mono font-bold text-slate-800 text-[11px]">MDC-74921 / MSDC</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</div>
                      <div className="font-bold text-teal-900">₹1,000 <span className="text-[10px] text-slate-500 font-normal">(Incl. RVG X-Rays)</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>In Clinic Today (Morning & Evening)</span>
                  </span>
                  <DoctorSelectButton doctorSnippet="Ananya" label="Select Dr. Ananya" />
                </div>
              </div>

              {/* Doctor 2: Dr. Rohan Deshmukh */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <img
                      src="/images/doctor-rohan.jpg"
                      alt="Dr. Rohan Deshmukh MD"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                        Dermatologist & Aesthetic Physician
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Dr. Rohan Deshmukh
                      </h3>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        MBBS, MD (Dermatology, Venereology & Leprosy)
                      </div>
                      <div className="text-[11px] text-teal-700 font-semibold mt-1">
                        9+ Yrs Experience • Life Member IADVL
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Specializes in clinical dermatology, acne scar remodeling, medical skin rejuvenation, and non-invasive aesthetic procedures. Focuses on conservative, evidence-based dermatological therapies without aggressive over-treatment.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Council Registration</div>
                      <div className="font-mono font-bold text-slate-800 text-[11px]">MMC-2015-8832</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Consultation Fee</div>
                      <div className="font-bold text-teal-900">₹1,200 <span className="text-[10px] text-slate-500 font-normal">(Incl. Dermoscopy)</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>In Clinic Today (Afternoon Shift)</span>
                  </span>
                  <DoctorSelectButton doctorSnippet="Rohan" label="Select Dr. Rohan" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. SELECTED TREATMENTS & PROCEDURES WITH TRANSPARENT FEES    */}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                  Transparent Clinical Menu
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Popular Treatments & Transparent Fees
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-xl">
                  Fixed pricing, documented procedure protocols, and itemized billing. No surprise hidden charges.
                </p>
              </div>
              <Link
                href="/services"
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 border border-teal-200 bg-teal-50/60 px-3.5 py-2 rounded-lg transition"
              >
                <span>View Full 12-Procedure Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Root Canal */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded uppercase">
                      Endodontics
                    </span>
                    <span className="text-xs text-slate-500 font-medium">45-60 mins</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                    Single-Sitting Rotary Root Canal (RCT)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Painless computerized apex locator measurement, motorized rotary file cleaning, and 3D biocompatible obturation.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Procedure Fee</div>
                    <div className="text-base font-extrabold text-slate-900">₹5,500</div>
                  </div>
                  <a
                    href="#booking-section"
                    className="text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Book Slot
                  </a>
                </div>
              </div>

              {/* Card 2: Clear Aligners with Photo */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div className="h-32 overflow-hidden">
                  <img
                    src="/images/treatment-invisalign.jpg"
                    alt="Invisible Clear Aligners"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded uppercase">
                        Orthodontics
                      </span>
                      <span className="text-xs text-slate-500 font-medium">30 mins</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                      Invisible Clear Aligners Workup
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      3D digital intraoral scan, personalized smile simulation, and comprehensive orthodontic treatment roadmap.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">3D Scan & Plan</div>
                      <div className="text-base font-extrabold text-slate-900">₹3,500</div>
                    </div>
                    <a
                      href="#booking-section"
                      className="text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Book Slot
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 3: HydraFacial with Photo */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <div className="h-32 overflow-hidden">
                  <img
                    src="/images/treatment-dermatology.jpg"
                    alt="Medical HydraFacial Rejuvenation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded uppercase">
                        Aesthetics
                      </span>
                      <span className="text-xs text-slate-500 font-medium">45 mins</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                      HydraFacial Skin Rejuvenation
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Medical-grade vacuum pore exfoliation, painless blackhead extraction, and antioxidant hyaluronic infusion.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Complete Session</div>
                      <div className="text-base font-extrabold text-slate-900">₹4,500</div>
                    </div>
                    <a
                      href="#booking-section"
                      className="text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      Book Slot
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 4: Ultrasonic Scaling */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded uppercase">
                      Preventive
                    </span>
                    <span className="text-xs text-slate-500 font-medium">30 mins</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                    Ultrasonic Deep Scaling & Air Polishing
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Piezoelectric plaque and calculus removal, tea/coffee stain elimination, and enamel fluoride strengthening.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Standard Clean</div>
                    <div className="text-base font-extrabold text-slate-900">₹1,800</div>
                  </div>
                  <a
                    href="#booking-section"
                    className="text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Book Slot
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. DEDICATED APPOINTMENT BOOKING SUITE (Executive Full-Width) */}
        {/* ------------------------------------------------------------- */}
        <section id="booking-section" className="py-16 sm:py-24 bg-gradient-to-b from-slate-100 via-slate-50 to-white scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                Live Doctor Schedule & Reservation
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                Schedule Your Visit in Under 60 Seconds
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
                Real-time appointment slot calculation. Your consultation is reserved directly in our clinical floor system with an instant booking SMS & WhatsApp reference.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Zero Double-Booking Guarantee</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>4-Hour Flexible Rescheduling</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Pay at Clinic or via UPI</span>
                </span>
              </div>
            </div>

            {/* The Booking Widget */}
            <BookingWidget
              clinicId={clinic.id}
              clinicName={clinic.name}
              doctors={doctorOptions}
              services={serviceOptions}
            />
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 6. AUTHENTIC PATIENT STORIES (Pune & Mumbai Context)          */}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 sm:py-20 bg-white border-t border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                Verified Patient Experiences
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trusted by Families and Professionals Across Pune
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;Dr. Ananya completed my root canal in a single 45-minute sitting. I felt zero pain, and the dental microscope display showed every step. The clinic feels like a private lounge, not a stressful dental clinic.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Aditya Kulkarni</div>
                    <div className="text-[10px] text-slate-500">VP Engineering • Koregaon Park, Pune</div>
                  </div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">Verified Patient</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;The sterilization protocol here is unmatched. They opened the heat-sealed autoclave pouch right in front of me with the color-change indicator. Highly recommend for families who prioritize safety.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Dr. Meera Shinde</div>
                    <div className="text-[10px] text-slate-500">Associate Professor • Fergusson College Road</div>
                  </div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">Verified Patient</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;Consulted Dr. Rohan for adult acne. Very straightforward diagnosis without pushing unnecessary expensive treatments. After two months of following his prescription and chemical peel plan, my skin is completely clear.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Siddharth Paranjape</div>
                    <div className="text-[10px] text-slate-500">Product Designer • Baner, Pune</div>
                  </div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">Verified Patient</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 7. CLINIC TIMINGS, DIRECTIONS & ACCESSIBILITY                 */}
        {/* ------------------------------------------------------------- */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                Verified Pune Locations & Directions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Visit Apex Dental & Aesthetic Lounge
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Centrally located with dual clinic access in Central Pune (Somwar Peth) and West Pune (Baner-Pashan). Ground floor step-free wheelchair accessibility and reserved patient parking.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: 2 Real Clinic Branches with Details & Action Links */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Branch 1: Somwar Peth Flagship */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <div className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                          Flagship Operatory & Clinical Suite
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-950">
                          Central Pune Lounge — Somwar Peth
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                          Shop 12-14, Ground Floor, Royal Heritage Complex, Somwar Peth, Pune 411011
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <strong>Landmark:</strong> Near KEM Hospital & Pune Railway Station (Step-free ground floor entry)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900">Consultation Timings:</span> Mon-Sat 9:00 AM – 8:30 PM | Sun 10:00 AM – 2:00 PM
                    </div>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open in Google Maps ↗</span>
                    </a>
                  </div>
                </div>

                {/* Branch 2: Baner-Pashan West Pune Lounge */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <div className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                          West Pune Consultation Lounge
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-950">
                          West Pune Lounge — Baner-Pashan Link Road
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                          Baner-Pashan Link Road, Baner, Pune, Maharashtra 411045
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          <strong>Landmark:</strong> Near Symbiosis International University Road & Aundh-Baner Corridor
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900">Appointments:</span> Prior appointment & scheduled procedures
                    </div>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Baner-Pashan+Link+Road+Baner+Pune+411045"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open Baner in Google Maps ↗</span>
                    </a>
                  </div>
                </div>

                {/* Telephone & Emergency Strip */}
                <div className="p-4 bg-teal-50 border border-teal-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-teal-700 shrink-0" />
                    <div>
                      <div className="font-bold text-teal-950">Central Reception Desk Telephones</div>
                      <div className="text-teal-800 mt-0.5 font-medium">
                        {clinic.primaryPhone} {clinic.secondaryPhone && `• ${clinic.secondaryPhone}`}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${clinic.primaryPhone.replace(/[^0-9+]/g, "")}`}
                    className="bg-white hover:bg-slate-50 text-teal-900 font-bold px-3.5 py-2 rounded-xl border border-teal-300 shadow-2xs transition"
                  >
                    Call Front Desk Now
                  </a>
                </div>
              </div>

              {/* Right Column: Live Interactive Google Maps Embed */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
                  <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <MapPin className="w-4 h-4 text-teal-400" />
                      <span>Interactive Pune GPS Map</span>
                    </div>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded font-mono">
                      Live GPS
                    </span>
                  </div>
                  <div className="relative w-full h-[320px] bg-slate-100">
                    <iframe
                      title="Apex Clinic Somwar Peth Pune Location Map"
                      src="https://maps.google.com/maps?q=Royal+Heritage+Complex+Somwar+Peth+Pune+411011&t=&z=15&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Royal Heritage Complex, Somwar Peth</span>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-700 hover:text-teal-900 font-bold underline flex items-center gap-1"
                    >
                      <span>Direct GPS Navigation</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Accessibility Note */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Patient Accessibility & Parking</span>
                  </div>
                  <p>
                    Dedicated visitor car and two-wheeler parking inside Royal Heritage Complex. Step-free wheelchair entrance directly into reception lounge and operatory chairs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MobileStickyBottomBar phone={clinic.primaryPhone} />

      <PublicFooter
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        email={clinic.email}
        address={clinic.address || ""}
        city={clinic.city}
      />
    </div>
  );
}
