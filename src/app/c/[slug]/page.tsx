import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BookingWidget } from "@/components/public/BookingWidget";
import { MobileStickyBottomBar } from "@/components/public/MobileStickyBottomBar";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Award, Clock, Sparkles, CheckCircle, Calendar, ArrowRight, MapPin, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

interface TenantClinicPageProps {
  params: {
    slug: string;
  };
}

export default async function TenantClinicPage({ params }: TenantClinicPageProps) {
  const clinic = await db.clinic.findUnique({
    where: { slug: params.slug },
    include: {
      doctors: {
        where: { isActive: true },
        include: {
          user: { select: { fullName: true } },
        },
      },
      services: {
        where: { isActive: true, isPubliclyBookable: true },
        orderBy: { displayOrder: "asc" },
      },
      operatingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      cmsSections: true,
    },
  });

  if (!clinic) {
    notFound();
  }

  const heroCms = clinic.cmsSections.find((s) => s.sectionKey === "hero");
  const aboutCms = clinic.cmsSections.find((s) => s.sectionKey === "about");

  const doctorOptions = clinic.doctors.map((d) => ({
    id: d.id,
    name: d.user.fullName,
    specialty: d.specialty,
    qualification: d.qualification,
    consultationFee: d.consultationFee,
  }));

  const serviceOptions = clinic.services.map((s) => ({
    id: s.id,
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price,
    category: s.category,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || ""}
        city={clinic.city}
        slug={clinic.slug}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>{clinic.specialty} Practice • {clinic.area ? `${clinic.area}, ` : ""}{clinic.city}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                  {heroCms?.title || `Excellence in ${clinic.specialty} Care`}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  {clinic.description || heroCms?.subtitle}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle flex items-start gap-2.5">
                    <Award className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Verified Specialists</div>
                      <div className="text-[11px] text-slate-500">Registered Practitioners</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Direct Scheduling</div>
                      <div className="text-[11px] text-slate-500">Zero Wait Queues</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-subtle flex items-start gap-2.5 col-span-2 sm:col-span-1">
                    <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Modern Hygiene</div>
                      <div className="text-[11px] text-slate-500">Hospital Sterilization</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#booking-section"
                    className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow transition"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Your Consultation</span>
                  </a>
                </div>
              </div>

              <div id="booking-section" className="lg:col-span-5 scroll-mt-24">
                <BookingWidget
                  clinicId={clinic.id}
                  clinicName={clinic.name}
                  doctors={doctorOptions}
                  services={serviceOptions}
                  basePath={`/c/${clinic.slug}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        {clinic.services.length > 0 && (
          <section className="py-16 bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block mb-1">
                  Procedures & Pricing
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Available Treatments
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {clinic.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mb-2">
                        {svc.category}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2">{svc.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-3">{svc.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-sm">
                        {formatCurrency(svc.price)}
                      </span>
                      <a
                        href="#booking-section"
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline"
                      >
                        Book Slot
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <MobileStickyBottomBar phone={clinic.primaryPhone} />

      <PublicFooter
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        email={clinic.email}
        address={clinic.address || ""}
        city={clinic.city}
        slug={clinic.slug}
      />
    </div>
  );
}
