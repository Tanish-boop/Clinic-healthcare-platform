"use client";

import { Shield, Printer, CheckCircle2, Clock, Calendar, MapPin, Phone, Receipt, X } from "lucide-react";
import { useRef } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { printIsolatedSlip } from "@/lib/printUtils";

export interface InvoiceReceiptSlipData {
  invoiceNumber: string;
  invoiceDate: string | Date;
  clinicName?: string | null;
  clinicAddress?: string | null;
  clinicPhone?: string | null;
  clinicGst?: string | null;
  patientName: string;
  patientPhone: string;
  patientIdNumber?: string | null;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  payments?: Array<{
    receiptNumber?: string;
    amount: number;
    paymentMethod: string;
    paymentDate?: string | Date;
  }>;
}

interface InvoiceReceiptSlipProps {
  data: InvoiceReceiptSlipData;
  onClose?: () => void;
  isModal?: boolean;
}

export function InvoiceReceiptSlip({ data, onClose, isModal = false }: InvoiceReceiptSlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    printIsolatedSlip(slipRef.current);
  }

  const invoiceDateFormatted = format(new Date(data.invoiceDate), "dd MMMM yyyy");
  const issueDateFormatted = format(new Date(), "dd MMM yyyy, hh:mm a");

  const content = (
    <div
      ref={slipRef}
      className="printable-slip-container bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-2xl mx-auto rounded-2xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0"
    >
      {/* ----------------------------------------------------------- */}
      {/* 1. CLINIC OFFICIAL LETTERHEAD HEADER                        */}
      {/* ----------------------------------------------------------- */}
      <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl print:border print:border-slate-800 shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950">
              {data.clinicName || "Apex Dental & Aesthetic Lounge"}
            </h1>
            <p className="text-[11px] text-teal-800 font-semibold tracking-wide uppercase">
              Official Tax Invoice & Clinical Payment Receipt
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
          <p className="flex items-center sm:justify-end gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>{data.clinicAddress || "Plot 42, West Avenue, Kalyani Nagar, Pune - 411006"}</span>
          </p>
          <p className="flex items-center sm:justify-end gap-1.5 font-medium">
            <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>{data.clinicPhone || "+91 97655 39107"}</span>
          </p>
          <p className="text-slate-500 font-mono text-[10px]">
            GSTIN: {data.clinicGst || "27AAACA9876Q1Z5"} • Clinical Est. Reg: PN-2024/774
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. INVOICE META & STATUS BAR                                */}
      {/* ----------------------------------------------------------- */}
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Invoice Number
          </span>
          <span className="text-base font-black font-mono text-teal-900">
            {data.invoiceNumber}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Invoice Date
          </span>
          <span className="text-xs font-bold text-slate-800">
            {invoiceDateFormatted}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Payment Status
          </span>
          <span
            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
              data.status === "PAID"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : data.status === "PARTIAL"
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {data.status === "PAID" ? "✓ Fully Settled" : data.status}
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. PATIENT DEMOGRAPHICS                                     */}
      {/* ----------------------------------------------------------- */}
      <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 text-xs">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-100 pb-1">
          Billed Patient Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="text-slate-500 block text-[10px]">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{data.patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Phone Number</span>
            <span className="font-mono text-slate-800">{data.patientPhone}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Patient UHID / MRN</span>
            <span className="font-mono font-semibold text-slate-800">
              {data.patientIdNumber || "APEX-P-2026"}
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. ITEMIZED CHARGES TABLE                                   */}
      {/* ----------------------------------------------------------- */}
      <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Clinical Treatment / Service Description</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
              <th className="py-2.5 px-3 text-right">Net Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-500">
                  No line items recorded.
                </td>
              </tr>
            ) : (
              data.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{it.description}</td>
                  <td className="py-2.5 px-3 text-center text-slate-700">{it.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(it.unitPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(it.totalPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 5. TOTALS & SETTLEMENT BREAKDOWN                            */}
      {/* ----------------------------------------------------------- */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment History / Tender Mode */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
            Settlement / Transaction Details
          </h4>
          {data.payments && data.payments.length > 0 ? (
            <div className="space-y-1.5">
              {data.payments.map((p, pIdx) => (
                <div key={pIdx} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">
                    <strong className="text-slate-800">{p.paymentMethod}</strong>
                    {p.receiptNumber ? ` (Ref: ${p.receiptNumber})` : ""}
                  </span>
                  <span className="font-mono font-bold text-emerald-800">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">Direct payment at clinic front-desk.</p>
          )}
        </div>

        {/* Calculation summary */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Gross):</span>
            <span className="font-mono font-semibold">{formatCurrency(data.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Healthcare GST / Cess (Exempt/Inclusive):</span>
            <span className="font-mono text-slate-500">₹0.00</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-semibold border-t border-slate-200 pt-1">
            <span>Total Paid Amount:</span>
            <span className="font-mono">{formatCurrency(data.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-1">
            <span>Net Balance Due:</span>
            <span className="font-mono text-teal-900">{formatCurrency(data.balanceDue)}</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 6. STATUTORY DISCLAIMER & SIGNATURE                        */}
      {/* ----------------------------------------------------------- */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-[10px] text-slate-500">
        <div className="space-y-1 max-w-sm">
          <p className="font-semibold text-slate-700">Notice to Patient:</p>
          <p>
            This is an electronically generated official receipt. Dental and medical services
            rendered are non-transferable. Please retain this receipt for medical tax deduction
            under Section 80D or clinical insurance claim submission.
          </p>
          <p className="font-mono text-[9px] text-slate-400">
            Generated: {issueDateFormatted} • System: Apex Health Suite v2.6
          </p>
        </div>

        <div className="text-center sm:text-right self-stretch sm:self-auto pt-2 sm:pt-0">
          <div className="inline-block border-b border-slate-400 pb-1 mb-1 px-6">
            <span className="font-serif italic font-bold text-slate-800 text-xs">
              Apex Accounts & Billing
            </span>
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
            Authorized Clinic Signatory / Stamp
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 7. SCREEN CONTROLS (Hidden when printing)                   */}
      {/* ----------------------------------------------------------- */}
      <div className="no-print mt-6 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-teal-700" />
          <span>Click Print to save as clean A4 PDF or print on physical thermal/A4 paper.</span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="printable-modal-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
        <div className="printable-modal-inner relative w-full max-w-2xl my-auto print:my-0">
          <button
            type="button"
            onClick={onClose}
            className="no-print absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-slate-800 transition z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return content;
}
