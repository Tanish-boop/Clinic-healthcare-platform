"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  User,
  Stethoscope,
  Building,
  Briefcase,
  Phone,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SIGN_IN" | "REGISTER">("SIGN_IN");

  // Sign In State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register State
  const [regAccountType, setRegAccountType] = useState<"PATIENT" | "DOCTOR" | "CLINIC_OWNER" | "STAFF">("PATIENT");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  // Doctor Specific
  const [regSpecialty, setRegSpecialty] = useState("Prosthodontist & Implantologist");
  const [regQualification, setRegQualification] = useState("BDS, MDS");
  const [regRegNumber, setRegRegNumber] = useState("");
  const [regExperience, setRegExperience] = useState("8");
  const [regFee, setRegFee] = useState("500");

  // Clinic Owner Specific
  const [regClinicName, setRegClinicName] = useState("");
  const [regCity, setRegCity] = useState("Pune");

  // Staff Specific
  const [regStaffRole, setRegStaffRole] = useState<"RECEPTIONIST" | "ACCOUNTANT">("RECEPTIONIST");

  // Patient Specific
  const [regAge, setRegAge] = useState("");
  const [regGender, setRegGender] = useState("MALE");

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  const demoAccounts = [
    { role: "Front Desk Receptionist", email: "reception@apexdental.in", desc: "Live OPD Token queue, Start Exam & walk-in check-in" },
    { role: "Doctor (Dentist)", email: "dr.ananya@apexdental.in", desc: "Appointments, FDI dental chart, Zeiss root canal notes" },
    { role: "Doctor (Dermatologist)", email: "dr.rohan@apexdental.in", desc: "Skin consultations, phototypes & clinical prescriptions" },
    { role: "Clinic Owner", email: "owner@apexdental.in", desc: "Full clinic configuration & financial reports" },
    { role: "Accountant", email: "accounts@apexdental.in", desc: "GST tax invoices, UPI reconciliation" },
    { role: "Patient: Rajesh Sharma", email: "rajesh.sharma@example.com", desc: "Root Canal (Dr. Ananya), Blood B+, Penicillin alert" },
    { role: "Patient: Priya Deshpande", email: "priya.deshpande@example.com", desc: "Dermatology (Dr. Rohan), Blood O+, HydraFacial Rx" },
    { role: "Patient: Amit Kulkarni", email: "amit.kulkarni@example.com", desc: "Clear Aligners, Blood A+, Type II Diabetes" },
    { role: "Super Admin", email: "superadmin@medinexus.in", desc: "Multi-tenant SaaS & subscriptions" },
  ];

  function fillDemo(demoEmail: string) {
    setLoginEmail(demoEmail);
    setLoginPassword("Password@123");
    setLoginError("");
    setActiveTab("SIGN_IN");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectUrl || "/app");
      router.refresh();
    } catch (err: any) {
      setLoginError(err.message || "An unexpected error occurred during login");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    try {
      const payload: any = {
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        accountType: regAccountType,
      };

      if (regAccountType === "DOCTOR") {
        payload.specialty = regSpecialty;
        payload.qualification = regQualification;
        payload.regNumber = regRegNumber || `MDC-${Math.floor(10000 + Math.random() * 90000)}`;
        payload.experienceYears = Number(regExperience);
        payload.consultationFee = Number(regFee);
      } else if (regAccountType === "CLINIC_OWNER") {
        payload.clinicName = regClinicName;
        payload.city = regCity;
      } else if (regAccountType === "STAFF") {
        payload.staffRole = regStaffRole;
      } else if (regAccountType === "PATIENT") {
        payload.age = regAge ? Number(regAge) : undefined;
        payload.gender = regGender;
        payload.city = regCity;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      router.push(data.redirectUrl || "/app");
      router.refresh();
    } catch (err: any) {
      setRegError(err.message || "Failed to create account. Please try again.");
    } finally {
      setRegLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-sm">
            <Shield className="w-5 h-5 text-teal-200" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            MediNexus OS
          </span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Apex Dental & Aesthetic Lounge
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to your authorized medical workspace or create your personal clinic account.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-7 px-5 sm:px-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          {/* Main Auth Tabs */}
          <div className="flex border-b border-slate-200 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("SIGN_IN")}
              className={`flex-1 pb-3 text-center border-b-2 transition ${
                activeTab === "SIGN_IN"
                  ? "border-teal-800 text-teal-900 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Sign In (Existing Accounts & Demos)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("REGISTER")}
              className={`flex-1 pb-3 text-center border-b-2 transition ${
                activeTab === "REGISTER"
                  ? "border-teal-800 text-teal-900 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              Create Real Account (Sign Up)
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: SIGN IN (Real Logins + Demo Fast-Fill)             */}
          {/* ========================================================= */}
          {activeTab === "SIGN_IN" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@clinic.in or patient@example.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400">Demo: Password@123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 focus:outline-none transition shadow-sm disabled:opacity-50"
                >
                  {loginLoading ? "Authenticating Session..." : "Sign In to Workspace"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Fast-Fill Demo Credentials */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Fast-Fill Demo Profiles</span>
                  </span>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                    1-Click Test
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc.email)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition text-xs flex justify-between items-center group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-900 block text-[11px] truncate group-hover:text-teal-900">
                          {acc.role}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">{acc.email}</span>
                      </div>
                      <span className="text-[10px] font-mono text-teal-700 bg-slate-100 group-hover:bg-teal-700 group-hover:text-white px-2 py-1 rounded-lg font-bold shrink-0 transition">
                        Fill
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: REGISTER / CREATE REAL ACCOUNT                     */}
          {/* ========================================================= */}
          {activeTab === "REGISTER" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {regError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Role Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegAccountType("PATIENT")}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      regAccountType === "PATIENT"
                        ? "border-teal-800 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-800"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <User className="w-4 h-4 text-teal-700" />
                    <span className="text-xs">Patient</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegAccountType("DOCTOR")}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      regAccountType === "DOCTOR"
                        ? "border-teal-800 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-800"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-teal-700" />
                    <span className="text-xs">Doctor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegAccountType("CLINIC_OWNER")}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      regAccountType === "CLINIC_OWNER"
                        ? "border-teal-800 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-800"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Building className="w-4 h-4 text-teal-700" />
                    <span className="text-xs">Clinic Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegAccountType("STAFF")}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      regAccountType === "STAFF"
                        ? "border-teal-800 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-800"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-teal-700" />
                    <span className="text-xs">Desk Staff</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Common Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder={regAccountType === "DOCTOR" ? "Dr. Full Name" : "Your Full Name"}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (Login ID)
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password (Min 6 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>
                </div>

                {/* Conditional: DOCTOR Fields */}
                {regAccountType === "DOCTOR" && (
                  <div className="bg-teal-50/60 rounded-xl p-3 border border-teal-100 space-y-3">
                    <span className="text-[11px] font-bold text-teal-900 block">
                      Doctor Clinical Credentials
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Medical / Dental Specialty
                        </label>
                        <input
                          type="text"
                          required
                          value={regSpecialty}
                          onChange={(e) => setRegSpecialty(e.target.value)}
                          placeholder="e.g. Prosthodontist, Dermatologist"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Qualifications
                        </label>
                        <input
                          type="text"
                          required
                          value={regQualification}
                          onChange={(e) => setRegQualification(e.target.value)}
                          placeholder="e.g. BDS, MDS, MBBS, MD"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Medical Council Reg Number
                        </label>
                        <input
                          type="text"
                          value={regRegNumber}
                          onChange={(e) => setRegRegNumber(e.target.value)}
                          placeholder="e.g. MDC-74921 / MMC-2015"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Consultation Fee (₹)
                        </label>
                        <input
                          type="number"
                          value={regFee}
                          onChange={(e) => setRegFee(e.target.value)}
                          placeholder="500"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional: CLINIC OWNER Fields */}
                {regAccountType === "CLINIC_OWNER" && (
                  <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 space-y-3">
                    <span className="text-[11px] font-bold text-blue-900 block">
                      Clinic Practice Configuration
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Clinic Practice Name
                        </label>
                        <input
                          type="text"
                          value={regClinicName}
                          onChange={(e) => setRegClinicName(e.target.value)}
                          placeholder="e.g. Dr. Kulkarni Dental Lounge"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                          Practice City
                        </label>
                        <input
                          type="text"
                          value={regCity}
                          onChange={(e) => setRegCity(e.target.value)}
                          placeholder="Pune / Mumbai"
                          className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional: STAFF Fields */}
                {regAccountType === "STAFF" && (
                  <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Assigned Floor Staff Role
                    </label>
                    <select
                      value={regStaffRole}
                      onChange={(e) => setRegStaffRole(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="RECEPTIONIST">Front Desk Receptionist (Check-ins & Bookings)</option>
                      <option value="ACCOUNTANT">Billing Accountant (Invoices & Collections)</option>
                    </select>
                  </div>
                )}

                {/* Conditional: PATIENT Fields */}
                {regAccountType === "PATIENT" && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Age (Years)
                      </label>
                      <input
                        type="number"
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value)}
                        placeholder="e.g. 32"
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        Gender
                      </label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 focus:outline-none transition shadow-sm disabled:opacity-50"
                >
                  {regLoading ? "Creating Real Account..." : `Complete Registration as ${regAccountType}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-teal-700 hover:underline">
            ← Back to Public Clinic Website
          </Link>
        </div>
      </div>
    </div>
  );
}
