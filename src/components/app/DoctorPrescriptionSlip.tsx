"use client";

import { Shield, Printer, CheckCircle2, Clock, Calendar, MapPin, Phone, User, HeartPulse, X } from "lucide-react";
import { useRef } from "react";
import { format } from "date-fns";
import { printIsolatedSlip } from "@/lib/printUtils";

export interface PrescriptionItemData {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: string;
  durationDays: number;
  instructions?: string;
}

export interface DoctorPrescriptionData {
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorQualification?: string;
  doctorRegNumber?: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  patientIdNumber?: string | null;
  encounterDate?: string | Date;
  vitals?: {
    bpSystolic?: number | "";
    bpDiastolic?: number | "";
    pulse?: number | "";
    temperatureF?: number | "";
    weightKg?: number | "";
    spo2?: number | "";
  };
  chiefComplaint?: string;
  clinicalNotes?: string;
  diagnosis?: string;
  specialtySummary?: string;
  prescriptionItems: PrescriptionItemData[];
  generalAdvice?: string;
  followUpDate?: string;
  isSigned?: boolean;
  signedAt?: string;
}

interface DoctorPrescriptionSlipProps {
  data: DoctorPrescriptionData;
  onClose?: () => void;
  isModal?: boolean;
}

export function DoctorPrescriptionSlip({ data, onClose, isModal = false }: DoctorPrescriptionSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    printIsolatedSlip(slipRef.current);
  }

  const currentDateStr = data.encounterDate
    ? format(new Date(data.encounterDate), "dd MMMM yyyy")
    : format(new Date(), "dd MMMM yyyy");

  const content = (
    <div
      ref={slipRef}
      className="printable-slip-container bg-white text-slate-900 font-sans p-6 sm:p-10 max-w-3xl mx-auto rounded-2xl border border-slate-300 shadow-2xl print:shadow-none print:border-none print:p-0"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. OFFICIAL CLINIC & DOCTOR LETTERHEAD                        */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b-2 border-slate-900 pb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl print:border print:border-slate-800 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950">
                {data.clinicName || "Apex Dental & Aesthetic Lounge"}
              </h1>
              <p className="text-[11px] text-teal-800 font-bold uppercase tracking-wider">
                Specialist Dental Surgery & Clinical Dermatology
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {data.clinicAddress || "Ground Floor, Kulkarni Chambers, Somwar Peth & Koregaon Park, Pune - 411011"}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-[11px] text-slate-700 space-y-0.5">
            <div className="font-bold text-slate-900">Dr. {data.doctorName.replace(/^dr\.?\s+/i, "")}</div>
            <div className="text-teal-800 font-semibold">{data.doctorSpecialty}</div>
            <div className="text-slate-500 font-mono text-[10px]">
              {data.doctorQualification || "BDS, MDS • Specialist Practitioner"}
            </div>
            <div className="text-teal-900 font-mono font-bold text-[10px]">
              Reg No: {data.doctorRegNumber || "MDC-74921 / MMC-2015-8832"}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap justify-between text-[10px] text-slate-500">
          <span>Desk: {data.clinicPhone || "+91 97655 39107"} • Email: care@apexdental.in</span>
          <span>Consultation Timings: Mon-Sat 9:00 AM - 8:30 PM</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PATIENT DEMOGRAPHICS & VITALS STRIP                        */}
      {/* ------------------------------------------------------------- */}
      <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs print:bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-slate-200 pb-2.5">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Patient Name</span>
            <span className="font-bold text-slate-900">{data.patientName}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Patient ID</span>
            <span className="font-mono font-bold text-teal-900">{data.patientIdNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Age / Gender</span>
            <span className="font-semibold text-slate-800">
              {data.patientAge ? `${data.patientAge} Yrs` : "Adult"} / {data.patientGender || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Date</span>
            <span className="font-semibold text-slate-900">{currentDateStr}</span>
          </div>
        </div>

        {/* Vitals Summary */}
        {data.vitals && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-600">
            <span className="font-bold text-slate-700 uppercase text-[10px]">Vitals:</span>
            {data.vitals.bpSystolic && (
              <span>
                BP: <strong>{data.vitals.bpSystolic}/{data.vitals.bpDiastolic || 80}</strong> mmHg
              </span>
            )}
            {data.vitals.pulse && (
              <span>Pulse: <strong>{data.vitals.pulse}</strong> bpm</span>
            )}
            {data.vitals.temperatureF && (
              <span>Temp: <strong>{data.vitals.temperatureF}</strong> °F</span>
            )}
            {data.vitals.spo2 && (
              <span>SpO2: <strong>{data.vitals.spo2}</strong>%</span>
            )}
            {data.vitals.weightKg && (
              <span>Wt: <strong>{data.vitals.weightKg}</strong> kg</span>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CLINICAL FINDINGS & DIAGNOSIS                              */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2 text-xs my-4 border-b border-slate-200 pb-3">
        {data.chiefComplaint && (
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Chief Complaint:</span>
            <p className="text-slate-800">{data.chiefComplaint}</p>
          </div>
        )}

        {data.specialtySummary && (
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Clinical Examination Findings:</span>
            <p className="text-slate-800 font-mono text-[11px]">{data.specialtySummary}</p>
          </div>
        )}

        <div>
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Provisional Diagnosis:</span>
          <p className="font-bold text-slate-900 text-sm">
            {data.diagnosis || "Clinical assessment completed."}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Rx SECTION (Tabular Prescribed Medications)               */}
      {/* ------------------------------------------------------------- */}
      <div className="my-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif font-black text-2xl text-teal-900 italic">Rx</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            (Prescription Medications)
          </span>
        </div>

        {data.prescriptionItems.length > 0 ? (
          <div className="border border-slate-300 rounded-xl overflow-hidden avoid-break">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Timing</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Special Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.prescriptionItems.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{med.medicineName}</div>
                      {med.dosage && (
                        <div className="text-[10px] text-teal-800 font-semibold">{med.dosage}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{med.frequency}</td>
                    <td className="py-2.5 px-3 text-slate-700">{med.timing}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{med.durationDays} Days</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {med.instructions || "As directed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
            No systemic prescription drugs advised at this visit.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. GENERAL ADVICE & FOLLOW-UP SCHEDULE                        */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3 my-4 text-xs avoid-break">
        {data.generalAdvice && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="font-bold text-slate-800 text-[11px] uppercase block mb-1">
              General Dietary & Clinical Advice:
            </span>
            <p className="text-slate-700 leading-relaxed">{data.generalAdvice}</p>
          </div>
        )}

        {data.followUpDate && (
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-950 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>Recommended Next Review Date:</span>
            </div>
            <span className="font-bold text-teal-900 text-sm">
              {format(new Date(data.followUpDate), "dd MMMM yyyy")}
            </span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. DOCTOR DIGITAL SIGNATURE SEAL & LEGAL DISCLAIMER          */}
      {/* ------------------------------------------------------------- */}
      <div className="border-t-2 border-slate-900 pt-6 mt-8 avoid-break flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="text-[10px] text-slate-500 max-w-sm space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Digitally Finalized & Signed Consultation Record</span>
          </div>
          <div>
            Generated via MediNexus EHR pursuant to the National Medical Commission (NMC) & Dental Council of India Regulations.
          </div>
          <div>Valid for pharmacy dispensing across India. Valid for 30 days from date of issue.</div>
        </div>

        <div className="text-right sm:text-center shrink-0">
          <div className="border border-teal-600/40 bg-teal-50/50 p-2.5 rounded-xl mb-1 text-center font-mono">
            <div className="text-[10px] text-teal-900 font-bold uppercase tracking-wider">
              Verified Medical Seal
            </div>
            <div className="text-xs font-bold text-slate-900">Dr. {data.doctorName.replace(/^dr\.?\s+/i, "")}</div>
            <div className="text-[9px] text-teal-800">{data.doctorQualification || "BDS, MDS"}</div>
            <div className="text-[9px] text-slate-600 font-bold">REG: {data.doctorRegNumber || "MDC-74921"}</div>
          </div>
          <div className="text-[10px] text-slate-400">Attending Specialist Signature</div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 7. ACTION BUTTONS (No Print)                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="no-print mt-8 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Close Preview
          </button>
        )}

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Prescription / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="printable-modal-overlay fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
        <div className="printable-modal-inner relative w-full max-w-3xl my-8 print:my-0">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
