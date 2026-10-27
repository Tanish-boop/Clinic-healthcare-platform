"use client";

import { Shield, Printer, CheckCircle2, Clock, Calendar, MapPin, Phone, User, X } from "lucide-react";
import { useRef } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { printIsolatedSlip } from "@/lib/printUtils";

export interface AppointmentSlipData {
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  patientIdNumber?: string | null;
  doctorName: string;
  doctorSpecialty?: string | null;
  doctorQualification?: string | null;
  doctorRegNumber?: string | null;
  serviceName?: string | null;
  appointmentDate: string;
  startTime: string;
  endTime?: string | null;
  consultationFee?: number | null;
  type?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
  clinicPhone?: string | null;
  tokenNumber?: string | number | null;
}

interface AppointmentSlipProps {
  data: AppointmentSlipData;
  onClose?: () => void;
  isModal?: boolean;
}

export function AppointmentSlip({ data, onClose, isModal = false }: AppointmentSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    printIsolatedSlip(slipRef.current);
  }

  const aptDateFormatted = format(new Date(data.appointmentDate), "EEEE, dd MMMM yyyy");
  const issueDateFormatted = format(new Date(), "dd MMM yyyy, hh:mm a");

  const content = (
    <div
      ref={slipRef}
      className="printable-slip-container bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-2xl mx-auto rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0"
    >
      {/* ----------------------------------------------------------- */}
      {/* 1. CLINIC OFFICIAL LETTERHEAD HEADER                        */}
      {/* ----------------------------------------------------------- */}
      <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl print:border print:border-slate-800 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950">
              {data.clinicName || "Apex Dental & Aesthetic Lounge"}
            </h1>
            <p className="text-[11px] text-teal-800 font-semibold tracking-wide uppercase">
              Prosthodontics • Micro-Endodontics • Clinical Dermatology
            </p>
            <p className="text-[10px] text-slate-500">
              {data.clinicAddress || "Shop 12-14, Royal Heritage Complex, Somwar Peth & Baner, Pune 411011"}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5">
          <div className="font-bold text-slate-900">Desk: {data.clinicPhone || "+91 91408 92818"}</div>
          <div>Mon - Sat: 9:00 AM - 8:30 PM</div>
          <div className="text-[10px] text-teal-700 font-medium">Class-B Sterile Autoclave Facility</div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. DOCUMENT TITLE & TOKEN BANNER                           */}
      {/* ----------------------------------------------------------- */}
      <div className="my-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap justify-between items-center gap-2 print:bg-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
            Priority Consultation Pass
          </span>
          <div className="text-xs text-slate-500">
            Issued on: {issueDateFormatted}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Reference</span>
            <span className="font-mono text-base font-extrabold text-teal-900 tracking-wider">
              {data.bookingReference}
            </span>
          </div>
          <div className="bg-teal-700 text-white px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider print:border print:border-slate-900">
            {data.tokenNumber ? `TOKEN #${data.tokenNumber}` : "CONFIRMED"}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. PATIENT & SCHEDULE DETAILS GRID                         */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4 my-4">
        {/* Patient Details */}
        <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Patient Demographics
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{data.patientName}</div>
            <div className="text-slate-600 mt-0.5">Contact: {data.patientPhone}</div>
            {(data.patientAge || data.patientGender) && (
              <div className="text-slate-500 text-[11px] mt-0.5">
                {data.patientAge ? `${data.patientAge} Years` : ""}
                {data.patientAge && data.patientGender ? " • " : ""}
                {data.patientGender ? data.patientGender.replace("_", " ") : ""}
              </div>
            )}
            {data.patientIdNumber && (
              <div className="text-[11px] font-mono text-teal-800 font-semibold mt-1">
                Clinic ID: {data.patientIdNumber}
              </div>
            )}
          </div>
        </div>

        {/* Consulting Specialist & Room */}
        <div className="space-y-2 sm:pl-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Consulting Specialist
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">Dr. {data.doctorName}</div>
            <div className="text-teal-800 font-medium text-[11px]">
              {data.doctorSpecialty || "Consultant Specialist"}
            </div>
            {data.doctorQualification && (
              <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                {data.doctorQualification}
              </div>
            )}
            {data.doctorRegNumber && (
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Reg: {data.doctorRegNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. APPOINTMENT TIME & FINANCIAL BREAKDOWN                   */}
      {/* ----------------------------------------------------------- */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-4 text-xs space-y-2.5 print:bg-white">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Scheduled Date:</span>
          <span className="font-bold text-slate-900">{aptDateFormatted}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Reserved Time Window:</span>
          <span className="font-bold text-teal-800">
            {data.startTime} {data.endTime ? `– ${data.endTime}` : ""} (Arrive by 10 mins prior)
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Service / Procedure:</span>
          <span className="font-semibold text-slate-900">
            {data.serviceName || "Clinical Consultation & Examination"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Consultation Mode:</span>
          <span className="font-semibold text-slate-800">
            {data.type === "VIDEO_TELECONSULT" ? "Online Teleconsultation" : "In-Person Clinic Visit"}
          </span>
        </div>

        <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold">
          <span className="text-slate-900">Indicative Consultation Fee:</span>
          <span className="text-teal-900 text-sm">
            {data.consultationFee ? formatCurrency(data.consultationFee) : "₹1,000"}
            <span className="text-[10px] font-normal text-slate-500 ml-1.5">
              (Payable at Front Desk via UPI / Cash)
            </span>
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 5. PATIENT CLINICAL INSTRUCTIONS & POLICIES                 */}
      {/* ----------------------------------------------------------- */}
      <div className="border-t border-slate-200 pt-3 my-4 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
        <div className="font-bold text-slate-800 text-xs">Patient Guidelines:</div>
        <ul className="list-disc pl-4 space-y-0.5">
          <li><strong>Check-In:</strong> Show this reference code ({data.bookingReference}) at reception for instantaneous entry without filling paper forms.</li>
          <li><strong>Directions:</strong> Ground Floor, Royal Heritage Complex, Somwar Peth, Pune (Near KEM Hospital). Search on Google Maps: <a href="https://www.google.com/maps/search/?api=1&query=Royal+Heritage+Complex+Somwar+Peth+Pune+411011" target="_blank" rel="noopener noreferrer" className="text-teal-700 underline font-semibold">Open Maps Navigation</a>.</li>
          <li><strong>Records:</strong> Please carry previous dental/dermatology reports or current medication lists if available.</li>
          <li><strong>Rescheduling:</strong> Free rescheduling up to 4 hours before your slot via our Patient Portal at <code>http://localhost:3001/portal</code>.</li>
        </ul>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 6. AUTHENTICATION & SIGNATURE FOOTER                       */}
      {/* ----------------------------------------------------------- */}
      <div className="border-t-2 border-slate-900 pt-4 mt-6 flex justify-between items-end text-[10px] text-slate-500">
        <div>
          <div>System Generated Clinical Slip • MediNexus OS</div>
          <div>Maharashtra Medical & Dental Council Compliance Standards</div>
        </div>

        <div className="text-center font-mono">
          <div className="h-8 border-b border-dashed border-slate-400 w-36 mb-1" />
          <div className="font-bold text-slate-800">Front Desk Authorization</div>
          <div>Apex Dental Lounge</div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 7. ACTION BUTTONS (Hidden in Print)                         */}
      {/* ----------------------------------------------------------- */}
      <div className="no-print mt-6 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Close
          </button>
        )}

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Appointment Slip / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="printable-modal-overlay fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
        <div className="printable-modal-inner relative w-full max-w-2xl my-8 print:my-0">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
