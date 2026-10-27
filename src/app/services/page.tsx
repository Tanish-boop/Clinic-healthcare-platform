import { db } from "@/lib/db";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Clock, CheckCircle2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const clinic = await db.clinic.findFirst({
    where: { status: "ACTIVE" },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!clinic) return null;

  // Group services by category
  const categories: Record<string, typeof clinic.services> = {};
  for (const s of clinic.services) {
    if (!categories[s.category]) {
      categories[s.category] = [];
    }
    categories[s.category].push(s);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || ""}
        city={clinic.city}
      />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Standard Fee Schedule
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Clinical Services & Transparent Pricing
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              We publish standard fees for all core consultations and procedures so our patients know exactly what to expect. No hidden clinic facility surcharges or surprise billing.
            </p>
          </div>
        </section>

        {/* Categories & Service Cards */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-12">
            {Object.entries(categories).map(([categoryName, servicesList]) => (
              <div key={categoryName} className="space-y-4">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">{categoryName} Services</h2>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded">
                    {servicesList.length} Procedures
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesList.map((svc) => (
                    <div
                      key={svc.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between hover:border-slate-300 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {svc.name}
                          </h3>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-base font-bold text-slate-950 block">
                              {formatCurrency(svc.price)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {svc.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duration: ~{svc.durationMinutes} mins</span>
                        </span>
                        <Link
                          href={`/book?serviceId=${svc.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded transition"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Slot</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Note on complexity */}
            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">Please Note Regarding Clinical Variations:</div>
              <p>
                Fees listed above are standard clinic rates for uncomplicated treatments. In case a tooth has severe root curvatures, multiple previous treatments, or requires bone grafting, your doctor will inform you of the exact revised estimate after radiographic assessment before beginning work.
              </p>
            </div>
          </div>
        </section>
      </main>

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
