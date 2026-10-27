"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Users,
  Search,
  Plus,
  Download,
  Phone,
  Mail,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  X,
  CheckCircle,
} from "lucide-react";

interface PatientItem {
  id: string;
  patientIdNumber: string;
  fullName: string;
  phone: string;
  email?: string | null;
  gender: string;
  age?: number | null;
  area?: string | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  createdAt: string | Date;
  _count: {
    appointments: number;
    encounters: number;
    invoices: number;
  };
}

interface PatientDirectoryProps {
  initialPatients: PatientItem[];
  clinicId: string;
}

export function PatientDirectory({ initialPatients, clinicId }: PatientDirectoryProps) {
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);

  // New patient modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("PREFER_NOT_TO_SAY");
  const [age, setAge] = useState<number | "">("");
  const [area, setArea] = useState("");
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.patientIdNumber.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email: email || undefined,
          gender,
          age: age ? Number(age) : undefined,
          area,
          allergies: allergies || undefined,
          medicalConditions: conditions || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register patient");
      }

      const newPat: PatientItem = {
        ...data.patient,
        _count: { appointments: 0, encounters: 0, invoices: 0 },
      };

      setPatients([newPat, ...patients]);
      setIsModalOpen(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setAllergies("");
      setConditions("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register patient");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone (+91), or PAT ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <a
            href="/api/patients/export"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>
            Total Patients: <strong>{filtered.length}</strong>
          </span>
          <span>Verified Clinic Registry</span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No patients found matching your search.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Phone / Contact</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Allergies & Alerts</th>
                  <th className="py-3 px-4 text-center">Visits</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {p.patientIdNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.fullName}</div>
                      {p.area && (
                        <div className="text-[10px] text-slate-400">{p.area}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {p.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.gender} {p.age ? `• ${p.age} yrs` : ""}
                    </td>
                    <td className="py-3 px-4">
                      {p.allergies ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{p.allergies}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                        {p._count.appointments} apts
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPatient(p)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedPatient.fullName}
                </h3>
                <span className="text-xs font-mono text-teal-800 font-bold">
                  {selectedPatient.patientIdNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-mono font-semibold">{selectedPatient.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email</span>
                  <span>{selectedPatient.email || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Demographics</span>
                  <span>{selectedPatient.gender} • {selectedPatient.age || "N/A"} yrs</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Area</span>
                  <span>{selectedPatient.area || "Pune"}</span>
                </div>
              </div>

              {selectedPatient.allergies && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Documented Allergies:</span>
                  </div>
                  <div>{selectedPatient.allergies}</div>
                </div>
              )}

              {selectedPatient.medicalConditions && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 space-y-1">
                  <div className="font-bold">Medical Conditions:</div>
                  <div>{selectedPatient.medicalConditions}</div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2 border rounded">
                  <span className="text-lg font-bold text-slate-900 block">
                    {selectedPatient._count.appointments}
                  </span>
                  <span className="text-[10px] text-slate-500">Appointments</span>
                </div>
                <div className="p-2 border rounded">
                  <span className="text-lg font-bold text-slate-900 block">
                    {selectedPatient._count.encounters}
                  </span>
                  <span className="text-[10px] text-slate-500">Consultations</span>
                </div>
                <div className="p-2 border rounded">
                  <span className="text-lg font-bold text-slate-900 block">
                    {selectedPatient._count.invoices}
                  </span>
                  <span className="text-[10px] text-slate-500">Invoices</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Register New Patient
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meera Joshi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone (+91) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="PREFER_NOT_TO_SAY">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Years"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area / Locality</label>
                  <input
                    type="text"
                    placeholder="Kothrud, Pune"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  placeholder="Penicillin, NSAIDs, Sulfa drugs..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
