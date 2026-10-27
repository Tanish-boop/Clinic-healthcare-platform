"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Video,
  Building,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AppointmentSlip } from "@/components/public/AppointmentSlip";

interface DoctorOption {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  consultationFee: number;
  avatarUrl?: string | null;
}

interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
}

interface BookingWidgetProps {
  clinicId: string;
  clinicName: string;
  doctors: DoctorOption[];
  services: ServiceOption[];
  initialDoctorId?: string;
  initialServiceId?: string;
  basePath?: string;
}

export function BookingWidget({
  clinicId,
  clinicName,
  doctors,
  services,
  initialDoctorId,
  initialServiceId,
  basePath = "",
}: BookingWidgetProps) {
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || (doctors[0]?.id ?? "")
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || (services[0]?.id ?? "")
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<"IN_PERSON" | "VIDEO_TELECONSULT">("IN_PERSON");

  // Patient inputs
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientGender, setPatientGender] = useState("PREFER_NOT_TO_SAY");
  const [patientAge, setPatientAge] = useState<number | "">("");
  const [chiefComplaint, setChiefComplaint] = useState("");

  // Slots state
  const [slots, setSlots] = useState<Array<{ time: string; formatted: string; available: boolean }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmationData, setConfirmationData] = useState<any>(null);

  // Synchronize doctor selection from external events (e.g. mobile hero slides, doctor cards)
  useEffect(() => {
    function handleDoctorSelectEvent(e: Event) {
      const customEvent = e as CustomEvent<{
        id?: string;
        nameSnippet?: string;
        name?: string;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      const matched = doctors.find((d) => {
        if (detail.id && d.id === detail.id) return true;
        if (detail.nameSnippet && d.name.toLowerCase().includes(detail.nameSnippet.toLowerCase())) return true;
        if (detail.name && d.name.toLowerCase().includes(detail.name.toLowerCase())) return true;
        return false;
      });

      if (matched) {
        setSelectedDoctorId(matched.id);
      }
    }

    window.addEventListener("apex-select-booking-doctor", handleDoctorSelectEvent);
    window.addEventListener("apex-doctor-change", handleDoctorSelectEvent);
    return () => {
      window.removeEventListener("apex-select-booking-doctor", handleDoctorSelectEvent);
      window.removeEventListener("apex-doctor-change", handleDoctorSelectEvent);
    };
  }, [doctors]);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    let isMounted = true;
    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotsError("");
      try {
        const res = await fetch(
          `/api/appointments/slots?clinicId=${clinicId}&doctorId=${selectedDoctorId}&date=${selectedDate}`
        );
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setSlots(data.slots || []);
            // reset selected time if it's no longer available
            if (!data.slots?.some((s: any) => s.time === selectedTime)) {
              setSelectedTime("");
            }
          } else {
            setSlotsError(data.error || "Could not load slots for this date");
            setSlots([]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setSlotsError("Network error while checking slot availability");
          setSlots([]);
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [clinicId, selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const estimatedFee = selectedService?.price || selectedDoctor?.consultationFee || 500;

  // Next dates for rapid selection (next 7 days)
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      dateStr: format(d, "yyyy-MM-dd"),
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : format(d, "EEE"),
      displayDate: format(d, "dd MMM"),
    };
  });

  async function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          doctorId: selectedDoctorId,
          serviceId: selectedServiceId || undefined,
          patientName,
          patientPhone,
          patientEmail: patientEmail || undefined,
          patientGender,
          patientAge: patientAge ? Number(patientAge) : undefined,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          type: consultationType,
          chiefComplaint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm appointment");
      }

      setConfirmationData(data.appointment);
      setStep(4); // Success step
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
      {/* Header Progress Tracker */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              step >= 1 ? "text-teal-700" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 1 ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              1
            </span>
            <span className="hidden sm:inline">Doctor & Service</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              step >= 2 ? "text-teal-700" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 2 ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </span>
            <span className="hidden sm:inline">Date & Time Slot</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div
            className={`flex items-center gap-2 text-xs font-semibold ${
              step >= 3 ? "text-teal-700" : "text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 3 ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              3
            </span>
            <span className="hidden sm:inline">Patient Details</span>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* STEP 1: Select Doctor & Service */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                1. Select Doctor & Clinical Service
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose your specialist and the primary reason for your visit.
              </p>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Specialist Consultant
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {doctors.map((doc) => {
                  const isSelected = doc.id === selectedDoctorId;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`text-left p-3.5 rounded-xl border transition ${
                        isSelected
                          ? "border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/30 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex gap-3.5 items-start">
                        {doc.avatarUrl ? (
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-base">
                            {doc.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <div className="font-bold text-slate-900 text-sm truncate">
                              {doc.name}
                            </div>
                            <span className="text-xs font-bold text-teal-900 bg-teal-100/80 px-2 py-0.5 rounded-md shrink-0">
                              {formatCurrency(doc.consultationFee)}
                            </span>
                          </div>
                          <div className="text-xs text-teal-700 font-semibold truncate mt-0.5">
                            {doc.specialty}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {doc.qualification}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Procedure or Consultation Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {services.map((svc) => {
                  const isSelected = svc.id === selectedServiceId;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setSelectedServiceId(svc.id)}
                      className={`text-left p-3 rounded-lg border transition ${
                        isSelected
                          ? "border-teal-600 bg-teal-50/50 ring-1 ring-teal-600"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-900 text-xs sm:text-sm">
                          {svc.name}
                        </span>
                        <span className="text-xs font-semibold text-teal-800 ml-2">
                          {formatCurrency(svc.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{svc.durationMinutes} mins</span>
                        <span>•</span>
                        <span>{svc.category}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Consultation Mode */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Consultation Mode
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setConsultationType("IN_PERSON")}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold transition ${
                    consultationType === "IN_PERSON"
                      ? "border-teal-600 bg-teal-50 text-teal-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Building className="w-4 h-4 text-teal-600" />
                  <span>In-Person at Clinic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType("VIDEO_TELECONSULT")}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold transition ${
                    consultationType === "VIDEO_TELECONSULT"
                      ? "border-teal-600 bg-teal-50 text-teal-900"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Video className="w-4 h-4 text-teal-600" />
                  <span>Online Teleconsultation</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <span>Continue to Date & Time</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Date & Available Slots */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                2. Select Appointment Date & Time
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Slots are calculated in real time based on {selectedDoctor?.name}&apos;s schedule and existing bookings.
              </p>
            </div>

            {/* Quick Date Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {quickDates.map((item) => {
                  const isSelected = item.dateStr === selectedDate;
                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        isSelected
                          ? "border-teal-600 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-600"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-medium">{item.dayName}</div>
                      <div className="text-xs mt-0.5">{item.displayDate}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Available Slots for {format(new Date(`${selectedDate}T00:00:00Z`), "EEEE, dd MMMM yyyy")}
                </label>
                <span className="text-xs text-slate-500">Asia/Kolkata (IST)</span>
              </div>

              {loadingSlots ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <div className="inline-block animate-spin w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full mb-2" />
                  <div>Computing real-time doctor availability...</div>
                </div>
              ) : slotsError ? (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{slotsError}</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  No slots available on this date (Clinic closed or Doctor on leave / fully booked). Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                  {slots.map((s) => {
                    const isSelected = s.time === selectedTime;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        onClick={() => setSelectedTime(s.time)}
                        className={`py-2 px-3 rounded text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                            : "bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:text-teal-700"
                        }`}
                      >
                        {s.formatted}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={!selectedTime}
                onClick={() => setStep(3)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
                  selectedTime
                    ? "bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>Continue to Patient Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Information & Review */}
        {step === 3 && (
          <form onSubmit={handleBookSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                3. Patient Details & Booking Confirmation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please enter the patient details for clinical registration and appointment SMS/WhatsApp confirmation.
              </p>
            </div>

            {/* Booking Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span>Specialist:</span>
                <span className="font-semibold text-slate-900">{selectedDoctor?.name} ({selectedDoctor?.specialty})</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Service:</span>
                <span className="font-semibold text-slate-900">{selectedService?.name || "Consultation"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Schedule:</span>
                <span className="font-semibold text-teal-800">
                  {format(new Date(`${selectedDate}T00:00:00Z`), "dd MMM yyyy")} at {selectedTime} ({consultationType === "IN_PERSON" ? "In-Person Clinic Visit" : "Online Teleconsult"})
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-slate-900 font-bold">
                <span>Indicative Consultation Fee:</span>
                <span className="text-teal-700">{formatCurrency(estimatedFee)} (Pay at clinic)</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. +91 98220 12345"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Confirmation and reminder will be logged to this number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="e.g. patient@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                  >
                    <option value="PREFER_NOT_TO_SAY">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Years"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chief Complaint / Reason for Consultation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe any toothache, skin problem, symptoms, or duration..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                By booking, you agree to our 4-hour cancellation policy. No advance payment required; pay after consultation.
              </span>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting ? "Confirming Slot..." : "Confirm Appointment"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success & Official Printable Confirmation Slip */}
        {step === 4 && confirmationData && (
          <div className="py-2 space-y-4">
            <div className="text-center no-print pb-2">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Appointment Successfully Registered!
              </h3>
              <p className="text-xs text-slate-500">
                Your priority slot is confirmed. An official clinical appointment pass has been generated below:
              </p>
            </div>

            <AppointmentSlip
              data={{
                bookingReference: confirmationData.bookingReference,
                patientName: confirmationData.patientName,
                patientPhone: confirmationData.patientPhone || patientPhone,
                patientAge: confirmationData.patientAge || (patientAge ? Number(patientAge) : undefined),
                patientGender: confirmationData.patientGender || patientGender,
                patientIdNumber: confirmationData.patientIdNumber,
                doctorName: confirmationData.doctorName,
                doctorSpecialty: confirmationData.doctorSpecialty || selectedDoctor?.specialty,
                doctorQualification: confirmationData.doctorQualification || selectedDoctor?.qualification,
                doctorRegNumber: confirmationData.doctorRegNumber,
                serviceName: confirmationData.serviceName || selectedService?.name,
                appointmentDate: confirmationData.appointmentDate,
                startTime: confirmationData.startTime,
                endTime: confirmationData.endTime,
                consultationFee: confirmationData.consultationFee || selectedService?.price || selectedDoctor?.consultationFee,
                type: confirmationData.type || consultationType,
                clinicName: confirmationData.clinicName || clinicName,
                clinicAddress: confirmationData.clinicAddress,
                clinicPhone: confirmationData.clinicPhone,
                tokenNumber: confirmationData.bookingReference.slice(-4),
              }}
              onClose={() => {
                setStep(1);
                setConfirmationData(null);
                setSelectedTime("");
                setChiefComplaint("");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
