"use client";

import { useState, useEffect } from "react";
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
  KeyRound,
  RefreshCw,
  X,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SIGN_IN" | "REGISTER">("SIGN_IN");

  // Always default to Sign In & Demos so clicking "Sign Up" lands on Existing & Demos
  useEffect(() => {
    setActiveTab("SIGN_IN");
  }, []);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Forgot Password / Reset via OTP State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: request, 2: verify & set, 3: success
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotDevCode, setForgotDevCode] = useState("");

  // Register State
  const [regAccountType, setRegAccountType] = useState<"PATIENT" | "DOCTOR" | "CLINIC_OWNER" | "STAFF">("PATIENT");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  // Register OTP Verification State
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpInputOpen, setEmailOtpInputOpen] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailOtpCooldown, setEmailOtpCooldown] = useState(0);
  const [emailDevCode, setEmailDevCode] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");

  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpInputOpen, setPhoneOtpInputOpen] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneOtpCooldown, setPhoneOtpCooldown] = useState(0);
  const [phoneDevCode, setPhoneDevCode] = useState("");
  const [phoneOtpError, setPhoneOtpError] = useState("");

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

  // Countdown timer for OTP cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setForgotCooldown((c) => (c > 0 ? c - 1 : 0));
      setEmailOtpCooldown((c) => (c > 0 ? c - 1 : 0));
      setPhoneOtpCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // OTP Handlers for Password Reset
  async function handleSendForgotOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError("Please enter your registered email address or mobile number.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          type: "PASSWORD_RESET",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch OTP");
      }

      setForgotCooldown(60);
      if (data.devCode) {
        setForgotDevCode(data.devCode);
        setForgotOtp(data.devCode); // Auto-populate for seamless pairing
      }
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.message || "Could not send verification OTP");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (forgotOtp.length !== 6) {
      setForgotError("Please enter the 6-digit OTP code received.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError("New password must be at least 6 characters.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          code: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setForgotStep(3);
      if (forgotIdentifier.includes("@")) {
        setLoginEmail(forgotIdentifier);
      }
    } catch (err: any) {
      setForgotError(err.message || "Password reset failed");
    } finally {
      setForgotLoading(false);
    }
  }

  // OTP Handlers for Registration Email Verification
  async function handleSendEmailOtp() {
    if (!regEmail || !regEmail.includes("@")) {
      setEmailOtpError("Enter a valid email first");
      return;
    }
    setEmailOtpSending(true);
    setEmailOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regEmail.trim(), type: "EMAIL_VERIFY", channel: "EMAIL" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setEmailOtpCooldown(60);
      setEmailOtpInputOpen(true);
      if (data.devCode) {
        setEmailDevCode(data.devCode);
        setEmailOtpCode(data.devCode);
      }
    } catch (err: any) {
      setEmailOtpError(err.message || "Failed to send OTP");
    } finally {
      setEmailOtpSending(false);
    }
  }

  async function handleVerifyEmailOtp() {
    if (emailOtpCode.trim().length !== 6) {
      setEmailOtpError("Enter 6-digit OTP");
      return;
    }
    setEmailOtpSending(true);
    setEmailOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regEmail.trim(), code: emailOtpCode.trim(), type: "EMAIL_VERIFY" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");
      setEmailVerified(true);
      setEmailOtpInputOpen(false);
    } catch (err: any) {
      setEmailOtpError(err.message || "Verification failed");
    } finally {
      setEmailOtpSending(false);
    }
  }

  // OTP Handlers for Registration Phone Verification
  async function handleSendPhoneOtp() {
    if (!regPhone || regPhone.replace(/\D/g, "").length < 10) {
      setPhoneOtpError("Enter a valid 10-digit number");
      return;
    }
    setPhoneOtpSending(true);
    setPhoneOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regPhone.trim(), type: "PHONE_VERIFY", channel: "SMS" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send SMS OTP");
      setPhoneOtpCooldown(60);
      setPhoneOtpInputOpen(true);
      if (data.devCode) {
        setPhoneDevCode(data.devCode);
        setPhoneOtpCode(data.devCode);
      }
    } catch (err: any) {
      setPhoneOtpError(err.message || "Failed to send SMS OTP");
    } finally {
      setPhoneOtpSending(false);
    }
  }

  async function handleVerifyPhoneOtp() {
    if (phoneOtpCode.trim().length !== 6) {
      setPhoneOtpError("Enter 6-digit OTP");
      return;
    }
    setPhoneOtpSending(true);
    setPhoneOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: regPhone.trim(), code: phoneOtpCode.trim(), type: "PHONE_VERIFY" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid SMS OTP");
      setPhoneVerified(true);
      setPhoneOtpInputOpen(false);
    } catch (err: any) {
      setPhoneOtpError(err.message || "Verification failed");
    } finally {
      setPhoneOtpSending(false);
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
              Sign In (Existing & Demos)
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

                  <div className="flex justify-end mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotOpen(true);
                        setForgotStep(1);
                        setForgotError("");
                        if (loginEmail) setForgotIdentifier(loginEmail);
                      }}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline inline-flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      Forgot password? Reset via OTP
                    </button>
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

              {/* Fast-Fill Demo Credentials (Dark High-Contrast Card) */}
              <div className="mt-6 bg-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                        Fast-Fill Demo Profiles
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Tap any role to auto-load credentials & test instantly
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold shrink-0">
                    1-Click Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc.email)}
                      className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-teal-950/80 border border-slate-800 hover:border-teal-500/80 transition text-xs flex justify-between items-center group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-slate-100 block text-xs truncate group-hover:text-teal-300">
                          {acc.role}
                        </span>
                        <span className="text-[10px] text-teal-300/90 font-mono block truncate mt-0.5">
                          {acc.email}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white bg-teal-700 hover:bg-teal-600 group-hover:bg-teal-500 group-hover:text-slate-950 px-2.5 py-1 rounded-lg shrink-0 transition shadow-xs">
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
                {/* Full Legal Name */}
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

                {/* Mobile Number + SMS OTP Verification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      10-Digit Mobile Number
                    </label>
                    {phoneVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={phoneOtpSending || phoneOtpCooldown > 0 || !regPhone}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-900 disabled:opacity-50"
                      >
                        {phoneOtpCooldown > 0 ? `Resend SMS OTP (${phoneOtpCooldown}s)` : "Verify via SMS OTP"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value);
                        setPhoneVerified(false);
                      }}
                      placeholder="9823012345"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  {/* Inline SMS OTP Verification Drawer */}
                  {phoneOtpInputOpen && !phoneVerified && (
                    <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-teal-900">
                        <span>Enter 6-digit SMS code</span>
                        {phoneDevCode && (
                          <button
                            type="button"
                            onClick={() => setPhoneOtpCode(phoneDevCode)}
                            className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono hover:bg-teal-200"
                          >
                            Auto-fill dev code: {phoneDevCode}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={phoneOtpCode}
                          onChange={(e) => setPhoneOtpCode(e.target.value)}
                          placeholder="••••••"
                          className="flex-1 px-3 py-1.5 text-center font-mono tracking-widest text-xs rounded-lg border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyPhoneOtp}
                          disabled={phoneOtpSending}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 disabled:opacity-50"
                        >
                          {phoneOtpSending ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                      {phoneOtpError && (
                        <p className="text-[10px] text-red-600">{phoneOtpError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Address + Email OTP Verification */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address (Login ID)
                    </label>
                    {emailVerified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpSending || emailOtpCooldown > 0 || !regEmail}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-900 disabled:opacity-50"
                      >
                        {emailOtpCooldown > 0 ? `Resend Email OTP (${emailOtpCooldown}s)` : "Verify via Email OTP"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setEmailVerified(false);
                      }}
                      placeholder="you@domain.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </div>

                  {/* Inline Email OTP Verification Drawer */}
                  {emailOtpInputOpen && !emailVerified && (
                    <div className="p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-teal-900">
                        <span>Enter 6-digit email code</span>
                        {emailDevCode && (
                          <button
                            type="button"
                            onClick={() => setEmailOtpCode(emailDevCode)}
                            className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono hover:bg-teal-200"
                          >
                            Auto-fill dev code: {emailDevCode}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(e) => setEmailOtpCode(e.target.value)}
                          placeholder="••••••"
                          className="flex-1 px-3 py-1.5 text-center font-mono tracking-widest text-xs rounded-lg border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={emailOtpSending}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 disabled:opacity-50"
                        >
                          {emailOtpSending ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                      {emailOtpError && (
                        <p className="text-[10px] text-red-600">{emailOtpError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Create Password (Min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
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

      {/* ========================================================= */}
      {/* FORGOT PASSWORD / OTP RESET MODAL                         */}
      {/* ========================================================= */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setIsForgotOpen(false);
                setForgotStep(1);
                setForgotError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Password via OTP
                </h3>
                <p className="text-xs text-slate-500">
                  Instant email & mobile verification
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Identifier */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email or 10-Digit Mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="name@example.com or 9823012345"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    We will dispatch a 6-digit cryptographic security code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotIdentifier.trim()}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition shadow-sm disabled:opacity-50"
                >
                  {forgotLoading ? "Sending OTP Code..." : "Send Verification OTP"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-950 flex items-center justify-between">
                  <span className="truncate">Sent to: <strong>{forgotIdentifier}</strong></span>
                  <button
                    type="button"
                    onClick={handleSendForgotOtp}
                    disabled={forgotCooldown > 0 || forgotLoading}
                    className="text-[10px] font-bold text-teal-800 hover:underline shrink-0 ml-2 disabled:opacity-50"
                  >
                    {forgotCooldown > 0 ? `Resend (${forgotCooldown}s)` : "Resend OTP"}
                  </button>
                </div>

                {forgotDevCode && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center justify-between">
                    <span>💡 [Dev Mode] Instant OTP: <strong>{forgotDevCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => setForgotOtp(forgotDevCode)}
                      className="text-[10px] bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded font-bold"
                    >
                      Fill
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2 text-center font-mono tracking-widest text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length !== 6}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition shadow-sm disabled:opacity-50"
                  >
                    {forgotLoading ? "Validating OTP & Updating..." : "Set New Password"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success Confirmation */}
            {forgotStep === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Password Successfully Reset!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your clinic credentials have been safely updated. You can now log into your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(false);
                    setActiveTab("SIGN_IN");
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition"
                >
                  Proceed to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
