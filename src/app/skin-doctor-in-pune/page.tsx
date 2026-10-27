import { getFlagshipClinic } from "@/lib/clinicData";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BookingWidget } from "@/components/public/BookingWidget";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Phone,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Skin Doctor in Pune | Dermatologist & Laser Aesthetics | Apex Lounge",
  description:
    "Consult top dermatologist in Pune. Dr. Rohan Deshmukh (MBBS, MD Dermatology) specializes in HydraFacial, laser acne scar removal, chemical peels, and anti-aging treatments in Somwar Peth & Baner.",
  keywords: [
    "skin doctor in pune",
    "best dermatologist in pune",
    "skin specialist pune",
    "hydrafacial pune",
    "acne scar treatment pune",
    "laser skin clinic pune",
    "dr rohan deshmukh dermatologist",
  ],
};

export const dynamic = "force-dynamic";

export default async function SkinDoctorInPunePage() {
  const clinic = await getFlagshipClinic();

  const skinServices = clinic.services.filter(
    (s: any) => s.category === "Aesthetics" || s.category === "Consultation"
  );

  const faqs = [
    {
      q: "Who is the best skin specialist / dermatologist in Pune at Apex?",
      a: "Our aesthetic dermatology department is led by Dr. Rohan Deshmukh (MBBS, MD Dermatology), registered with Maharashtra Medical Council (MMC-2015-08-3921). He has over 9 years of clinical expertise treating acne, hyperpigmentation, melasma, and laser aesthetics.",
    },
    {
      q: "How much does a HydraFacial or medical facial cost in Pune?",
      a: "Our authentic 7-step Medical HydraFacial is priced at ₹2,500. It includes deep vacuum vortex pore extraction, salicylic peel, hyaluronic acid infusion, and LED phototherapy.",
    },
    {
      q: "Are laser treatments safe for Indian / darker skin tones?",
      a: "Yes. We strictly utilize US-FDA cleared Q-Switched Nd:YAG lasers and long-pulse diode wavelengths specifically calibrated for Fitzpatrick skin phototypes IV and V (common across Indian skin), ensuring zero risk of paradoxical post-inflammatory hyperpigmentation.",
    },
    {
      q: "How do I schedule a same-day skin consultation in Pune?",
      a: "You can reserve a direct 30-minute OPD slot on this page or message our clinic coordinator via WhatsApp for emergency rashes, acute allergies, or fast-track consultations.",
    },
  ];

  // FAQ Schema JSON-LD for Google Rich Results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || "Somwar Peth & Baner"}
        city={clinic.city}
      />

      <main className="flex-1">
        {/* HERO BANNER */}
        <section className="bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 text-white py-12 lg:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/70 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                <span>US-FDA Approved Laser Technology • Medical Grade Aesthetics</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Top Skin Doctor & Aesthetic Dermatologist in <span className="text-rose-400">Pune</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Led by <strong>Dr. Rohan Deshmukh (MBBS, MD Dermatology)</strong>. Advanced treatments for active acne, stubborn acne scars, pigmentation, medical HydraFacials, and anti-aging in Somwar Peth & Baner, Pune.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#book-appointment"
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg transition"
                >
                  Book Skin Consultation Slot
                </a>
                <a
                  href={`https://wa.me/${((clinic as any).whatsappNumber || clinic.primaryPhone || "919823045678").replace(/\D/g, "")}?text=${encodeURIComponent(
                    "Hello Apex Clinic Pune, I would like to consult with Dr. Rohan for skin/hair treatment."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  Chat with Skin Desk
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CLINICAL METRICS */}
        <section className="py-8 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-rose-900">9+ Yrs</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Clinical Dermatology</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-rose-900">6,500+</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Satisfied Patients</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-rose-900">US-FDA</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Gold Standard Devices</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-rose-900">MMC-2015</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Maha Medical Council Reg</p>
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR AESTHETIC PROCEDURES & FEES */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">
                Aesthetic Menu
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Dermatology & Skin Treatment Fees in Pune
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                All procedures include computer-assisted dermatoscope analysis and customized medical-grade aftercare protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skinServices.map((service: any) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      {service.category}
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {service.durationMinutes} mins
                    </span>
                    <a
                      href="#book-appointment"
                      className="text-rose-700 font-bold hover:underline"
                    >
                      Book Session →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOOKING WIDGET */}
        <section id="book-appointment" className="py-12 bg-white border-t border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">
                Direct Appointment Booking
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Book Skin Consultation in Pune
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose your preferred date and slot to consult with Dr. Rohan Deshmukh.
              </p>
            </div>
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg">
              <BookingWidget
                clinicId={clinic.id}
                clinicName={clinic.name}
                doctors={clinic.doctors.map((d: any) => ({
                  id: d.id,
                  name: d.user.fullName,
                  specialty: d.specialty,
                  qualification: d.qualification,
                  consultationFee: d.consultationFee,
                  avatarUrl: d.user.avatarUrl,
                }))}
                services={clinic.services.map((s: any) => ({
                  id: s.id,
                  name: s.name,
                  durationMinutes: s.durationMinutes,
                  price: s.price,
                  category: s.category,
                }))}
              />
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">
                Patient Questions
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Frequently Asked Skin Care Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter clinicName={clinic.name} phone={clinic.primaryPhone} />
    </div>
  );
}
