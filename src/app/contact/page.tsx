import { db } from "@/lib/db";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { MapPin, Phone, Mail, Clock, Car, AlertTriangle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const clinic = await db.clinic.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!clinic) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || ""}
        city={clinic.city}
      />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Location & Hours
            </span>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Contact & Directions
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              We are conveniently situated in {clinic.area}, {clinic.city}. Reach out to our front desk for appointment queries or urgent walk-in scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Contact details */}
            <div className="space-y-6">
              {/* Flagship: Somwar Peth */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
                <div className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  Flagship Operatory & Lounge
                </div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>Central Pune Lounge — Somwar Peth</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Shop 12-14, Ground Floor, Royal Heritage Complex, Somwar Peth, Pune, Maharashtra 411011
                </p>
                <p className="text-xs text-slate-500">
                  <strong>Landmark:</strong> Near KEM Hospital & Pune Railway Station (Step-free ground floor access)
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 underline"
                  >
                    Open Somwar Peth on Google Maps / Navigation App ↗
                  </a>
                </div>
              </div>

              {/* West Pune: Baner */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
                <div className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                  West Pune Consultation Suite
                </div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>West Pune Lounge — Baner-Pashan</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Baner-Pashan Link Road, Baner, Pune, Maharashtra 411045
                </p>
                <p className="text-xs text-slate-500">
                  <strong>Landmark:</strong> Near Symbiosis International University Road & Aundh-Baner Corridor
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Baner-Pashan+Link+Road+Baner+Pune+411045"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 underline"
                  >
                    Open Baner on Google Maps / Navigation App ↗
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <span>Front Desk Telephones</span>
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-500">Primary Reception Desk:</span>
                    <a href={`tel:${clinic.primaryPhone}`} className="font-bold text-teal-700">
                      {clinic.primaryPhone}
                    </a>
                  </div>
                  {clinic.secondaryPhone && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Alternate Helpline:</span>
                      <a href={`tel:${clinic.secondaryPhone}`} className="font-bold text-teal-700">
                        {clinic.secondaryPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Official Clinical Email:</span>
                    <a href={`mailto:${clinic.email}`} className="font-medium text-slate-800">
                      {clinic.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-600" />
                  <span>Parking & Accessibility</span>
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>Dedicated patient car and two-wheeler parking available inside the building compound.</li>
                  <li>Ground floor clinic entrance with ramp accessibility for wheelchairs and senior citizens.</li>
                </ul>
              </div>
            </div>

            {/* Timings & Emergency Guidance */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>Operating Timetable</span>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-medium">Monday to Friday</span>
                    <span className="font-bold text-slate-900">09:00 AM – 08:30 PM</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-medium">Saturday</span>
                    <span className="font-bold text-slate-900">09:00 AM – 08:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-medium">Sunday</span>
                    <span className="font-bold text-teal-800">10:00 AM – 02:00 PM</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 text-[11px] text-slate-500">
                    Daily Sterilization & Lunch Break: <strong>1:30 PM to 2:30 PM</strong> (Emergency walk-ins accepted with prior phone intimation).
                  </div>
                </div>
              </div>

              {/* Emergency Protocol Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Emergency Protocol</span>
                </div>
                <h4 className="text-sm font-bold">In Case of Acute Trauma or Medical Emergency</h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  For traumatic dental injuries (avulsed tooth), acute facial swelling causing airway compromise, severe allergic anaphylaxis, or systemic distress, call our emergency front desk immediately at <strong>{clinic.primaryPhone}</strong> or visit your nearest tertiary hospital emergency department without delay.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Map & Directions */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Interactive Pune Map — Somwar Peth & Central Pune</span>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-white underline font-semibold text-xs"
              >
                Open in Full Google Maps App ↗
              </a>
            </div>
            <div className="relative w-full h-[360px] bg-slate-100">
              <iframe
                title="Apex Clinic Location Map Pune"
                src="https://maps.google.com/maps?q=Royal+Heritage+Complex+Somwar+Peth+Pune+411011&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
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
