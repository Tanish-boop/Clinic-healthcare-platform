"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileCheck2,
  Receipt,
  Printer,
  Search,
  AlertCircle,
  CheckCircle2,
  User,
  LogOut,
  ExternalLink,
  ChevronRight,
  Pill,
  Sparkles,
  PhoneCall,
  FileText,
  BadgeCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  Edit3,
  Save,
  MessageCircle,
  Award,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AppointmentSlip } from "@/components/public/AppointmentSlip";
import { DoctorPrescriptionSlip } from "@/components/app/DoctorPrescriptionSlip";
import { InvoiceReceiptSlip, InvoiceReceiptSlipData } from "@/components/public/InvoiceReceiptSlip";

export interface PortalPatient {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  patientIdNumber?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  currentMedications?: string | null;
  notes?: string | null;
}

export interface PortalAppointment {
  id: string;
  bookingReference: string;
  appointmentDate: string | Date;
  startTime: string;
  endTime?: string | null;
  status: string;
  type?: string | null;
  doctorName: string;
  doctorSpecialty?: string | null;
  doctorQualification?: string | null;
  doctorRegNumber?: string | null;
  serviceName?: string | null;
  price?: number | null;
}

export interface PortalPrescription {
  id: string;
  prescriptionDate: string | Date;
  doctorName: string;
  doctorSpecialty?: string | null;
  doctorQualification?: string | null;
  doctorRegNumber?: string | null;
  generalAdvice?: string | null;
  items: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
    durationDays: number;
    instructions?: string;
  }>;
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  payments?: Array<{
    receiptNumber?: string;
    amount: number;
    paymentMethod: string;
    paymentDate?: string | Date;
  }>;
}

interface PatientPortalClientProps {
  initialPatient?: PortalPatient | null;
  initialAppointments?: PortalAppointment[];
  initialPrescriptions?: PortalPrescription[];
  initialInvoices?: PortalInvoice[];
  isAuthenticated?: boolean;
}

