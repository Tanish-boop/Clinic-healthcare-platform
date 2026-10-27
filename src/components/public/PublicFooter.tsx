import Link from "next/link";
import { Shield, Phone, Mail, MapPin, Clock } from "lucide-react";

interface PublicFooterProps {
  clinicName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  slug?: string;
}

export function PublicFooter({
  clinicName = "Apex Dental & Aesthetic Lounge",
  phone = "+91 91408 92818",
  email = "care@apexdental.in",
  address = "Royal Heritage Complex, Somwar Peth, Pune 411011",
  city = "Pune",
  slug,
}: PublicFooterProps) {
  const basePath = slug ? `/c/${slug}` : "";

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Clinic Brand & Reg */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">{clinicName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ethical, modern, evidence-based healthcare. Registered with the Maharashtra State Medical & Dental Councils. Committed to strict clinical sterilization standards.
            </p>
            <div className="pt-2 text-xs text-teal-400 font-mono">
              Medical Reg: MSDC-2014/08 • MMC-2016/04/1824
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Patient Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href={`${basePath}/about`} className="hover:text-teal-400 transition">
                  About Doctors & Qualifications
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/services`} className="hover:text-teal-400 transition">
                  Treatments & Fee Schedule
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/book`} className="hover:text-teal-400 transition">
                  Book an Appointment Online
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/contact`} className="hover:text-teal-400 transition">
                  Clinic Timings & Map Directions
                </Link>
              </li>
              <li>
                <Link href={`${basePath}/policies`} className="hover:text-teal-400 transition">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition">
                  Patient & Staff Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Timings */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Clinic Hours</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Monday - Friday:</span>
                <span className="text-white font-medium">9:00 AM - 8:30 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Saturday:</span>
                <span className="text-white font-medium">9:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Sunday:</span>
                <span className="text-teal-400 font-medium">10:00 AM - 2:00 PM</span>
              </li>
              <li className="pt-1 text-slate-500">
                Lunch Break: 1:30 PM - 2:30 PM (Mon-Sat)
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Pune Lounges & Maps</h4>
            <div className="space-y-3.5 text-xs">
              <div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-slate-300 hover:text-white group"
                >
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-white">Central Pune Flagship:</div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      Shop 12-14, Royal Heritage Complex, Somwar Peth, Pune 411011
                    </div>
                    <div className="text-[10px] text-teal-400 underline mt-0.5">
                      Open in Google Maps ↗
                    </div>
                  </div>
                </a>
              </div>

              <div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Baner-Pashan+Link+Road+Baner+Pune+411045"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-slate-300 hover:text-white group"
                >
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-white">West Pune Lounge:</div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      Baner-Pashan Link Road, Baner, Pune 411045
                    </div>
                    <div className="text-[10px] text-teal-400 underline mt-0.5">
                      Open Baner in Google Maps ↗
                    </div>
                  </div>
                </a>
              </div>

              <div className="pt-1 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white">
                    {phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white">
                    {email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
          <p className="mb-4">
            <strong className="text-slate-300">Clinical Disclaimer:</strong> The clinical information published on this website is for general educational and appointment scheduling purposes. It does not constitute medical advice or establish a definitive diagnosis until an in-person or authorized teleconsultation is conducted by a registered medical practitioner. In case of acute medical emergencies, please visit the nearest hospital emergency department immediately.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 pt-2">
            <div>
              © {new Date().getFullYear()} {clinicName}. All rights reserved. Powered by MediNexus Healthcare OS.
            </div>
            <div className="flex gap-4">
              <Link href={`${basePath}/policies`} className="hover:underline">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href={`${basePath}/policies`} className="hover:underline">
                Terms of Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
