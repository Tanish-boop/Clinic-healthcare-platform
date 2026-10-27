"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Shield,
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Users,
  CreditCard,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  ExternalLink,
  Search,
  Plus,
  LogOut,
  User,
  ChevronDown,
  Globe,
  Building2,
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface ClinicCommandNavProps {
  userName: string;
  userRole: string;
  isSuperAdmin?: boolean;
  clinicId?: string;
  clinicSlug?: string;
  clinicName?: string;
}

export function ClinicCommandNav({
  userName,
  userRole,
  isSuperAdmin = false,
  clinicId,
  clinicSlug = "apex-dental-pune",
  clinicName = "Apex Dental & Aesthetic Lounge",
}: ClinicCommandNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [outsideDropdownOpen, setOutsideDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOutsideDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/app/patients?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const roleBadges: Record<string, { label: string; bg: string; text: string }> = {
    SUPERADMIN: { label: "Super Admin", bg: "bg-purple-50 border-purple-200", text: "text-purple-800" },
    CLINIC_OWNER: { label: "Clinic Director", bg: "bg-blue-50 border-blue-200", text: "text-blue-800" },
    DOCTOR: { label: "Consultant Doctor", bg: "bg-teal-50 border-teal-200", text: "text-teal-800" },
    RECEPTIONIST: { label: "Front Desk Reception", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800" },
    ACCOUNTANT: { label: "Finance & Accounts", bg: "bg-amber-50 border-amber-200", text: "text-amber-800" },
    PATIENT: { label: "Patient", bg: "bg-slate-50 border-slate-200", text: "text-slate-800" },
  };

  const currentBadge = roleBadges[userRole] || { label: userRole, bg: "bg-slate-50 border-slate-200", text: "text-slate-700" };

  // Inside Clinic Navigation Links (Operational Floor)
  const insideLinks = [
    {
      label: "Overview",
      href: "/app",
      icon: LayoutDashboard,
      roles: ["SUPERADMIN", "CLINIC_OWNER", "RECEPTIONIST", "ACCOUNTANT", "DOCTOR"],
    },
    {
      label: "Appointments & Queue",
      href: "/app/appointments",
      icon: Calendar,
      roles: ["SUPERADMIN", "CLINIC_OWNER", "RECEPTIONIST", "DOCTOR"],
    },
    {
      label: "Doctor Cockpit (EHR)",
      href: "/app/doctor",
      icon: Stethoscope,
      roles: ["SUPERADMIN", "CLINIC_OWNER", "DOCTOR"],
    },
    {
      label: "Patient Directory",
      href: "/app/patients",
      icon: Users,
      roles: ["SUPERADMIN", "CLINIC_OWNER", "RECEPTIONIST", "ACCOUNTANT", "DOCTOR"],
    },
    {
      label: "Finance & Accounting",
      href: "/app/finance",
      icon: CreditCard,
      roles: ["SUPERADMIN", "CLINIC_OWNER", "ACCOUNTANT"],
    },
    {
      label: "Prospect Leads",
      href: "/app/prospects",
      icon: FileSpreadsheet,
      roles: ["SUPERADMIN", "CLINIC_OWNER"],
    },
    {
      label: "Clinic Admin & CMS",
      href: "/app/settings",
      icon: Settings,
      roles: ["SUPERADMIN", "CLINIC_OWNER"],
    },
    ...(isSuperAdmin
      ? [
          {
            label: "SaaS Platform",
            href: "/app/superadmin",
            icon: ShieldAlert,
            roles: ["SUPERADMIN"],
          },
        ]
      : []),
  ];

  const visibleLinks = insideLinks.filter((item) => isSuperAdmin || item.roles.includes(userRole));

  // Outside Clinic Links (Patient Facing)
  const outsideLinks = [
    { label: "Public Clinic Homepage", href: "/", desc: "Hero, credentials & booking CTA" },
    { label: "Doctor Verified Profiles", href: "/about", desc: "MDS/MD qualifications & state registrations" },
    { label: "Treatments & Fee Menu", href: "/services", desc: "Full catalog with transparent ₹ pricing" },
    { label: "Online Appointment Booking", href: "/book", desc: "Patient slot reservation widget" },
    { label: "Patient Self-Service Portal", href: "/portal", desc: "Patient access to Rx & receipts" },
    { label: "Clinic Timings & Map Directions", href: "/contact", desc: "Somwar Peth / Koregaon Park, emergency trauma" },
    { label: "Patient Policies & DPDP Terms", href: "/policies", desc: "4-hr cancellation, confidentiality & refunds" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* ------------------------------------------------------------- */}
      {/* Tier 1: Top Global Clinical Command & Inside/Outside Switcher */}
      {/* ------------------------------------------------------------- */}
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-slate-100 gap-4">
        {/* Left: Clinic Identity & Live Status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/app" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-slate-900 text-sm tracking-tight leading-none truncate max-w-[200px] md:max-w-[280px]">
                {clinicName}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-semibold tracking-wide uppercase">
                  Floor Active
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] text-slate-500">Pune / Somwar Peth</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: THE INSIDE / OUTSIDE SEGMENTED CONTROL */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-inner">
          {/* INSIDE CLINIC TAB (Active) */}
          <Link
            href="/app"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-white text-teal-900 shadow-xs border border-slate-200/60"
            title="Operational Clinic Floor (Back-Office & EHR)"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Inside Clinic</span>
            <span className="hidden md:inline-block text-[10px] font-medium text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
              Floor
            </span>
          </Link>

          {/* OUTSIDE CLINIC DROPDOWN (Patient View) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOutsideDropdownOpen(!outsideDropdownOpen)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                outsideDropdownOpen
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
              title="Patient-Facing Web Presence & Public Booking"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Outside Clinic</span>
              <span className="hidden md:inline-block text-[10px] text-slate-500 font-medium">
                Patient View
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${outsideDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Outside Dropdown Menu */}
            {outsideDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    Outside Clinic Ecosystem
                  </div>
                  <div className="text-xs text-slate-500">
                    What patients and the public see:
                  </div>
                </div>

                <div className="space-y-0.5">
                  {outsideLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      onClick={() => setOutsideDropdownOpen(false)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition group"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 flex items-center gap-1.5">
                          <span>{item.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Public Domain</span>
                  <Link
                    href="/"
                    target="_blank"
                    className="font-semibold text-teal-700 hover:underline flex items-center gap-1"
                  >
                    <span>Visit Live Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Patient Search, Quick Action, Role & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient, phone, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition"
            />
          </form>

          {/* Quick Walk-In Button */}
          <Link
            href="/app/appointments"
            className="hidden sm:inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Walk-In</span>
          </Link>

          {/* User profile & Role */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {userName}
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                {currentBadge.label}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            title="Sign out of workspace"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Tier 2: Horizontal Clinical Workflow Ribbon (Inside Navigation) */}
      {/* ------------------------------------------------------------- */}
      <div className="px-4 sm:px-6 lg:px-8 bg-slate-50/70 overflow-x-auto scrollbar-none flex items-center justify-between border-t border-slate-100">
        <nav className="flex items-center gap-1 py-1.5 min-w-max">
          {visibleLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-teal-800 shadow-xs border border-slate-200/80 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-700" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live contextual link on the right of the ribbon */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] text-slate-500 py-1.5 pl-4 shrink-0">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Shift: 10:00 AM - 07:30 PM</span>
          </span>
          <span className="text-slate-300">|</span>
          <Link
            href="/portal"
            target="_blank"
            className="text-teal-700 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Patient Portal</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