export function PatientPortalClient({
  initialPatient = null,
  initialAppointments = [],
  initialPrescriptions = [],
  initialInvoices = [],
  isAuthenticated = false,
}: PatientPortalClientProps) {
  const router = useRouter();

  const [patient, setPatient] = useState<PortalPatient | null>(initialPatient);
  const [appointments, setAppointments] = useState<PortalAppointment[]>(initialAppointments);
  const [prescriptions, setPrescriptions] = useState<PortalPrescription[]>(initialPrescriptions);
  const [invoices, setInvoices] = useState<PortalInvoice[]>(initialInvoices);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "APPOINTMENTS" | "PRESCRIPTIONS" | "INVOICES" | "ACCOUNT" | "DOCTORS"
  >("OVERVIEW");

  // Lookup state (for guest lookups)
  const [lookupQuery, setLookupQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Edit Account state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: patient?.fullName || "",
    age: patient?.age ? String(patient.age) : "",
    gender: patient?.gender || "MALE",
    bloodGroup: patient?.bloodGroup || "O+",
    address: patient?.address || "",
    area: patient?.area || "",
    emergencyContactName: patient?.emergencyContactName || "",
    emergencyContactPhone: patient?.emergencyContactPhone || "",
    allergies: patient?.allergies || "",
    medicalConditions: patient?.medicalConditions || "",
    currentMedications: patient?.currentMedications || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Print Slip Modals
  const [selectedSlipApt, setSelectedSlipApt] = useState<PortalAppointment | null>(null);
  const [selectedSlipRx, setSelectedSlipRx] = useState<PortalPrescription | null>(null);
  const [selectedSlipInv, setSelectedSlipInv] = useState<PortalInvoice | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function handleLookup(e?: React.FormEvent, customQuery?: string) {
    if (e) e.preventDefault();
    const q = (customQuery !== undefined ? customQuery : lookupQuery).trim();
    if (!q) {
      setSearchError("Please enter your Booking Reference (e.g. APT-26-XXXX) or registered phone number");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const res = await fetch("/api/portal/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Record not found");
      }

      setPatient(data.patient);
      setAppointments(data.appointments || []);
      setPrescriptions(data.prescriptions || []);
      setInvoices(data.invoices || []);
      if (customQuery !== undefined) setLookupQuery(customQuery);
      setProfileForm({
        fullName: data.patient?.fullName || "",
        age: data.patient?.age ? String(data.patient.age) : "",
        gender: data.patient?.gender || "MALE",
        bloodGroup: data.patient?.bloodGroup || "O+",
        address: data.patient?.address || "",
        area: data.patient?.area || "",
        emergencyContactName: data.patient?.emergencyContactName || "",
        emergencyContactPhone: data.patient?.emergencyContactPhone || "",
        allergies: data.patient?.allergies || "",
        medicalConditions: data.patient?.medicalConditions || "",
        currentMedications: data.patient?.currentMedications || "",
      });
    } catch (err: any) {
      setSearchError(err.message || "Failed to find medical record");
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setPatient((prev) => (prev ? { ...prev, ...data.patient } : data.patient));
      setIsEditingProfile(false);
      setProfileSuccessMsg("Your medical profile has been updated successfully.");
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Could not update profile");
    } finally {
      setIsSavingProfile(false);
    }
  }

  const isModalActive = Boolean(selectedSlipApt || selectedSlipRx || selectedSlipInv);
  const nextAppointment = appointments.find((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN") || appointments[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* --------------------------------------------------------- */}
      {/* 1. TOP MARQUEE TICKER (Homepage Vibe)                     */}
      {/* --------------------------------------------------------- */}
      <div className={`bg-slate-950 text-slate-300 text-xs py-2 border-b border-slate-800/80 overflow-hidden relative select-none ${isModalActive ? "print:hidden" : ""}`}>
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex items-center gap-6 sm:gap-8 px-4 shrink-0 whitespace-nowrap">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Apex Dental & Aesthetic Lounge • Baner-Pashan & Somwar Peth, Pune</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Patient Health Records & Digital Services Portal</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-teal-300">
                Class-B European Autoclave 100% Sterile Six-Step Chain
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-amber-400 font-medium">
                ⭐ 4.9 ★ Rated by 1,240+ Verified Pune Patients
              </span>
              <span className="text-slate-700">•</span>
              <a href="tel:+919765539107" className="text-white hover:text-teal-300 transition">
                Emergency Desk: +91 97655 39107
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 2. PORTAL HEADER                                          */}
      {/* --------------------------------------------------------- */}
      <header className={`bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs ${isModalActive ? "print:hidden" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-sm">
                <Shield className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                  Apex Dental & Aesthetic Lounge
                </h1>
                <p className="text-[11px] font-semibold text-teal-800">
                  Patient Health Records & Digital Services Portal
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                title="Sign out to home page"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-800 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------- */}
      {/* 3. PATIENT HERO BANNER & MEDICAL VITALS (Homepage Vibe)    */}
      {/* --------------------------------------------------------- */}
      <div className={`bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white py-8 px-4 sm:px-6 border-b border-teal-900/60 ${isModalActive ? "print:hidden" : ""}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            
            {/* Patient Identity */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-teal-400/40 shrink-0">
                {patient ? patient.fullName.charAt(0) : "P"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 bg-teal-800/80 text-teal-200 border border-teal-600/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Medical Record
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    UHID: {patient?.patientIdNumber || "APEX-P-2026"}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {patient ? `Namaste, ${patient.fullName}` : "Patient Health Records Portal"}
                </h2>

                <p className="text-xs sm:text-sm text-teal-200/90 mt-1 max-w-xl">
                  {patient
                    ? `Registered Phone: ${patient.phone} • Registered City: ${patient.city || "Pune"}`
                    : "Access official appointment slips, verified doctor prescriptions, and itemized GST receipts."}
                </p>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919765539107?text=Hello%20Apex%20Dental%2C%20I%20am%20a%20registered%20patient%20inquiring%20about%20my%20records."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Desk</span>
              </a>

              <a
                href="tel:+919765539107"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-semibold text-xs transition backdrop-blur-md"
              >
                <Phone className="w-4 h-4 text-teal-300" />
                <span>+91 97655 39107</span>
              </a>
            </div>
          </div>

          {/* Vitals Strip (Visible when patient record is loaded) */}
          {patient && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-teal-900/60 text-xs">
              <div className="bg-slate-900/80 border border-teal-900/80 rounded-xl p-3 flex items-center gap-3">
                <HeartPulse className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</div>
                  <div className="text-sm font-bold text-white font-mono">{patient.bloodGroup || "O+"}</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-teal-900/80 rounded-xl p-3 flex items-center gap-3">
                <User className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Age & Gender</div>
                  <div className="text-sm font-bold text-white">
                    {patient.age ? `${patient.age} Yrs` : "Adult"} • {patient.gender || "Male"}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-teal-900/80 rounded-xl p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Medical Alert / Allergies</div>
                  <div className="text-xs font-bold text-amber-300 truncate" title={patient.allergies || "None"}>
                    {patient.allergies || "No Known Drug Allergies"}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-teal-900/80 rounded-xl p-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contact</div>
                  <div className="text-xs font-bold text-emerald-300 truncate">
                    {patient.emergencyContactName ? `${patient.emergencyContactName}` : "On File"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Lookup Bar (Only shown for guest users without loaded records) */}
          {!isAuthenticated && !patient && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-teal-700/30 text-slate-900">
              <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Enter Booking Reference (e.g. APT-26-8942) or Mobile Number (+91 98...)"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Track / Fetch Records</span>
                    </>
                  )}
                </button>
              </form>

              {searchError && (
                <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{searchError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 4. DYNAMIC NAVIGATION TABS                                */}
      {/* --------------------------------------------------------- */}
      <div className={`bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs ${isModalActive ? "print:hidden" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-2.5 text-xs sm:text-sm font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "OVERVIEW"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Overview & Vitals</span>
            </button>

            <button
              onClick={() => setActiveTab("APPOINTMENTS")}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "APPOINTMENTS"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments ({appointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("PRESCRIPTIONS")}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "PRESCRIPTIONS"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Prescriptions ({prescriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("INVOICES")}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "INVOICES"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Billing & Receipts ({invoices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ACCOUNT")}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "ACCOUNT"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile & Account</span>
            </button>

            <button
              onClick={() => setActiveTab("DOCTORS")}
              className={`px-3.5 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "DOCTORS"
                  ? "bg-teal-700 text-white font-bold shadow-xs"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Our Doctors</span>
            </button>
          </nav>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* 5. MAIN TAB CONTENT PANELS                                */}
      {/* --------------------------------------------------------- */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 ${isModalActive ? "print:hidden" : ""}`}>
        
        {/* Success Alert */}
        {profileSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-2xl flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & NEXT VISIT                              */}
        {/* ========================================================= */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8">
            {/* Spotlight Next Consultation */}
            {nextAppointment ? (
              <div className="bg-gradient-to-br from-white to-teal-50/50 rounded-3xl border border-teal-200 p-6 sm:p-8 shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 border border-teal-300/80 text-teal-900 text-xs font-bold mb-3">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                      <span>Next Scheduled Consultation • Token #03</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {nextAppointment.serviceName || "Specialist Clinical Consultation"}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Consultant: <strong className="text-slate-900">{nextAppointment.doctorName}</strong> ({nextAppointment.doctorSpecialty || "MDS Specialist"})
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Calendar className="w-4 h-4 text-teal-700" />
                        <span>{new Date(nextAppointment.appointmentDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                      </span>

                      <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Clock className="w-4 h-4 text-teal-700" />
                        <span>{nextAppointment.startTime}</span>
                      </span>

                      <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <BadgeCheck className="w-4 h-4 text-emerald-600" />
                        <span>Status: {nextAppointment.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setSelectedSlipApt(nextAppointment)}
                      className="inline-flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Isolated Slip</span>
                    </button>

                    <a
                      href="https://maps.google.com/?q=Somwar+Peth+Pune"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition"
                    >
                      <MapPin className="w-4 h-4 text-teal-700" />
                      <span>Get Clinic Directions</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                <Calendar className="w-10 h-10 text-teal-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Upcoming Appointment Scheduled</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You do not have any pending consultations. Book a slot with Dr. Ananya Kulkarni or Dr. Rohan Deshmukh online.
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Priority Slot</span>
                </Link>
              </div>
            )}

            {/* Doctor Showcase Grid (Homepage Vibe) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Your Clinical Consulting Team</h3>
                  <p className="text-xs text-slate-500">MDS & MD Faculty consulting at Apex Lounge, Pune</p>
                </div>
                <button
                  onClick={() => setActiveTab("DOCTORS")}
                  className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <span>View Full Profiles</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doctor 1 */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col sm:flex-row">
                  <img
                    src="/images/doctor-ananya.jpg"
                    alt="Dr. Ananya Kulkarni"
                    className="w-full sm:w-44 h-48 sm:h-auto object-cover"
                  />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">Dr. Ananya Kulkarni, BDS, MDS</h4>
                        <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-200">
                          Gold Medalist
                        </span>
                      </div>
                      <p className="text-xs text-teal-700 font-medium mt-0.5">
                        Chief Dental Surgeon & Oral Implantologist
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                        Specializes in Zeiss microscopic painless root canals, full arch implants, and invisible aligners.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Fee: ₹1,000 (Incl. RVG X-Rays)</span>
                      <Link
                        href="/book"
                        className="text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Doctor 2 */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col sm:flex-row">
                  <img
                    src="/images/doctor-rohan.jpg"
                    alt="Dr. Rohan Deshmukh"
                    className="w-full sm:w-44 h-48 sm:h-auto object-cover"
                  />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">Dr. Rohan Deshmukh, MBBS, MD</h4>
                        <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-200">
                          Ex-KEM
                        </span>
                      </div>
                      <p className="text-xs text-teal-700 font-medium mt-0.5">
                        Consultant Dermatologist & Aesthetic Physician
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                        Specializes in clinical acne protocols, medical HydraFacials, and evidence-based dermato-cosmetic care.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Fee: ₹1,000 (Skin Consultation)</span>
                      <Link
                        href="/book"
                        className="text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital-Grade Safety & Sterility */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Our Standard of Patient Safety</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                Hospital-Grade European Autoclave Sterilization & Low-Radiation Digital Imaging
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Every instrument cassette used for your procedure has undergone our rigorous 6-step sterile protocol (Ultrasonic, enzymatic scrub, sealed pouching, and Class-B fractional vacuum autoclaving at 134°C with biological spore verification). Sealed pouches are opened exclusively in your presence.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ALL APPOINTMENTS                                   */}
        {/* ========================================================= */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Your Appointment History</h3>
                <p className="text-xs text-slate-500">Official passes and scheduled consultation records</p>
              </div>
              <Link
                href="/book"
                className="bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book New</span>
              </Link>
            </div>

            {appointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs font-extrabold text-teal-900">
                          {apt.bookingReference}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {apt.serviceName || "Clinical Consultation"}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {apt.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>Doctor: <strong>{apt.doctorName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(apt.appointmentDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })} at {apt.startTime}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700">
                        Fee: {apt.price ? formatCurrency(apt.price) : "₹1,000"}
                      </span>
                      <button
                        onClick={() => setSelectedSlipApt(apt)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Official Slip</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No appointment records found.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PRESCRIPTIONS & MEDICATIONS                        */}
        {/* ========================================================= */}
        {activeTab === "PRESCRIPTIONS" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Verified Prescriptions</h3>
              <p className="text-xs text-slate-500">
                Official electronic prescriptions signed by Dr. Ananya Kulkarni (MDS) / Dr. Rohan Deshmukh (MD)
              </p>
            </div>

            {prescriptions.length > 0 ? (
              <div className="space-y-6">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-xs text-slate-500">
                          Prescription Date:{" "}
                          <strong className="text-slate-900">
                            {new Date(rx.prescriptionDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </strong>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                          Prescribed by: {rx.doctorName} ({rx.doctorSpecialty || "MDS Specialist"})
                        </h4>
                        <p className="text-[11px] text-teal-800 font-mono">
                          Registration: {rx.doctorRegNumber || "MDC / MMC Verified"}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedSlipRx(rx)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 px-4 py-2 rounded-xl transition shadow-xs shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Official Rx</span>
                      </button>
                    </div>

                    {/* Medication Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <th className="py-2.5 px-3 font-bold">#</th>
                            <th className="py-2.5 px-3 font-bold">Medicine Name</th>
                            <th className="py-2.5 px-3 font-bold">Dosage</th>
                            <th className="py-2.5 px-3 font-bold">Frequency</th>
                            <th className="py-2.5 px-3 font-bold">Timing</th>
                            <th className="py-2.5 px-3 font-bold">Duration</th>
                            <th className="py-2.5 px-3 font-bold">Special Instructions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rx.items.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td>
                              <td className="py-2 px-3 font-bold text-slate-900">{item.medicineName}</td>
                              <td className="py-2 px-3 text-slate-700">{item.dosage}</td>
                              <td className="py-2 px-3 text-slate-700 font-medium">{item.frequency}</td>
                              <td className="py-2 px-3 text-slate-700">{item.timing}</td>
                              <td className="py-2 px-3 text-slate-700 font-mono">{item.durationDays} days</td>
                              <td className="py-2 px-3 text-slate-600">{item.instructions || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {rx.generalAdvice && (
                      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                        <strong className="block mb-0.5">Clinical Advice:</strong>
                        <span>{rx.generalAdvice}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No prescriptions recorded yet.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: INVOICES & RECEIPTS                                */}
        {/* ========================================================= */}
        {activeTab === "INVOICES" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Billing & GST Tax Receipts</h3>
              <p className="text-xs text-slate-500">Official tax invoices, UPI transactions, and receipts</p>
            </div>

            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-teal-800">
                          {inv.invoiceNumber}
                        </span>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Date: {new Date(inv.invoiceDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {inv.status}
                        </span>

                        <button
                          onClick={() => setSelectedSlipInv(inv)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 px-3.5 py-1.5 rounded-xl transition shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Receipt</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {inv.items.map((it, i) => (
                        <div key={i} className="flex justify-between items-center text-xs py-1">
                          <span className="text-slate-800 font-medium">{it.description}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(it.totalPrice)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-500">Paid: {formatCurrency(inv.paidAmount)}</span>
                        {inv.balanceDue > 0 && (
                          <span className="text-red-600 font-bold ml-2">Due: {formatCurrency(inv.balanceDue)}</span>
                        )}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Total: {formatCurrency(inv.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No billing records found.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MY PROFILE & DYNAMIC ACCOUNT PAGE                  */}
        {/* ========================================================= */}
        {activeTab === "ACCOUNT" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Personal Health Profile & Account</h3>
                <p className="text-xs text-slate-500">
                  Manage your personal demographics, emergency contacts, and recorded clinical allergies
                </p>
              </div>

              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Medical Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl border border-slate-300"
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={profileForm.bloodGroup}
                      onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    >
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age (Years)</label>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Residential Address & Area</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="e.g. Flat 402, Rohan Viti, Somwar Peth, Pune"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person & Relationship</label>
                    <input
                      type="text"
                      value={profileForm.emergencyContactName}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                      placeholder="e.g. Sunita Sharma (Wife)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.emergencyContactPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                      placeholder="e.g. +91 98220 99991"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Drug Allergies & Hypersensitivity</label>
                    <input
                      type="text"
                      value={profileForm.allergies}
                      onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                      placeholder="e.g. Penicillin, Sulfa drugs, Aspirin (or write None)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Chronic Medical Conditions</label>
                    <input
                      type="text"
                      value={profileForm.medicalConditions}
                      onChange={(e) => setProfileForm({ ...profileForm, medicalConditions: e.target.value })}
                      placeholder="e.g. Hypertension, Diabetes Type II, Asthmatic"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? "Saving Changes..." : "Save Medical Profile"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">Personal Demographics</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>Name: <strong className="text-slate-900">{patient?.fullName}</strong></div>
                    <div>Phone: <strong className="text-slate-900">{patient?.phone}</strong></div>
                    <div>Email: <strong className="text-slate-900">{patient?.email || "On File"}</strong></div>
                    <div>Age & Gender: <strong className="text-slate-900">{patient?.age ? `${patient.age} Yrs` : "Adult"} • {patient?.gender}</strong></div>
                    <div>Address: <strong className="text-slate-900">{patient?.address || "Somwar Peth / Pune"}</strong></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">Clinical Baseline & Safety</h4>
                  <div className="space-y-1 text-slate-600">
                    <div>Blood Group: <strong className="text-red-700 font-bold">{patient?.bloodGroup || "O+"}</strong></div>
                    <div>Allergies: <strong className="text-amber-800">{patient?.allergies || "No Known Drug Allergies"}</strong></div>
                    <div>Chronic Conditions: <strong className="text-slate-900">{patient?.medicalConditions || "None recorded"}</strong></div>
                    <div>Emergency Contact: <strong className="text-slate-900">{patient?.emergencyContactName || "Sunita Sharma"} ({patient?.emergencyContactPhone || "+91 98220 99991"})</strong></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: DOCTORS & SPECIALTIES                              */}
        {/* ========================================================= */}
        {activeTab === "DOCTORS" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Medical Faculty & Specialization</h3>
              <p className="text-xs text-slate-500">Board-certified clinicians providing verified patient care</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dr Ananya */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/images/doctor-ananya.jpg"
                    alt="Dr. Ananya Kulkarni"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-600 shadow-sm"
                  />
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Dr. Ananya Kulkarni, BDS, MDS</h4>
                    <p className="text-xs text-teal-800 font-semibold">Prosthodontics & Oral Implantology</p>
                    <p className="text-[11px] text-slate-500 font-mono">MDC Reg: A-28491 • 14+ Yrs Exp</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gold Medalist from Maharashtra University of Health Sciences. Expertise includes single-sitting microscopic endodontics, invisible orthodontic clear aligners, and aesthetic smile rehabilitation.
                </p>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">OPD: Mon-Sat (9:30 AM - 1:30 PM, 4:30 PM - 8:30 PM)</span>
                  <Link href="/book" className="bg-teal-800 text-white px-3.5 py-1.5 rounded-xl font-bold">
                    Book Slot
                  </Link>
                </div>
              </div>

              {/* Dr Rohan */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/images/doctor-rohan.jpg"
                    alt="Dr. Rohan Deshmukh"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-600 shadow-sm"
                  />
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">Dr. Rohan Deshmukh, MBBS, MD</h4>
                    <p className="text-xs text-teal-800 font-semibold">Dermatology, Venereology & Leprosy</p>
                    <p className="text-[11px] text-slate-500 font-mono">MMC Reg: 2012/05/1429 • 11+ Yrs Exp</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Former Registrar at KEM Hospital Mumbai. Expertise in evidence-based clinical dermatology, medical HydraFacial protocols, chemical peels, and non-surgical aesthetic restoration.
                </p>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">OPD: Mon-Sat (10:00 AM - 2:00 PM, 5:00 PM - 8:00 PM)</span>
                  <Link href="/book" className="bg-teal-800 text-white px-3.5 py-1.5 rounded-xl font-bold">
                    Book Slot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --------------------------------------------------------- */}
      {/* 6. PRINT SLIP MODALS (ISOLATED PERFECT A4 SINGLE PAGE)     */}
      {/* --------------------------------------------------------- */}

      {/* Modal A: Appointment Slip */}
      {selectedSlipApt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto printable-modal-overlay">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative border border-slate-200 printable-modal-inner">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Official Appointment Token Pass
              </span>
              <button
                onClick={() => setSelectedSlipApt(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <AppointmentSlip
              data={{
                bookingReference: selectedSlipApt.bookingReference,
                appointmentDate: typeof selectedSlipApt.appointmentDate === "string" ? selectedSlipApt.appointmentDate : new Date(selectedSlipApt.appointmentDate).toISOString(),
                startTime: selectedSlipApt.startTime,
                endTime: selectedSlipApt.endTime || "",
                patientName: patient?.fullName || "Patient",
                patientPhone: patient?.phone || "",
                patientAge: patient?.age,
                patientGender: patient?.gender,
                patientIdNumber: patient?.patientIdNumber,
                doctorName: selectedSlipApt.doctorName,
                doctorSpecialty: selectedSlipApt.doctorSpecialty || "Consultant Specialist",
                doctorQualification: selectedSlipApt.doctorQualification || "BDS, MDS",
                doctorRegNumber: selectedSlipApt.doctorRegNumber || "MDC Verified",
                serviceName: selectedSlipApt.serviceName || "Clinical Consultation",
                consultationFee: selectedSlipApt.price || 1000,
                clinicName: "Apex Dental & Aesthetic Lounge",
                clinicPhone: "+91 97655 39107",
                clinicAddress: "Shop 12-14, Royal Heritage Complex, Somwar Peth / Baner-Pashan Link Road, Pune 411011",
                tokenNumber: 3,
              }}
              onClose={() => setSelectedSlipApt(null)}
            />
          </div>
        </div>
      )}

      {/* Modal B: Doctor Prescription Slip */}
      {selectedSlipRx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto printable-modal-overlay">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative border border-slate-200 printable-modal-inner">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Official Medical Prescription (Rx)
              </span>
              <button
                onClick={() => setSelectedSlipRx(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <DoctorPrescriptionSlip
              data={{
                encounterDate: selectedSlipRx.prescriptionDate,
                clinicName: "Apex Dental & Aesthetic Lounge",
                clinicPhone: "+91 97655 39107",
                clinicAddress: "Somwar Peth / Baner-Pashan Link Road, Pune 411011",
                doctorName: selectedSlipRx.doctorName,
                doctorQualification: selectedSlipRx.doctorQualification || "BDS, MDS",
                doctorSpecialty: selectedSlipRx.doctorSpecialty || "Prosthodontist & Oral Implantologist",
                doctorRegNumber: selectedSlipRx.doctorRegNumber || "MDC Reg: A-28491",
                patientName: patient?.fullName || "Patient",
                patientAge: patient?.age || 38,
                patientGender: patient?.gender || "MALE",
                patientPhone: patient?.phone || "",
                patientIdNumber: patient?.patientIdNumber || "APEX-P-2026",
                diagnosis: "Clinical Consultation & Treatment Protocol",
                generalAdvice: selectedSlipRx.generalAdvice || "Maintain oral hygiene, take medications as scheduled.",
                prescriptionItems: selectedSlipRx.items,
                isSigned: true,
              }}
              onClose={() => setSelectedSlipRx(null)}
            />
          </div>
        </div>
      )}

      {/* Modal C: Invoice Receipt Slip */}
      {selectedSlipInv && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto printable-modal-overlay">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative border border-slate-200 printable-modal-inner">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Official Tax Invoice & GST Payment Receipt
              </span>
              <button
                onClick={() => setSelectedSlipInv(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <InvoiceReceiptSlip
              data={{
                invoiceNumber: selectedSlipInv.invoiceNumber,
                invoiceDate: selectedSlipInv.invoiceDate,
                clinicName: "Apex Dental & Aesthetic Lounge",
                clinicPhone: "+91 97655 39107",
                clinicAddress: "Shop 12-14, Royal Heritage Complex, Somwar Peth / Baner-Pashan Link Road, Pune 411011",
                clinicGst: "27AABCA1234F1Z5",
                patientName: patient?.fullName || "Patient",
                patientPhone: patient?.phone || "",
                patientIdNumber: patient?.patientIdNumber || "APEX-P-2026",
                items: selectedSlipInv.items.map((it) => ({
                  description: it.description,
                  quantity: it.quantity,
                  unitPrice: it.unitPrice,
                  totalPrice: it.totalPrice,
                })),
                totalAmount: selectedSlipInv.totalAmount,
                paidAmount: selectedSlipInv.paidAmount,
                balanceDue: selectedSlipInv.balanceDue,
                status: selectedSlipInv.status,
                payments: selectedSlipInv.payments?.map((pm) => ({
                  receiptNumber: pm.receiptNumber || `REC-${selectedSlipInv.invoiceNumber.replace("INV-", "")}`,
                  amount: pm.amount,
                  paymentMethod: pm.paymentMethod,
                  paymentDate: pm.paymentDate || new Date(),
                })) || [
                  {
                    receiptNumber: `REC-${selectedSlipInv.invoiceNumber.replace("INV-", "")}`,
                    amount: selectedSlipInv.paidAmount,
                    paymentMethod: "UPI",
                    paymentDate: new Date(),
                  },
                ],
              }}
              onClose={() => setSelectedSlipInv(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
