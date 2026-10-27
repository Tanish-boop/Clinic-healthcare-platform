"use client";

import { useState } from "react";
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Printer,
  Search,
  Phone,
  Stethoscope,
  Sparkles,
  CreditCard,
  UserCheck,
  ChevronRight,
  Info,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AppointmentSlip } from "@/components/public/AppointmentSlip";

interface ReceptionAppointment {
  id: string;
  bookingReference: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  patientAge?: number | null;
  patientGender?: string | null;
  patientIdNumber?: string | null;
  doctorName: string;
  doctorSpecialty?: string | null;
  doctorQualification?: string | null;
  doctorRegNumber?: string | null;
  serviceName: string;
  price: number;
  startTime: string;
  status: string;
  chiefComplaint?: string | null;
}

interface ReceptionConsoleProps {
  initialAppointments: ReceptionAppointment[];
  clinicName: string;
  clinicPhone: string;
  doctors: Array<{ id: string; name: string; specialty: string }>;
  services: Array<{ id: string; name: string; price: number }>;
}

export function ReceptionConsole({
  initialAppointments,
  clinicName,
  clinicPhone,
  doctors,
  services,
}: ReceptionConsoleProps) {
  const [appointments, setAppointments] = useState<ReceptionAppointment[]>(initialAppointments);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "WAITING" | "IN_EXAM" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Walk-in Registration Modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    fullName: "",
    phone: "",
    age: "30",
    gender: "MALE",
    doctorId: doctors[0]?.id || "",
    serviceId: services[0]?.id || "",
    chiefComplaint: "",
  });
  const [isRegisteringWalkin, setIsRegisteringWalkin] = useState(false);

  // Print Slip Modal
  const [slipAppointment, setSlipAppointment] = useState<ReceptionAppointment | null>(null);

  // Status Updater
  async function updateStatus(appointmentId: string, newStatus: string, actionNote: string) {
    setIsUpdatingStatus(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: actionNote }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
      );
    } catch (e: any) {
      alert(e.message || "Could not update status");
    } finally {
      setIsUpdatingStatus(null);
    }
  }

  // Handle Walk-in Registration
  async function handleWalkinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsRegisteringWalkin(true);

    try {
      // 1. Register Patient
      const patientRes = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: walkinForm.fullName,
          phone: walkinForm.phone,
          age: Number(walkinForm.age),
          gender: walkinForm.gender,
        }),
      });

      const patientData = await patientRes.json();
      const patient = patientData.patient;

      // 2. Book Appointment for Today
      const todayStr = new Date().toISOString().split("T")[0];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const bookRes = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: walkinForm.doctorId,
          serviceId: walkinForm.serviceId,
          appointmentDate: todayStr,
          startTime: timeStr,
          type: "IN_PERSON",
          fullName: walkinForm.fullName,
          phone: walkinForm.phone,
          age: Number(walkinForm.age),
          gender: walkinForm.gender,
          notes: walkinForm.chiefComplaint || "Walk-in patient registration at front desk",
        }),
      });

      const bookData = await bookRes.json();
      if (!bookRes.ok) {
        throw new Error(bookData.error || "Failed to book walk-in");
      }

      const doc = doctors.find((d) => d.id === walkinForm.doctorId);
      const srv = services.find((s) => s.id === walkinForm.serviceId);

      const newApt: ReceptionAppointment = {
        id: bookData.appointment.id,
        bookingReference: bookData.appointment.bookingReference,
        tokenNumber: appointments.length + 1,
        patientName: walkinForm.fullName,
        patientPhone: walkinForm.phone,
        patientAge: Number(walkinForm.age),
        patientGender: walkinForm.gender,
        patientIdNumber: patient?.patientIdNumber || `APEX-P-${Math.floor(1000 + Math.random() * 9000)}`,
        doctorName: doc?.name || "Consultant Doctor",
        doctorSpecialty: doc?.specialty || "MDS Specialist",
        serviceName: srv?.name || "Consultation",
        price: srv?.price || 1000,
        startTime: timeStr,
        status: "CHECKED_IN",
        chiefComplaint: walkinForm.chiefComplaint,
      };

      setAppointments((prev) => [newApt, ...prev]);
      setShowWalkinModal(false);
      setWalkinForm({
        fullName: "",
        phone: "",
        age: "30",
        gender: "MALE",
        doctorId: doctors[0]?.id || "",
        serviceId: services[0]?.id || "",
        chiefComplaint: "",
      });

      // Auto-open print pass for walk-in patient
      setSlipAppointment(newApt);
    } catch (e: any) {
      alert(e.message || "Failed to register walk-in patient");
    } finally {
      setIsRegisteringWalkin(false);
    }
  }

  // Filtered queue
  const filteredAppointments = appointments.filter((a) => {
    const matchesQuery =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientPhone.includes(searchQuery) ||
      a.bookingReference.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeFilter === "WAITING") return a.status === "CHECKED_IN";
    if (activeFilter === "IN_EXAM") return a.status === "IN_CONSULTATION";
    if (activeFilter === "COMPLETED") return a.status === "COMPLETED";
    return true;
  });

  const waitingCount = appointments.filter((a) => a.status === "CHECKED_IN").length;
  const inExamCount = appointments.filter((a) => a.status === "IN_CONSULTATION").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const totalCount = appointments.length;

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------- */}
      {/* 1. FRONT DESK TITLE & QUICK ACTIONS                         */}
      {/* ----------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Front Desk Terminal #01 • Live OPD Queue</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Reception Desk Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage patient token passes, check-in waiting lounge queues, and coordinate with Dr. Ananya & Dr. Rohan
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowWalkinModal(true)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Walk-in Patient</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. CLINICAL WORKFLOW GUIDANCE ("What is Start Exam?")        */}
      {/* ----------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-teal-800 space-y-3">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4 text-teal-300 shrink-0" />
          <span>Receptionist Operational Guide • Step-by-Step Patient Triage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10">
            <div className="font-extrabold text-teal-200 flex items-center gap-1.5 mb-1">
              <span>Step 1: Check In</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              When patient arrives at front desk, click <strong>Check In</strong>. Patient is marked as seated in waiting lounge, and token pass is printed.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10">
            <div className="font-extrabold text-teal-200 flex items-center gap-1.5 mb-1">
              <span>Step 2: Start Exam (Call In)</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              When Dr. Ananya or Dr. Rohan calls patient into Operatory Suite, mark <strong>Start Exam</strong>. Updates chair status and lounge waiting estimates.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs border border-white/10">
            <div className="font-extrabold text-teal-200 flex items-center gap-1.5 mb-1">
              <span>Step 3: Complete & Bill</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              Doctor finishes consultation/procedure. Front desk collects fee (Cash/UPI QR), prints official receipt and signed prescription slip.
            </p>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. OPD QUEUE COUNTERS                                       */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveFilter("ALL")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeFilter === "ALL"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Total Scheduled Today</div>
          <div className="text-2xl font-black mt-1">{totalCount}</div>
          <div className="text-[10px] mt-1 opacity-60">Full OPD list</div>
        </div>

        <div
          onClick={() => setActiveFilter("WAITING")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeFilter === "WAITING"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">In Waiting Lounge</div>
          <div className="text-2xl font-black mt-1 text-amber-500">{waitingCount}</div>
          <div className="text-[10px] mt-1 text-amber-600 font-bold">Arrived & Seated</div>
        </div>

        <div
          onClick={() => setActiveFilter("IN_EXAM")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeFilter === "IN_EXAM"
              ? "bg-teal-700 text-white border-teal-700 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-teal-300"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">In Operatory (Exam)</div>
          <div className="text-2xl font-black mt-1 text-teal-600">{inExamCount}</div>
          <div className="text-[10px] mt-1 text-teal-700 font-bold">With Doctor Now</div>
        </div>

        <div
          onClick={() => setActiveFilter("COMPLETED")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            activeFilter === "COMPLETED"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
              : "bg-white text-slate-900 border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="text-xs font-semibold opacity-70">Completed Consultations</div>
          <div className="text-2xl font-black mt-1 text-emerald-600">{completedCount}</div>
          <div className="text-[10px] mt-1 text-emerald-700 font-bold">Billed & Checked Out</div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. LIVE QUEUE TABLE & TRIAGE ACTIONS                        */}
      {/* ----------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, Phone or Ref..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
            <span>Showing {filteredAppointments.length} patients in queue</span>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Token</th>
                <th className="py-3 px-4 font-bold">Patient Details</th>
                <th className="py-3 px-4 font-bold">Doctor & Specialty</th>
                <th className="py-3 px-4 font-bold">Service / Chief Complaint</th>
                <th className="py-3 px-4 font-bold">Slot Time</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Triage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt, index) => {
                  const isBusy = isUpdatingStatus === apt.id;

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      {/* Token */}
                      <td className="py-3 px-4">
                        <span className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-extrabold flex items-center justify-center font-mono text-xs">
                          #{String(index + 1).padStart(2, "0")}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{apt.patientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{apt.patientPhone}</span>
                          {apt.patientAge && (
                            <>
                              <span>•</span>
                              <span>{apt.patientAge} Yrs ({apt.patientGender?.charAt(0) || "M"})</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{apt.doctorName}</div>
                        <div className="text-[10px] text-teal-700 font-medium">{apt.doctorSpecialty}</div>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{apt.serviceName}</div>
                        {apt.chiefComplaint && (
                          <div className="text-[10px] text-slate-500 italic truncate max-w-xs">
                            &quot;{apt.chiefComplaint}&quot;
                          </div>
                        )}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                        {apt.startTime}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            apt.status === "CHECKED_IN"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : apt.status === "IN_CONSULTATION"
                              ? "bg-teal-50 text-teal-800 border-teal-300 animate-pulse"
                              : apt.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              apt.status === "CHECKED_IN"
                                ? "bg-amber-500"
                                : apt.status === "IN_CONSULTATION"
                                ? "bg-teal-500"
                                : apt.status === "COMPLETED"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          <span>{apt.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Step 1: Check in */}
                          {(apt.status === "CONFIRMED" || apt.status === "REQUESTED") && (
                            <button
                              onClick={() => updateStatus(apt.id, "CHECKED_IN", "Patient arrived at front desk")}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs disabled:opacity-50"
                              title="Mark as arrived in waiting lounge"
                            >
                              Check In 🚶
                            </button>
                          )}

                          {/* Step 2: Start Exam */}
                          {apt.status === "CHECKED_IN" && (
                            <button
                              onClick={() => updateStatus(apt.id, "IN_CONSULTATION", "Patient entered doctor operatory room")}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold text-[11px] transition shadow-2xs disabled:opacity-50 flex items-center gap-1"
                              title="Call into Operatory / Chair"
                            >
                              <Stethoscope className="w-3 h-3" />
                              <span>Start Exam 🩺</span>
                            </button>
                          )}

                          {/* Step 3: Complete */}
                          {apt.status === "IN_CONSULTATION" && (
                            <button
                              onClick={() => updateStatus(apt.id, "COMPLETED", "Consultation concluded by doctor")}
                              disabled={isBusy}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] transition shadow-2xs disabled:opacity-50 flex items-center gap-1"
                              title="Mark as finished & ready for bill"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Complete ✅</span>
                            </button>
                          )}

                          {/* Print Slip */}
                          <button
                            onClick={() => setSlipAppointment(apt)}
                            className="p-1.5 text-slate-600 hover:text-teal-900 bg-slate-100 hover:bg-teal-50 border border-slate-200 rounded-lg transition"
                            title="Print Front Desk Token Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No patients match the current filter or search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 5. WALK-IN PATIENT REGISTRATION MODAL                       */}
      {/* ----------------------------------------------------------- */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Quick Walk-in Patient Registration
                </h3>
                <p className="text-xs text-slate-500">
                  Register a walk-in patient at front desk & issue instant token
                </p>
              </div>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkinSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={walkinForm.fullName}
                  onChange={(e) => setWalkinForm({ ...walkinForm, fullName: e.target.value })}
                  placeholder="e.g. Ramesh Joshi"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={walkinForm.phone}
                    onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                    placeholder="+91 98220 12345"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age & Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={walkinForm.age}
                      onChange={(e) => setWalkinForm({ ...walkinForm, age: e.target.value })}
                      placeholder="Age"
                      className="w-16 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    />
                    <select
                      value={walkinForm.gender}
                      onChange={(e) => setWalkinForm({ ...walkinForm, gender: e.target.value })}
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consulting Doctor</label>
                  <select
                    value={walkinForm.doctorId}
                    onChange={(e) => setWalkinForm({ ...walkinForm, doctorId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none font-medium"
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service / Reason</label>
                  <select
                    value={walkinForm.serviceId}
                    onChange={(e) => setWalkinForm({ ...walkinForm, serviceId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none font-medium"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} (₹{srv.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint / Symptoms</label>
                <textarea
                  rows={2}
                  value={walkinForm.chiefComplaint}
                  onChange={(e) => setWalkinForm({ ...walkinForm, chiefComplaint: e.target.value })}
                  placeholder="e.g. Toothache lower right jaw, severe pain since 2 days"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringWalkin}
                  className="px-5 py-2 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isRegisteringWalkin ? "Registering & Assigning Token..." : "Register & Issue Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 6. PRINT APPOINTMENT PASS MODAL                             */}
      {/* ----------------------------------------------------------- */}
      {slipAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto printable-modal-overlay">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative border border-slate-200 printable-modal-inner">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 no-print">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Front Desk Patient Token Pass
              </span>
              <button
                onClick={() => setSlipAppointment(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <AppointmentSlip
              data={{
                bookingReference: slipAppointment.bookingReference,
                appointmentDate: new Date().toISOString(),
                startTime: slipAppointment.startTime,
                endTime: "",
                patientName: slipAppointment.patientName,
                patientPhone: slipAppointment.patientPhone,
                patientAge: slipAppointment.patientAge,
                patientGender: slipAppointment.patientGender,
                patientIdNumber: slipAppointment.patientIdNumber,
                doctorName: slipAppointment.doctorName,
                doctorSpecialty: slipAppointment.doctorSpecialty || "Consultant Specialist",
                doctorQualification: slipAppointment.doctorQualification || "BDS, MDS",
                doctorRegNumber: slipAppointment.doctorRegNumber || "MDC Verified",
                serviceName: slipAppointment.serviceName,
                consultationFee: slipAppointment.price,
                clinicName: clinicName,
                clinicPhone: clinicPhone,
                clinicAddress: "Shop 12-14, Royal Heritage Complex, Somwar Peth / Baner, Pune 411011",
                tokenNumber: slipAppointment.tokenNumber,
              }}
              onClose={() => setSlipAppointment(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
