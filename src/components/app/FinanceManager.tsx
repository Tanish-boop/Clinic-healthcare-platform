"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  CreditCard,
  Plus,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Download,
  Printer,
  X,
  Building,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { InvoiceReceiptSlip } from "@/components/public/InvoiceReceiptSlip";

interface InvoiceItemData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string | Date;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  patient: {
    id: string;
    fullName: string;
    phone: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  payments: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string | Date;
  }>;
}

interface ExpenseItemData {
  id: string;
  title: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string | Date;
  vendorName?: string | null;
  category: {
    name: string;
  };
}

interface FinanceManagerProps {
  clinicId: string;
  summary: {
    grossInvoiced: number;
    netCollections: number;
    totalOutstanding: number;
    totalExpenses: number;
    operatingSurplus: number;
    paymentsByMethod: Record<string, number>;
    expensesByCategory: Record<string, number>;
  };
  invoices: InvoiceItemData[];
  expenses: ExpenseItemData[];
  patients: Array<{ id: string; fullName: string; phone: string }>;
  services: Array<{ id: string; name: string; price: number }>;
  expenseCategories: Array<{ id: string; name: string }>;
}

export function FinanceManager({
  clinicId,
  summary,
  invoices: initialInvoices,
  expenses: initialExpenses,
  patients,
  services,
  expenseCategories,
}: FinanceManagerProps) {
  const [activeTab, setActiveTab] = useState<"INVOICES" | "EXPENSES" | "ANALYTICS">("INVOICES");
  const [invoices, setInvoices] = useState<InvoiceItemData[]>(initialInvoices);
  const [expenses, setExpenses] = useState<ExpenseItemData[]>(initialExpenses);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceItemData | null>(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<InvoiceItemData | null>(null);

  // New Invoice Form
  const [invPatientId, setInvPatientId] = useState(patients[0]?.id || "");
  const [invItems, setInvItems] = useState([
    { description: services[0]?.name || "Dental Consultation", quantity: 1, unitPrice: services[0]?.price || 500 },
  ]);
  const [invDiscount, setInvDiscount] = useState<number | "">("");
  const [invNotes, setInvNotes] = useState("");
  const [isCreatingInv, setIsCreatingInv] = useState(false);

  // Payment Form
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payMethod, setPayMethod] = useState<"UPI" | "CASH" | "CREDIT_CARD" | "BANK_TRANSFER">("UPI");
  const [payRef, setPayRef] = useState("");
  const [isRecordingPay, setIsRecordingPay] = useState(false);

  // Expense Form
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState<number | "">("");
  const [expCatId, setExpCatId] = useState(expenseCategories[0]?.id || "");
  const [expMethod, setExpMethod] = useState("UPI");
  const [expVendor, setExpVendor] = useState("");
  const [isRecordingExp, setIsRecordingExp] = useState(false);

  function addInvLine() {
    setInvItems([...invItems, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateInvLine(idx: number, field: string, val: any) {
    const updated = [...invItems];
    (updated[idx] as any)[field] = val;
    setInvItems(updated);
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    setIsCreatingInv(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: invPatientId,
          items: invItems,
          discountAmount: invDiscount ? Number(invDiscount) : 0,
          notes: invNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInvoices([data.invoice, ...invoices]);
        setIsInvoiceModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingInv(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !payAmount) return;
    setIsRecordingPay(true);
    try {
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceForPayment.id,
          amount: Number(payAmount),
          paymentMethod: payMethod,
          referenceNumber: payRef,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // update local state
        setInvoices((prev) =>
          prev.map((inv) => {
            if (inv.id === selectedInvoiceForPayment.id) {
              const newPaid = inv.paidAmount + Number(payAmount);
              const newDue = Math.max(0, inv.totalAmount - newPaid);
              return {
                ...inv,
                paidAmount: newPaid,
                balanceDue: newDue,
                status: newDue <= 0.01 ? "PAID" : "PARTIALLY_PAID",
                payments: [...inv.payments, data.payment],
              };
            }
            return inv;
          })
        );
        setIsPaymentModalOpen(false);
        setPayAmount("");
        setPayRef("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecordingPay(false);
    }
  }

  async function handleRecordExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!expAmount) return;
    setIsRecordingExp(true);
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: expCatId,
          title: expTitle,
          amount: Number(expAmount),
          paymentMethod: expMethod,
          vendorName: expVendor,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses([
          {
            ...data.expense,
            category: {
              name: expenseCategories.find((c) => c.id === expCatId)?.name || "Expense",
            },
          },
          ...expenses,
        ]);
        setIsExpenseModalOpen(false);
        setExpTitle("");
        setExpAmount("");
        setExpVendor("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecordingExp(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Reconciled Financial Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Gross Invoiced</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(summary.grossInvoiced)}
          </div>
          <span className="text-[10px] text-slate-400">Total bills generated</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Net Collections</span>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {formatCurrency(summary.netCollections)}
          </div>
          <span className="text-[10px] text-slate-400">Cash & UPI deposited</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-amber-700 uppercase block">Outstanding Balance</span>
          <div className="text-xl font-extrabold text-amber-700 mt-1">
            {formatCurrency(summary.totalOutstanding)}
          </div>
          <span className="text-[10px] text-slate-400">Unpaid patient dues</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-red-700 uppercase block">Operating Expenses</span>
          <div className="text-xl font-extrabold text-red-700 mt-1">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <span className="text-[10px] text-slate-400">Rent, salary, materials</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle">
          <span className="text-[11px] font-semibold text-teal-800 uppercase block">Operating Surplus</span>
          <div className="text-xl font-extrabold text-teal-900 mt-1">
            {formatCurrency(summary.operatingSurplus)}
          </div>
          <span className="text-[10px] text-slate-400">Net collected minus costs</span>
        </div>
      </div>

      {/* Navigation tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("INVOICES")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "INVOICES"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Invoices & Billing ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("EXPENSES")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "EXPENSES"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Clinic Expenses ({expenses.length})
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold transition"
          >
            + Add Expense
          </button>
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INVOICES TABLE */}
      {activeTab === "INVOICES" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4 text-right">Total Bill</th>
                  <th className="py-3 px-4 text-right">Collected</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const statusColors: Record<string, string> = {
                    PAID: "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold",
                    PARTIALLY_PAID: "bg-amber-50 text-amber-800 border-amber-300 font-bold",
                    PENDING: "bg-red-50 text-red-800 border-red-200 font-bold",
                  };
                  const color = statusColors[inv.status] || "bg-slate-100 text-slate-700";

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {format(new Date(inv.invoiceDate), "dd MMM yyyy")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{inv.patient.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{inv.patient.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        {formatCurrency(inv.paidAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {formatCurrency(inv.balanceDue)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${color}`}>
                          {inv.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInvoiceForPayment(inv);
                                setPayAmount(inv.balanceDue);
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded text-[11px] font-semibold"
                            >
                              Collect Due
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                            title="Print Invoice / Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSES TABLE */}
      {activeTab === "EXPENSES" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-500">
                      {format(new Date(e.paymentDate), "dd MMM yyyy")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{e.title}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-700">
                        {e.category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{e.vendorName || "-"}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{e.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-bold text-red-700">
                      -{formatCurrency(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Record Payment for {selectedInvoiceForPayment.invoiceNumber}
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span>Patient:</span>
                <strong>{selectedInvoiceForPayment.patient.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Outstanding Due:</span>
                <strong className="text-red-700">{formatCurrency(selectedInvoiceForPayment.balanceDue)}</strong>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : "")}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CASH">Cash at Desk</option>
                  <option value="CREDIT_CARD">Credit / Debit Card Swipe</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UPI UTR / Card Txn Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/329108429102"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPay}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
                >
                  {isRecordingPay ? "Processing..." : "Generate Receipt & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Record Operating Expense</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Composite kits, autoclave pouches"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={expCatId}
                  onChange={(e) => setExpCatId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="Agency name"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingExp}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
                >
                  {isRecordingExp ? "Recording..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice & Payment Receipt Slip Modal */}
      {selectedInvoiceForPrint && (
        <InvoiceReceiptSlip
          isModal={true}
          onClose={() => setSelectedInvoiceForPrint(null)}
          data={{
            invoiceNumber: selectedInvoiceForPrint.invoiceNumber,
            invoiceDate: selectedInvoiceForPrint.invoiceDate,
            patientName: selectedInvoiceForPrint.patient.fullName,
            patientPhone: selectedInvoiceForPrint.patient.phone,
            items: selectedInvoiceForPrint.items,
            totalAmount: selectedInvoiceForPrint.totalAmount,
            paidAmount: selectedInvoiceForPrint.paidAmount,
            balanceDue: selectedInvoiceForPrint.balanceDue,
            status: selectedInvoiceForPrint.status,
            payments: selectedInvoiceForPrint.payments,
          }}
        />
      )}
    </div>
  );
}
