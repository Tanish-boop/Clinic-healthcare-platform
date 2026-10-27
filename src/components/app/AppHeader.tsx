"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Bell, ExternalLink } from "lucide-react";

interface AppHeaderProps {
  userName: string;
  userRole: string;
  clinicSlug?: string;
}

export function AppHeader({ userName, userRole, clinicSlug }: AppHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const roleLabels: Record<string, { label: string; color: string }> = {
    SUPERADMIN: { label: "Platform Super Admin", color: "bg-purple-100 text-purple-800 border-purple-200" },
    CLINIC_OWNER: { label: "Clinic Owner / Director", color: "bg-blue-100 text-blue-800 border-blue-200" },
    DOCTOR: { label: "Consultant Doctor", color: "bg-teal-100 text-teal-800 border-teal-200" },
    RECEPTIONIST: { label: "Front Desk Receptionist", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    ACCOUNTANT: { label: "Clinic Accountant", color: "bg-amber-100 text-amber-800 border-amber-200" },
    PATIENT: { label: "Patient", color: "bg-slate-100 text-slate-800 border-slate-200" },
  };

  const badge = roleLabels[userRole] || { label: userRole, color: "bg-slate-100 text-slate-700" };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          Clinical Operations Cockpit
        </h1>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User identification */}
        <div className="flex items-center gap-2 text-right">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">{userName}</div>
            <div className="text-[10px] text-slate-500 capitalize">{userRole.toLowerCase().replace("_", " ")}</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 p-1.5 rounded hover:bg-slate-50 transition"
          title="Sign out of workspace"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
