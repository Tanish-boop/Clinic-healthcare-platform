import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ShieldAlert, Building, CheckCircle2, AlertTriangle, ExternalLink, Users, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const session = await getSession();

  if (!session || !session.isSuperAdmin) {
    redirect("/app");
  }

  const [clinics, plans, totalUsers, totalAppointments] = await Promise.all([
    db.clinic.findMany({
      include: {
        subscription: {
          include: { plan: true },
        },
        _count: {
          select: {
            doctors: true,
            patients: true,
            appointments: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.subscriptionPlan.findMany(),
    db.user.count(),
    db.appointment.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Governance Cockpit</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Multi-Tenant SaaS Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-tenant provisioning, subscription tiers, and operational health. Clinical records are isolated.
          </p>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-xs text-slate-500 font-semibold block">Total Subscribed Clinics</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {clinics.length}
          </span>
          <span className="text-[10px] text-teal-700">Multi-tenant instances</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-xs text-slate-500 font-semibold block">Total Platform Users</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {totalUsers}
          </span>
          <span className="text-[10px] text-slate-400">Doctors, staff & patients</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-xs text-slate-500 font-semibold block">Total Appointments Handled</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {totalAppointments}
          </span>
          <span className="text-[10px] text-slate-400">Scheduled through MediNexus</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-xs text-slate-500 font-semibold block">Subscription Plans</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {plans.length} Tiers
          </span>
          <span className="text-[10px] text-slate-400">Solo, Pro & Enterprise</span>
        </div>
      </div>

      {/* Clinic Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="font-bold text-slate-900">Provisioned Clinic Tenants</span>
          <span>Tenant Data Isolation Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Clinic Tenant</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4 text-center">Doctors</th>
                <th className="py-3 px-4 text-center">Patients</th>
                <th className="py-3 px-4 text-center">Appointments</th>
                <th className="py-3 px-4 text-center">Tenant Status</th>
                <th className="py-3 px-4 text-right">Live URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clinics.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] font-mono text-teal-700">/{c.slug}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {c.area ? `${c.area}, ` : ""}{c.city}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">
                      {c.subscription?.plan?.name || "Trial / Standard"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {c._count.doctors}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {c._count.patients}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {c._count.appointments}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        c.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/c/${c.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
