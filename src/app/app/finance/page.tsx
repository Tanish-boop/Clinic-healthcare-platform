import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFinancialSummary } from "@/services/billingService";
import { FinanceManager } from "@/components/app/FinanceManager";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const session = await getSession();
  const clinicId = session?.clinicId || (await db.clinic.findFirst())?.id;

  if (!clinicId) return <div>No clinic found</div>;

  const [summary, invoices, expenses, patients, services, categories] = await Promise.all([
    getFinancialSummary(clinicId),
    db.invoice.findMany({
      where: { clinicId },
      include: {
        patient: { select: { id: true, fullName: true, phone: true } },
        items: true,
        payments: true,
      },
      orderBy: { invoiceDate: "desc" },
      take: 50,
    }),
    db.expense.findMany({
      where: { clinicId },
      include: {
        category: true,
      },
      orderBy: { paymentDate: "desc" },
      take: 50,
    }),
    db.patient.findMany({
      where: { clinicId },
      select: { id: true, fullName: true, phone: true },
      take: 100,
    }),
    db.clinicService.findMany({
      where: { clinicId, isActive: true },
      select: { id: true, name: true, price: true },
    }),
    db.expenseCategory.findMany({
      where: { clinicId },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Clinic Financial Ledger & Accounting
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Reconciled revenue collections, UPI/Cash receipts, operational costs, and surplus accounting
        </p>
      </div>

      <FinanceManager
        clinicId={clinicId}
        summary={summary}
        invoices={invoices}
        expenses={expenses}
        patients={patients}
        services={services}
        expenseCategories={categories}
      />
    </div>
  );
}
