"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Plus,
  CheckCircle,
  Play,
  XCircle,
  Stethoscope,
  Receipt,
  Search,
  Filter,
  Printer,
  UserCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AppointmentSlip } from "@/components/public/AppointmentSlip";

interface AppointmentItem {
  id: string;
  bookingReference: string;
  appointmentDate: string | Date;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  chiefComplaint?: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    patientIdNumber: string;
  };
  doctor: {
    id: string;
    user: { fullName: string };
    specialty: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
  } | null;
}

interface AppointmentManagerProps {
  initialAppointments: AppointmentItem[];
  clinicId: string;
  doctors: Array<{ id: string; name: string; specialty: string }>;
  services: Array<{ id: string; name: string; price: number }>;
}

export function AppointmentManager({
  initialAppointments,
  clinicId,
  doctors,
  services,
}: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedSlipAppointment, setSelectedSlipAppointment] = useState<AppointmentItem | null>(null);

  // Walk-in modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDoctorId, setModalDoctorId] = useState(doctors[0]?.id || "");
  const [modalServiceId, setModalServiceId] = useState(services[0]?.id || "");
  const [modalPatientName, setModalPatientName] = useState("");
  const [modalPatientPhone, setModalPatientPhone] = useState("");
  const [modalDate, setModalDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [modalTime, setModalTime] = useState("11:00");
  const [modalComplaint, setModalComplaint] = useState("");
  const [modalError, setModalError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function updateStatus(id: string, newStatus: string, notes?: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      console.error("Status update failed:", e);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleWalkInSubmit(e: React.FormEvent) {
    e.preventDefault();
    setModalError("");
    setIsCreating(true);

    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          doctorId: modalDoctorId,
          serviceId: modalServiceId || undefined,
          patientName: modalPatientName,
          patientPhone: modalPatientPhone,
          appointmentDate: modalDate,
          startTime: modalTime,
          type: "IN_PERSON",
          chiefComplaint: modalComplaint,
          source: "WALK_IN",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule walk-in appointment");
      }

      // Add to list and close modal
      const newApt: AppointmentItem = {
        id: data.appointment.id,
        bookingReference: data.appointment.bookingReference,
        appointmentDate: data.appointment.appointmentDate,
        startTime: data.appointment.startTime,
        endTime: data.appointment.endTime,
        status: data.appointment.status,
        source: "WALK_IN",
        chiefComplaint: modalComplaint,
        patient: {
          id: data.appointment.id,
          fullName: modalPatientName,
          phone: modalPatientPhone,
          patientIdNumber: "NEW",
        },
        doctor: {
          id: modalDoctorId,
          user: {
            fullName: doctors.find((d) => d.id === modalDoctorId)?.name || "Doctor",
          },
          specialty: doctors.find((d) => d.id === modalDoctorId)?.specialty || "",
        },
        service: services.find((s) => s.id === modalServiceId) || null,
      };

      setAppointments([newApt, ...appointments]);
      setIsModalOpen(false);
      setModalPatientName("");
      setModalPatientPhone("");
      setModalComplaint("");
    } catch (err: any) {
      setModalError(err.message || "Failed to schedule walk-in");
    } finally {
      setIsCreating(false);
    }
  }

  // Filtered appointments
  const filtered = appointments.filter((apt) => {
    if (selectedDoctorId !== "ALL" && apt.doctor.id !== selectedDoctorId) return false;
    if (selectedStatus !== "ALL" && apt.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = apt.patient.fullName.toLowerCase().includes(q);
      const matchPhone = apt.patient.phone.toLowerCase().includes(q);
      const matchRef = apt.bookingReference.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchRef) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search patient, phone, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {/* Filters and New Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Doctor filter */}
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="IN_CONSULTATION">In Consultation</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Walk-in Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Walk-in / Booking</span>
          </button>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Showing <strong>{filtered.length}</strong> appointments
          </span>
          <span className="font-mono">Timezone: Asia/Kolkata</span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No appointments matching the selected filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ref & Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Patient Demographics</th>
                  <th className="py-3 px-4">Doctor & Specialty</th>
                  <th className="py-3 px-4">Procedure / Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => {
                  const statusColors: Record<string, string> = {
                    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
                    CHECKED_IN: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
                    IN_CONSULTATION: "bg-teal-50 text-teal-800 border-teal-300 font-bold animate-pulse",
                    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200 line-through",
                    NO_SHOW: "bg-red-50 text-red-700 border-red-200",
                  };
                  const color = statusColors[apt.status] || "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {apt.bookingReference}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {format(new Date(apt.appointmentDate), "dd MMM yyyy")}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {apt.startTime} - {apt.endTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {apt.patient.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {apt.patient.phone} • {apt.patient.patientIdNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">
                          {apt.doctor.user.fullName}
                        </div>
                        <div className="text-[10px] text-teal-700">
                          {apt.doctor.specialty}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {apt.service?.name || "Standard Consultation"}
                        </div>
                        {apt.service?.price && (
                          <div className="text-[10px] text-slate-400">
                            {formatCurrency(apt.service.price)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-[10px] border ${color}`}
                        >
                          {apt.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === "CONFIRMED" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(apt.id, "CHECKED_IN", "Patient arrived in lobby")}
                              disabled={updatingId === apt.id}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-semibold"
                              title="Mark patient arrived in waiting lobby"
                            >
                              Check In (Lobby)
                            </button>
                          )}
                          {apt.status === "CHECKED_IN" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(apt.id, "IN_CONSULTATION", "Called to doctor room")}
                              disabled={updatingId === apt.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-[11px] font-semibold"
                              title="Send patient from waiting lobby into Doctor's room"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Call to Doctor</span>
                            </button>
                          )}
                          {apt.status === "IN_CONSULTATION" && (
                            <Link
                              href={`/app/doctor?appointmentId=${apt.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-300 rounded-lg text-[11px] font-semibold hover:bg-teal-100"
                              title="Patient is currently in consultation with doctor"
                            >
                              <Stethoscope className="w-3 h-3 text-teal-600" />
                              <span>With Doctor</span>
                            </Link>
                          )}

                          {/* Print Appointment Pass */}
                          <button
                            type="button"
                            onClick={() => setSelectedSlipAppointment(apt)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition"
                            title="Print Clinical Appointment Pass / Token"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt("Enter cancellation reason:");
                                if (reason) updateStatus(apt.id, "CANCELLED", reason);
                              }}
                              className="p-1 text-slate-400 hover:text-red-700 rounded hover:bg-slate-100"
                              title="Cancel appointment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {apt.status === "COMPLETED" && (
                            <Link
                              href={`/app/finance`}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>Invoice</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Walk-in Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Create Walk-In / Front-Desk Booking
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor</label>
                <select
                  value={modalDoctorId}
                  onChange={(e) => setModalDoctorId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service / Procedure</label>
                <select
                  value={modalServiceId}
                  onChange={(e) => setModalServiceId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatCurrency(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot (HH:mm)</label>
                  <input
                    type="text"
                    required
                    placeholder="11:30"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Pawar"
                    value={modalPatientName}
                    onChange={(e) => setModalPatientName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98..."
                    value={modalPatientPhone}
                    onChange={(e) => setModalPatientPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chief Complaint</label>
                <input
                  type="text"
                  placeholder="Toothache, routine checkup..."
                  value={modalComplaint}
                  onChange={(e) => setModalComplaint(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
                >
                  {isCreating ? "Scheduling..." : "Confirm Walk-in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Slip / Token Print Modal */}
      {selectedSlipAppointment && (
        <AppointmentSlip
          isModal={true}
          onClose={() => setSelectedSlipAppointment(null)}
          data={{
            bookingReference: selectedSlipAppointment.bookingReference,
            patientName: selectedSlipAppointment.patient.fullName,
            patientPhone: selectedSlipAppointment.patient.phone,
            patientIdNumber: selectedSlipAppointment.patient.patientIdNumber,
            doctorName: selectedSlipAppointment.doctor.user.fullName,
            doctorSpecialty: selectedSlipAppointment.doctor.specialty,
            serviceName: selectedSlipAppointment.service?.name,
            appointmentDate: String(selectedSlipAppointment.appointmentDate),
            startTime: selectedSlipAppointment.startTime,
            endTime: selectedSlipAppointment.endTime,
            consultationFee: selectedSlipAppointment.service?.price,
            type: "IN_PERSON",
            clinicName: "Apex Dental & Aesthetic Lounge",
          }}
        />
      )}
    </div>
  );
}
