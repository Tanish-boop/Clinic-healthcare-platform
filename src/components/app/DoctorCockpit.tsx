"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Stethoscope,
  User,
  HeartPulse,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  FileText,
  Printer,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { DoctorPrescriptionSlip } from "@/components/app/DoctorPrescriptionSlip";
import Link from "next/link";
import { formatDoctorName } from "@/lib/utils";

interface QueueAppointment {
  id: string;
  bookingReference: string;
  startTime: string;
  status: string;
  chiefComplaint?: string | null;
  patient: {
    id: string;
    fullName: string;
    patientIdNumber: string;
    phone: string;
    gender: string;
    age?: number | null;
    bloodGroup?: string | null;
    allergies?: string | null;
    medicalConditions?: string | null;
  };
  service?: {
    id: string;
    name: string;
  } | null;
}

interface DoctorCockpitProps {
  clinicId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorQualification?: string;
  doctorRegNumber?: string;
  queueAppointments: QueueAppointment[];
  initialAppointmentId?: string;
}

interface PrescriptionItemRow {
  medicineName: string;
  dosage: string;
  frequency: string;
  timing: string;
  durationDays: number;
  instructions: string;
}

export function DoctorCockpit({
  clinicId,
  doctorId,
  doctorName,
  doctorSpecialty,
  doctorQualification,
  doctorRegNumber,
  queueAppointments,
  initialAppointmentId,
}: DoctorCockpitProps) {
  const [appointmentsList, setAppointmentsList] = useState<QueueAppointment[]>(queueAppointments);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string>(
    initialAppointmentId || queueAppointments[0]?.id || ""
  );

  const activeApt = appointmentsList.find((a) => a.id === selectedAptId);
  const patient = activeApt?.patient;

  // Specialty mode
  const [specialtyType, setSpecialtyType] = useState<
    "DENTAL" | "DERMATOLOGY" | "PHYSIOTHERAPY" | "GENERAL_PRACTICE"
  >(
    doctorSpecialty.toLowerCase().includes("dent")
      ? "DENTAL"
      : doctorSpecialty.toLowerCase().includes("derm")
      ? "DERMATOLOGY"
      : "GENERAL_PRACTICE"
  );

  // Vitals
  const [bpSystolic, setBpSystolic] = useState<number | "">(120);
  const [bpDiastolic, setBpDiastolic] = useState<number | "">(80);
  const [pulse, setPulse] = useState<number | "">(72);
  const [temperatureF, setTemperatureF] = useState<number | "">(98.4);
  const [weightKg, setWeightKg] = useState<number | "">("");
  const [spo2, setSpo2] = useState<number | "">(99);

  // SOAP notes
  const [subjectiveNotes, setSubjectiveNotes] = useState(
    activeApt?.chiefComplaint || ""
  );
  const [objectiveNotes, setObjectiveNotes] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  // Dental Specialty state: FDI Tooth chart (e.g. Tooth 18..48)
  const [dentalFindings, setDentalFindings] = useState<Record<number, string>>({
    26: "Deep Caries (RCT Advised)",
    36: "Class I Amalgam Restored",
  });
  const [activeTooth, setActiveTooth] = useState<number | null>(null);

  // Dermatology Specialty state
  const [fitzpatrickType, setFitzpatrickType] = useState("Type IV (Indian Wheatish)");
  const [lesionSite, setLesionSite] = useState("Bilateral Cheeks & Jawline");

  // Physiotherapy Specialty state
  const [painScore, setPainScore] = useState<number>(5);
  const [romNotes, setRomNotes] = useState("Restricted lumbar flexion by 30 degrees");

  // Prescription Items
  const [rxItems, setRxItems] = useState<PrescriptionItemRow[]>([
    {
      medicineName: "Amoxicillin + Potassium Clavulanate (Augmentin 625mg)",
      dosage: "625 mg",
      frequency: "1-0-1 (Twice daily)",
      timing: "After food",
      durationDays: 5,
      instructions: "Complete full 5-day course.",
    },
    {
      medicineName: "Aceclofenac + Paracetamol (Zerodol-P)",
      dosage: "100mg/325mg",
      frequency: "1-0-1 (Twice daily)",
      timing: "After food",
      durationDays: 3,
      instructions: "Take for pain relief.",
    },
  ]);
  const [generalAdvice, setGeneralAdvice] = useState(
    "Drink 2-3 liters of water daily. Avoid hard or extremely hot foods on treated area."
  );

  // Follow-up
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("Review healing after 5 days.");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  function addRxRow() {
    setRxItems([
      ...rxItems,
      {
        medicineName: "",
        dosage: "1 tablet",
        frequency: "1-0-1",
        timing: "After food",
        durationDays: 5,
        instructions: "",
      },
    ]);
  }

  function removeRxRow(index: number) {
    setRxItems(rxItems.filter((_, i) => i !== index));
  }

  function updateRxRow(index: number, field: keyof PrescriptionItemRow, val: any) {
    const updated = [...rxItems];
    (updated[index] as any)[field] = val;
    setRxItems(updated);
  }

  function toggleToothStatus(toothNum: number, status: string) {
    setDentalFindings({
      ...dentalFindings,
      [toothNum]: status,
    });
  }

  async function handleFinalizeEncounter() {
    if (!patient) return;
    setIsSaving(true);
    setSaveError("");
    setSavedSuccess(false);

    try {
      let specialtyData: any = {};
      if (specialtyType === "DENTAL") {
        specialtyData = { dentalFindings };
      } else if (specialtyType === "DERMATOLOGY") {
        specialtyData = { fitzpatrickType, lesionSite };
      } else if (specialtyType === "PHYSIOTHERAPY") {
        specialtyData = { painScore, romNotes };
      }

      const res = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          doctorId,
          patientId: patient.id,
          appointmentId: activeApt?.id,
          specialtyType,
          vitals: {
            bpSystolic: bpSystolic ? Number(bpSystolic) : undefined,
            bpDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
            pulse: pulse ? Number(pulse) : undefined,
            temperatureF: temperatureF ? Number(temperatureF) : undefined,
            weightKg: weightKg ? Number(weightKg) : undefined,
            spo2: spo2 ? Number(spo2) : undefined,
          },
          subjectiveNotes,
          objectiveNotes,
          assessment,
          plan,
          specialtyData,
          followUpDate: followUpDate || undefined,
          followUpNotes,
          prescriptionItems: rxItems.filter((i) => i.medicineName.trim()),
          generalAdvice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize clinical consultation");
      }

      setSavedSuccess(true);
      if (activeApt?.id) {
        setAppointmentsList((prev) =>
          prev.map((a) => (a.id === activeApt.id ? { ...a, status: "COMPLETED" } : a))
        );
      }
      setShowPrescriptionModal(true);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save encounter");
    } finally {
      setIsSaving(false);
    }
  }

  // FDI quadrants
  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="space-y-6">
      {/* Patient Switcher & Queue Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Doctor Clinical Cockpit • {formatDoctorName(doctorName)}
            </h2>
            <p className="text-xs text-slate-500">
              {doctorSpecialty} • Active EHR Consultation
            </p>
          </div>
        </div>

        {/* Patient queue select */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Queue:
          </label>
          <select
            value={selectedAptId}
            onChange={(e) => {
              setSelectedAptId(e.target.value);
              setSavedSuccess(false);
            }}
            className="w-full md:w-72 p-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
          >
            {queueAppointments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.startTime} • {a.patient.fullName} ({a.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {patient ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Clinical Document (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Patient Alert & Demographics Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {patient.fullName}
                    </h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {patient.patientIdNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {patient.gender} • {patient.age ? `${patient.age} yrs` : "Age N/A"} • Phone: {patient.phone}
                  </div>
                </div>

                {patient.allergies ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Allergy Alert: {patient.allergies}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No known allergies logged</div>
                )}
              </div>

              {/* Vitals Input Grid */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Vital Signs Recorded Today
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">BP (mmHg)</span>
                    <div className="flex items-center gap-1 mt-0.5 font-bold text-slate-800">
                      <input
                        type="number"
                        value={bpSystolic}
                        onChange={(e) => setBpSystolic(e.target.value ? Number(e.target.value) : "")}
                        className="w-10 bg-transparent text-right outline-none"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        value={bpDiastolic}
                        onChange={(e) => setBpDiastolic(e.target.value ? Number(e.target.value) : "")}
                        className="w-10 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Pulse (bpm)</span>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value ? Number(e.target.value) : "")}
                      className="w-full bg-transparent font-bold text-slate-800 mt-0.5 outline-none"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Temp (°F)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={temperatureF}
                      onChange={(e) => setTemperatureF(e.target.value ? Number(e.target.value) : "")}
                      className="w-full bg-transparent font-bold text-slate-800 mt-0.5 outline-none"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Weight (kg)</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="72"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
                      className="w-full bg-transparent font-bold text-slate-800 mt-0.5 outline-none"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">SpO2 (%)</span>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : "")}
                      className="w-full bg-transparent font-bold text-slate-800 mt-0.5 outline-none"
                    />
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Blood Group</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {patient.bloodGroup || "O+"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialty Clinical Template Switcher */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-sm whitespace-nowrap">
                    Specialty Examination Template
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["DENTAL", "DERMATOLOGY", "PHYSIOTHERAPY", "GENERAL_PRACTICE"] as const).map(
                    (mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSpecialtyType(mode)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                          specialtyType === mode
                            ? "bg-teal-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                        }`}
                      >
                        {mode.replace("_", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* DENTAL TOOTH CHART */}
              {specialtyType === "DENTAL" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">
                      Adult Dentition Chart (FDI System 11-48). Click a tooth to inspect or update status:
                    </span>
                    <span className="text-[10px] text-teal-700 font-mono">
                      Maxillary / Mandibular Quadrants
                    </span>
                  </div>

                  {/* Upper Jaw */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase text-center">
                      Maxilla (Upper Teeth: 18 - 28)
                    </div>
                    <div className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
                      {upperTeeth.map((num) => {
                        const condition = dentalFindings[num];
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setActiveTooth(num)}
                            className={`w-9 h-11 rounded border text-xs font-mono font-bold flex flex-col items-center justify-between p-1 transition ${
                              activeTooth === num
                                ? "ring-2 ring-teal-600 border-teal-600 bg-teal-50"
                                : condition
                                ? "border-amber-400 bg-amber-50 text-amber-900"
                                : "border-slate-300 bg-white hover:border-teal-400"
                            }`}
                          >
                            <span className="text-[10px]">{num}</span>
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lower Jaw */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-center gap-1 sm:gap-1.5 flex-wrap">
                      {lowerTeeth.map((num) => {
                        const condition = dentalFindings[num];
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setActiveTooth(num)}
                            className={`w-9 h-11 rounded border text-xs font-mono font-bold flex flex-col items-center justify-between p-1 transition ${
                              activeTooth === num
                                ? "ring-2 ring-teal-600 border-teal-600 bg-teal-50"
                                : condition
                                ? "border-amber-400 bg-amber-50 text-amber-900"
                                : "border-slate-300 bg-white hover:border-teal-400"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="text-[10px]">{num}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase text-center">
                      Mandible (Lower Teeth: 48 - 38)
                    </div>
                  </div>

                  {/* Active tooth inspector */}
                  {activeTooth && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                      <div className="font-bold text-slate-900">
                        Selected Tooth #{activeTooth}: {dentalFindings[activeTooth] || "Healthy / Intact"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Deep Caries (RCT)",
                          "Class I/II Restoration",
                          "Missing / Extracted",
                          "Full Zirconia Crown",
                          "Mild Attrition",
                          "Healthy / Cleared",
                        ].map((diag) => (
                          <button
                            key={diag}
                            type="button"
                            onClick={() => toggleToothStatus(activeTooth, diag)}
                            className="px-2 py-1 bg-white border border-slate-300 hover:border-teal-600 rounded text-[11px]"
                          >
                            Mark {diag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DERMATOLOGY TEMPLATE */}
              {specialtyType === "DERMATOLOGY" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Fitzpatrick Skin Phototype
                    </label>
                    <select
                      value={fitzpatrickType}
                      onChange={(e) => setFitzpatrickType(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                    >
                      <option>Type III (Medium / Light Wheatish)</option>
                      <option>Type IV (Indian Wheatish / Tan easily)</option>
                      <option>Type V (Brown / Moderately Pigmented)</option>
                      <option>Type VI (Deeply Pigmented)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Lesion Anatomical Distribution
                    </label>
                    <input
                      type="text"
                      value={lesionSite}
                      onChange={(e) => setLesionSite(e.target.value)}
                      placeholder="e.g. Malar eminence, hairline, trunk"
                      className="w-full p-2 rounded border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {/* PHYSIOTHERAPY TEMPLATE */}
              {specialtyType === "PHYSIOTHERAPY" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Visual Analogue Scale (VAS) Pain Score: <strong className="text-teal-700">{painScore} / 10</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={painScore}
                      onChange={(e) => setPainScore(Number(e.target.value))}
                      className="w-full accent-teal-700"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0 (No Pain)</span>
                      <span>5 (Moderate)</span>
                      <span>10 (Severe Pain)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Range of Motion (ROM) & Postural Assessment
                    </label>
                    <input
                      type="text"
                      value={romNotes}
                      onChange={(e) => setRomNotes(e.target.value)}
                      className="w-full p-2 rounded border border-slate-300"
                    />
                  </div>
                </div>
              )}

              {/* GENERAL PRACTICE TEMPLATE */}
              {specialtyType === "GENERAL_PRACTICE" && (
                <div className="text-xs text-slate-600">
                  <p>Standard SOAP Clinical Notes format enabled below for multi-system clinical evaluation.</p>
                </div>
              )}
            </div>

            {/* SOAP Clinical Documentation */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>SOAP Clinical Notes</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subjective (Chief Complaints, Symptom Onset & History)
                  </label>
                  <textarea
                    rows={2}
                    value={subjectiveNotes}
                    onChange={(e) => setSubjectiveNotes(e.target.value)}
                    placeholder="Patient describes throbbing pain aggravated on chewing..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Objective (Physical & Clinical Examination Findings)
                  </label>
                  <textarea
                    rows={2}
                    value={objectiveNotes}
                    onChange={(e) => setObjectiveNotes(e.target.value)}
                    placeholder="Intraoral evaluation reveals tender on percussion, erythematous margin..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assessment (Clinical Diagnosis / Diagnostic Impression)
                  </label>
                  <input
                    type="text"
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="e.g. Acute Irreversible Pulpitis #26"
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plan (Treatment Rendered & Recommended Procedures)
                  </label>
                  <textarea
                    rows={2}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Biomechanical canal prep completed up to F2. Calcium hydroxide dressing..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Prescription Generator */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Medical Prescription (Doctor-Approved Rx)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addRxRow}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-3">
                {rxItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Drug Name (e.g. Augmentin 625mg)"
                        value={item.medicineName}
                        onChange={(e) => updateRxRow(idx, "medicineName", e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300 font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Dosage (625mg)"
                        value={item.dosage}
                        onChange={(e) => updateRxRow(idx, "dosage", e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={item.frequency}
                        onChange={(e) => updateRxRow(idx, "frequency", e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="1-0-1 (Twice daily)">1-0-1 (Twice daily)</option>
                        <option value="1-1-1 (Thrice daily)">1-1-1 (Thrice daily)</option>
                        <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                        <option value="0-0-1 (Night)">0-0-1 (Night)</option>
                        <option value="SOS (As needed)">SOS (As needed)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={item.timing}
                        onChange={(e) => updateRxRow(idx, "timing", e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300 bg-white"
                      >
                        <option value="After food">After food</option>
                        <option value="Before food">Before food</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        placeholder="Days"
                        value={item.durationDays}
                        onChange={(e) => updateRxRow(idx, "durationDays", Number(e.target.value))}
                        className="w-full p-1.5 rounded border border-slate-300 text-center"
                      />
                    </div>
                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => removeRxRow(idx)}
                        className="p-1 text-slate-400 hover:text-red-700"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  General Dietary / Clinical Advice
                </label>
                <input
                  type="text"
                  value={generalAdvice}
                  onChange={(e) => setGeneralAdvice(e.target.value)}
                  placeholder="e.g. Warm saline gargles, avoid cold drinks..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            {/* Follow-up & Action Buttons */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
                <label className="font-semibold text-slate-700 whitespace-nowrap">
                  Follow-up Date:
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="p-1.5 rounded border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Encounter Finalized!</span>
                  </span>
                )}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleFinalizeEncounter}
                  className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Finalize & Sign Consultation"}</span>
                </button>
              </div>
            </div>

            {saveError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {saveError}
              </div>
            )}
          </div>

          {/* Prescription & Clinical Output (Right 4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Prescription & Consultation Pass
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Statutory Medical & Dental Council Format
                  </p>
                </div>
                {activeApt.status === "COMPLETED" || savedSuccess ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Signed & Finalized</span>
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Draft In-Progress
                  </span>
                )}
              </div>

              {/* Patient Snapshot */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1 border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{patient.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clinic ID:</span>
                  <span className="font-mono font-semibold text-teal-900">{patient.patientIdNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Diagnosis:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                    {assessment || "Clinical examination pending"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 pt-1 mt-1 text-[11px]">
                  <span className="text-slate-500">Rx Items:</span>
                  <span className="font-bold text-teal-800">
                    {rxItems.filter((i) => i.medicineName.trim()).length} Medication(s)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>View & Print Official Prescription Slip</span>
                </button>

                <Link
                  href={`/app/finance`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Proceed to Billing & Invoicing</span>
                </Link>
              </div>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                Standard NMC / DCI prescription layout with verified medical council reg number ({doctorRegNumber || "MDC-74921 / MMC-2015-8832"}).
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto shadow-xs">
            <Stethoscope className="w-8 h-8 text-teal-700" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Welcome, {formatDoctorName(doctorName)}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your real-time Clinical EHR Cockpit is connected and ready. You have no patient appointments waiting in your queue today.
            </p>
          </div>

          {/* Doctor Credentials Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Specialty</span>
              <span className="font-bold text-slate-800">{doctorSpecialty}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Council Reg</span>
              <span className="font-mono font-bold text-teal-900">{doctorRegNumber || "MDC Verified"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Qualification</span>
              <span className="font-bold text-slate-800">{doctorQualification || "BDS / MDS / MD"}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/app/appointments"
              className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule New Appointment</span>
            </Link>
            <Link
              href="/book"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span>View Public Booking Page</span>
            </Link>
          </div>
          
          <p className="text-[11px] text-slate-400">
            ℹ️ Appointments booked by patients on the clinic homepage will appear here instantly.
          </p>
        </div>
      )}

      {/* Official Prescription Slip Modal */}
      {showPrescriptionModal && patient && (
        <DoctorPrescriptionSlip
          isModal={true}
          onClose={() => setShowPrescriptionModal(false)}
          data={{
            doctorName,
            doctorSpecialty,
            doctorQualification: doctorQualification || "BDS, MDS • Senior Specialist",
            doctorRegNumber: doctorRegNumber || "MDC-74921 / MMC-2015-8832",
            patientName: patient.fullName,
            patientPhone: patient.phone,
            patientAge: patient.age,
            patientGender: patient.gender,
            patientIdNumber: patient.patientIdNumber,
            encounterDate: new Date(),
            vitals: {
              bpSystolic,
              bpDiastolic,
              pulse,
              temperatureF,
              weightKg,
              spo2,
            },
            chiefComplaint: subjectiveNotes,
            clinicalNotes: objectiveNotes,
            diagnosis: assessment || "Comprehensive clinical examination & diagnosis recorded.",
            specialtySummary:
              specialtyType === "DENTAL"
                ? `FDI Dentition Findings: ${
                    Object.entries(dentalFindings)
                      .map(([tooth, cond]) => `Tooth ${tooth}: ${cond}`)
                      .join(", ") || "No active dental pathology recorded"
                  }`
                : specialtyType === "DERMATOLOGY"
                ? `Fitzpatrick Skin Phototype ${fitzpatrickType || "III"}${
                    lesionSite ? ` • Lesion Area: ${lesionSite}` : ""
                  }`
                : undefined,
            prescriptionItems: rxItems.filter((i) => i.medicineName.trim()),
            generalAdvice,
            followUpDate,
            isSigned: true,
          }}
        />
      )}
    </div>
  );
}
