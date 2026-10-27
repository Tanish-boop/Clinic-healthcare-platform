"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Users,
  CreditCard,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  ExternalLink,
  Shield,
} from "lucide-react";

interface AppSidebarProps {
  role?: string;
  isSuperAdmin?: boolean;
  clinicSlug?: string;
  clinicName?: string;
}

export function AppSidebar({
  role = "CLINIC_OWNER",
  isSuperAdmin = false,
  clinicSlug = "apex-dental-pune",
  clinicName = "Apex Dental",
}: AppSidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      label: "Clinic Overview",
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
      label: "Prospect Onboarding",
      href: "/app/prospects",
      icon: FileSpreadsheet,
      roles: ["SUPERADMIN", "CLINIC_OWNER"],
    },
    {
      label: "Clinic Settings & CMS",
      href: "/app/settings",
      icon: Settings,
      roles: ["SUPERADMIN", "CLINIC_OWNER"],
    },
    ...(isSuperAdmin
      ? [
          {
            label: "SaaS Super Admin",
            href: "/app/superadmin",
            icon: ShieldAlert,
            roles: ["SUPERADMIN"],
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-white text-sm tracking-tight">MediNexus OS</div>
          <div className="text-[10px] text-teal-400 font-mono">Clinic Management</div>
        </div>
      </div>

      {/* Clinic context switch indicator */}
      <div className="p-4 mx-3 my-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Active Workspace
        </div>
        <div className="font-semibold text-white text-xs truncate mt-0.5">
          {clinicName}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
          <span className="text-[10px] text-teal-400 font-medium">Verified Active</span>
          <Link
            href="/"
            target="_blank"
            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links
          .filter((item) => isSuperAdmin || item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Footer support */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div>MediNexus v1.0.0 (Prod)</div>
        <div className="text-[10px] text-slate-600">Asia/Kolkata • Encrypted EHR</div>
      </div>
    </aside>
  );
}
