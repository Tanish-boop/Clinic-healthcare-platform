import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import {
  Calendar,
  Users,
  CreditCard,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { ReceptionConsole } from "@/components/app/ReceptionConsole";

export const dynamic = "force-dynamic";

interface AppOverviewPageProps {
  searchParams?: {
    view?: string;
  };
}

export default async function AppOverviewPage({ searchParams }: AppOverviewPageProps) {
  const session = await getSession();
  const clinicId = session?.clinicId || (await db.clinic.findFirst())?.id;

  if (!clinicId) {
    return <div>No active clinic found</div>;
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
  const todayEnd = new Date(`${todayStr}T23:59:59.999Z`);

  // 1. Fetch Today's Appointments & Clinic Metadata
  const [clinic, doctors, services, todayAppointments] = await Promise.all([
    db.clinic.findUnique({ where: { id: clinicId } }),
    db.doctorProfile.findMany({
      where: { clinicId, isActive: true },
      include: { user: { select: { fullName: true } } },
    }),
    db.clinicService.findMany({
      where: { clinicId, isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    db.appointment.findMany({
      where: {
        clinicId,
        appointmentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        patient: true,
        doctor: {
          include: { user: { select: { fullName: true } } },
        },
        service: true,
      },
      orderBy: { startTime: "asc" },
    }),
  ]);

  // 2. Counts
  const totalPatients = await db.patient.count({ where: { clinicId } });
  const inConsultationCount = todayAppointments.filter((a) => a.status === "IN_CONSULTATION").length;
  const checkedInCount = todayAppointments.filter((a) => a.status === "CHECKED_IN").length;
  const completedTodayCount = todayAppointments.filter((a) => a.status === "COMPLETED").length;

  // 3. Financials
  const todayPayments = await db.payment.findMany({
    where: {
      invoice: { clinicId },
      paymentDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      invoice: {
        include: { patient: true },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

  const todayCollected = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const pendingInvoices = await db.invoice.findMany({
    where: {
      clinicId,
      status: { in: ["PENDING", "PARTIALLY_PAID"] },
    },
  });

  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  // Format reception queue
  const receptionAppointments = todayAppointments.map((a, idx) => ({
    id: a.id,
    bookingReference: a.bookingReference,
    tokenNumber: idx + 1,
    patientName: a.patient.fullName,
    patientPhone: a.patient.phone,
    patientAge: a.patient.age,
    patientGender: a.patient.gender,
    patientIdNumber: a.patient.patientIdNumber,
    doctorName: a.doctor.user.fullName,
    doctorSpecialty: a.doctor.specialty,
    doctorQualification: a.doctor.qualification,
    doctorRegNumber: a.doctor.regNumber,
    serviceName: a.service?.name || "Clinical Consultation",
    price: a.service?.price || 1000,
    startTime: a.startTime,
    status: a.status,
    chiefComplaint: a.chiefComplaint,
  }));

  const isReceptionistRole = session?.role === "RECEPTIONIST";
  const isReceptionView =
    searchParams?.view === "reception" || (isReceptionistRole && searchParams?.view !== "overview");

  return (
    <div className="space-y-6">
      {/* View Switcher: Reception Desk vs Operational Analytics */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl w-fit text-xs font-bold">
        <Link
          href="/app?view=reception"
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            isReceptionView ? "bg-white text-teal-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🛎️ Front Desk Reception Console</span>
        </Link>
        <Link
          href="/app?view=overview"
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            !isReceptionView ? "bg-white text-teal-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>📊 Operations & Financial Cockpit</span>
        </Link>
      </div>

      {isReceptionView ? (
        <ReceptionConsole
          initialAppointments={receptionAppointments}
          clinicName={clinic?.name || "Apex Dental & Aesthetic Lounge"}
          clinicPhone={clinic?.primaryPhone || "+91 97655 39107"}
          doctors={doctors.map((d) => ({
            id: d.id,
            name: d.user.fullName,
            specialty: d.specialty,
          }))}
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
          }))}
        />
      ) : (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Clinic Operations & Financial Cockpit
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Live queue, doctor schedules, and billing summary for {format(new Date(), "EEEE, dd MMMM yyyy")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/app/appointments"
                className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Manage Appointments</span>
              </Link>
              <Link
                href="/app/doctor"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Cockpit</span>
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Appointments */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Today&apos;s Appointments</span>
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {todayAppointments.length}
                </span>
                <span className="text-xs text-emerald-700 font-medium">
                  {completedTodayCount} Completed
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {checkedInCount} waiting in queue • {inConsultationCount} inside
              </div>
            </div>

            {/* Total Patients */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Registered Patients</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {totalPatients}
                </span>
                <span className="text-xs text-blue-700 font-medium">Active Records</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Full demographic & visit histories
              </div>
            </div>

            {/* Today's Collections */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Collections Today</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(todayCollected)}
                </span>
                <span className="text-xs text-emerald-700 font-medium">
                  {todayPayments.length} txns
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Reconciled UPI & Cash payments
              </div>
            </div>

            {/* Outstanding Receivables */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Pending Balances</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-amber-700">
                  {formatCurrency(totalOutstanding)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {pendingInvoices.length} invoices awaiting full settlement
              </div>
            </div>
          </div>

          {/* Quick Schedule Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Today&apos;s OPD Consultations</h3>
                  <p className="text-xs text-slate-500">Chronological patient appointments</p>
                </div>
                <Link
                  href="/app/appointments"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  View Full Board →
                </Link>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No appointments scheduled for today.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todayAppointments.map((apt) => (
                    <div key={apt.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{apt.patient.fullName}</div>
                        <div className="text-slate-500 text-[11px]">
                          {apt.doctor.user.fullName} • {apt.service?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800">{apt.startTime}</span>
                        <div className="text-[10px] text-teal-700 font-semibold">{apt.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Collections */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Recent Collections</h3>
                <Link href="/app/finance" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
                  Invoices →
                </Link>
              </div>

              {todayPayments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No payments recorded today.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{p.invoice.patient.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {p.receiptNumber} • {p.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-700">+{formatCurrency(p.amount)}</div>
                        <div className="text-[10px] text-slate-400">
                          {format(new Date(p.paymentDate), "hh:mm a")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
