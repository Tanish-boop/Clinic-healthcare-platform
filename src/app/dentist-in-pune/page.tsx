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
  Award,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Dentist in Pune | Painless Root Canal & Dental Implants | Apex Lounge",
  description:
    "Looking for the top dentist in Pune? Apex Dental Lounge offers painless Zeiss microscope root canals, Invisalign clear aligners, and dental implants in Somwar Peth & Baner. Book OPD appointment online.",
  keywords: [
    "best dentist in pune",
    "dental clinic in pune",
    "root canal treatment pune",
    "dental implants pune",
    "invisalign pune",
    "dentist near me pune",
    "dr ananya kulkarni dentist",
  ],
};

export const dynamic = "force-dynamic";

export default async function DentistInPunePage() {
  const clinic = await getFlagshipClinic();

  const dentalDoctor = clinic.doctors[0];
  const dentalServices = clinic.services.filter(
    (s: any) => s.category === "Dental" || s.category === "Consultation"
  );

  const faqs = [
    {
      q: "How much does a Root Canal Treatment (RCT) cost in Pune?",
      a: "At Apex Dental Lounge Pune, rotary endodontic root canal treatments range between ₹3,500 and ₹6,000 depending on tooth complexity (anterior vs. molar) and whether crown capping (Zirconia or PFM) is required.",
    },
    {
      q: "Is root canal treatment painful?",
      a: "No. With computerized local anesthesia and rotary nickel-titanium instrumentation, 98% of patients report the procedure is completely painless and completed in 1 to 2 sessions.",
    },
    {
      q: "Where is the clinic located in Pune?",
      a: "Our central flagship lounge is in Somwar Peth (near KEM Hospital and Pune Railway Station) with dedicated ground-floor wheelchair access. We also operate our consultation wing in Baner on Baner-Pashan Link Road.",
    },
    {
      q: "How do I book an emergency dental appointment in Pune?",
      a: "You can book instantly online using the real-time slot picker on this page or tap the green WhatsApp button to connect directly with our front desk triage team.",
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
        <section className="bg-gradient-to-b from-teal-900 via-teal-950 to-slate-900 text-white py-12 lg:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600/50 text-teal-200 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Rated 4.9/5 by 320+ Pune Patients • ISO Certified Sterilization</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Best Dental Clinic & Root Canal Specialists in <span className="text-teal-300">Pune</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Led by <strong>Dr. Ananya Kulkarni (BDS, MDS Prosthodontics)</strong>. Painless microscope-assisted dentistry, titanium dental implants, and clear aligners in Somwar Peth and Baner, Pune.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#book-appointment"
                  className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition"
                >
                  Book Priority OPD Slot
                </a>
                <a
                  href={`https://wa.me/${((clinic as any).whatsappNumber || clinic.primaryPhone || "919823045678").replace(/\D/g, "")}?text=${encodeURIComponent(
                    "Hello Apex Dental Pune, I would like to consult with Dr. Ananya for dental treatment."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST SIGNALS & CREDENTIALS */}
        <section className="py-8 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-teal-900">12+ Yrs</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Clinical Practice</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-teal-900">4,200+</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Painless RCTs Performed</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-teal-900">100%</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Autoclave Sterilization</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-teal-900">MDC-74921</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Maha Dental Council Reg</p>
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR DENTAL PROCEDURES & ESTIMATED PRICES IN PUNE */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">
                Transparent Pricing
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Dental Treatment Fees in Pune
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                No hidden costs. All procedure charges include digital diagnosis, digital x-ray, and post-procedure checkup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dentalServices.map((service: any) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
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
                      className="text-teal-700 font-bold hover:underline"
                    >
                      Book Procedure →
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
              <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">
                Online OPD Reservation
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Book Dental Appointment in Pune
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your convenient date and 30-minute consultation slot.
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

        {/* FREQUENTLY ASKED QUESTIONS (GOOGLE FAQ SCHEMA) */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">
                Patient Inquiries
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Frequently Asked Dental Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                >
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
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
