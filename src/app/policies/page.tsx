import { getFlagshipClinic } from "@/lib/clinicData";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Shield, Clock, FileText, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const clinic = await getFlagshipClinic();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicNavbar
        clinicName={clinic.name}
        phone={clinic.primaryPhone}
        area={clinic.area || ""}
        city={clinic.city}
      />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">
              Governance & Patient Rights
            </span>
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Clinic Policies & Patient Terms
            </h1>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Our clinical policies are formulated to protect patient safety, ensure fair scheduling, and maintain strict confidential handling of medical information.
            </p>
          </div>

          <div className="space-y-6">
            {/* Policy 1: Appointment Cancellation & Rescheduling */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
                <Clock className="w-5 h-5" />
                <h2>1. Appointment Booking & Cancellation Policy</h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                <p>
                  To respect the time of all patients and our medical specialists, we request a minimum of <strong>{(clinic as any).cancellationNoticeHours || 4} hours advance notice</strong> if you need to reschedule or cancel your confirmed appointment.
                </p>
                <p>
                  Appointments may be rescheduled directly through your online patient portal or by calling the clinic front desk. Repeated unnotified no-shows (more than two consecutive appointments) may require a phone verification before subsequent bookings are accepted.
                </p>
              </div>
            </div>

            {/* Policy 2: Patient Health Information & Privacy */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
                <Lock className="w-5 h-5" />
                <h2>2. Confidentiality & Medical Records Privacy</h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                <p>
                  All patient demographic information, medical histories, digital radiovisiographs (RVG), intraoral photographs, and clinical notes are protected under strict doctor-patient confidentiality adhering to Indian Medical Council and Digital Personal Data Protection standards.
                </p>
                <p>
                  Your clinical records will never be sold, leased, or disclosed to third-party commercial marketing agencies. Authorized clinical records are accessible exclusively by your attending doctor and yourself via the encrypted Patient Portal.
                </p>
              </div>
            </div>

            {/* Policy 3: Fees, Payments & Refunds */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
                <FileText className="w-5 h-5" />
                <h2>3. Transparent Fees & Refund Guidelines</h2>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Treatment plans and procedure estimates are provided in writing prior to commencing non-emergency procedures. Payments may be made via Cash, UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or direct Bank Transfer. Official GST/clinic tax invoices and digital receipts are generated for all transactions.
                </p>
                <p>
                  In the rare event that an advance payment was received for a lab-fabricated prosthetic (e.g., custom crown) that could not be delivered due to verified medical reasons prior to lab fabrication, unexpended amounts will be refunded to the original payment channel within 5-7 business days with written authorization from the Clinic Director.
                </p>
              </div>
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
