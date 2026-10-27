import { db } from "@/lib/db";

export interface CreateInvoiceInput {
  clinicId: string;
  patientId: string;
  appointmentId?: string;
  items: Array<{
    serviceId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  discountAmount?: number;
  taxRatePercent?: number; // e.g. 0, 5, 12, 18
  notes?: string;
  dueDate?: Date;
}

export interface RecordPaymentInput {
  clinicId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: "CASH" | "UPI" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER";
  referenceNumber?: string; // UPI UTR or Txn ID
  receivedBy?: string;
  notes?: string;
}

export interface RecordRefundInput {
  clinicId: string;
  invoiceId: string;
  amount: number;
  reason: string;
  refundMethod: "CASH" | "UPI" | "ORIGINAL_SOURCE";
  referenceNumber?: string;
  authorizedBy: string;
}

export interface RecordExpenseInput {
  clinicId: string;
  categoryId: string;
  title: string;
  amount: number;
  paymentMethod: string;
  vendorName?: string;
  invoiceRef?: string;
  notes?: string;
  paymentDate?: Date;
}

/**
 * Generate human-readable invoice sequence e.g. INV-2026-0001
 */
export async function generateInvoiceNumber(clinicId: string): Promise<string> {
  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    select: { invoicePrefix: true },
  });
  const prefix = clinic?.invoicePrefix || "INV";
  const count = await db.invoice.count({ where: { clinicId } });
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Generate unique receipt sequence e.g. REC-2026-0001
 */
export async function generateReceiptNumber(clinicId: string): Promise<string> {
  const clinic = await db.clinic.findUnique({
    where: { id: clinicId },
    select: { receiptPrefix: true },
  });
  const prefix = clinic?.receiptPrefix || "REC";
  const count = await db.payment.count({
    where: { invoice: { clinicId } },
  });
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Create an invoice with items and accurate subtotal, tax, and discount calculation
 */
export async function createInvoice(input: CreateInvoiceInput) {
  return await db.$transaction(async (tx) => {
    const invoiceNumber = await generateInvoiceNumber(input.clinicId);

    // Calculate subtotal
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discount = Math.min(input.discountAmount || 0, subtotal);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = input.taxRatePercent || 0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const totalAmount = taxableAmount + taxAmount;

    const invoice = await tx.invoice.create({
      data: {
        clinicId: input.clinicId,
        invoiceNumber,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        subtotal,
        discountAmount: discount,
        taxRatePercent: taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        status: "PENDING",
        notes: input.notes,
        dueDate: input.dueDate,
        items: {
          create: input.items.map((item) => ({
            serviceId: item.serviceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
        patient: true,
      },
    });

    return invoice;
  });
}

/**
 * Record a payment against an invoice (supports partial payments)
 */
export async function recordPayment(input: RecordPaymentInput) {
  return await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
      include: { clinic: true },
    });

    if (!invoice) throw new Error("Invoice not found");
    if (invoice.clinicId !== input.clinicId) {
      throw new Error("TENANT_VIOLATION: Invoice does not belong to this clinic");
    }

    if (input.amount <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    if (input.amount > invoice.balanceDue + 0.01) {
      throw new Error(
        `PAYMENT_EXCEEDS_DUE: Amount (${input.amount}) exceeds outstanding balance (${invoice.balanceDue})`
      );
    }

    const receiptNumber = await generateReceiptNumber(input.clinicId);

    const payment = await tx.payment.create({
      data: {
        invoiceId: input.invoiceId,
        receiptNumber,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber,
        receivedBy: input.receivedBy || "Cashier",
        notes: input.notes,
      },
    });

    const newPaidAmount = invoice.paidAmount + input.amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus =
      newBalanceDue <= 0.01
        ? "PAID"
        : newPaidAmount > 0
        ? "PARTIALLY_PAID"
        : "PENDING";

    await tx.invoice.update({
      where: { id: input.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });

    return payment;
  });
}

/**
 * Record a refund against an invoice
 */
export async function recordRefund(input: RecordRefundInput) {
  return await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: input.invoiceId },
    });

    if (!invoice) throw new Error("Invoice not found");
    if (invoice.clinicId !== input.clinicId) {
      throw new Error("TENANT_VIOLATION: Invoice does not belong to this clinic");
    }

    if (input.amount <= 0) {
      throw new Error("Refund amount must be greater than zero");
    }

    if (input.amount > invoice.paidAmount) {
      throw new Error(
        `REFUND_EXCEEDS_PAID: Cannot refund more than total collected (${invoice.paidAmount})`
      );
    }

    const refund = await tx.refund.create({
      data: {
        invoiceId: input.invoiceId,
        amount: input.amount,
        reason: input.reason,
        refundMethod: input.refundMethod,
        referenceNumber: input.referenceNumber,
        authorizedBy: input.authorizedBy,
      },
    });

    const newPaidAmount = invoice.paidAmount - input.amount;
    const newBalanceDue = invoice.totalAmount - newPaidAmount;
    const newStatus = newPaidAmount <= 0.01 ? "REFUNDED" : "PARTIALLY_PAID";

    await tx.invoice.update({
      where: { id: input.invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
      },
    });

    return refund;
  });
}

/**
 * Record clinic operational expense
 */
export async function recordExpense(input: RecordExpenseInput) {
  return await db.expense.create({
    data: {
      clinicId: input.clinicId,
      categoryId: input.categoryId,
      title: input.title,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      vendorName: input.vendorName,
      invoiceRef: input.invoiceRef,
      notes: input.notes,
      paymentDate: input.paymentDate || new Date(),
    },
  });
}

/**
 * Calculate actual financial figures from database records
 * Reconciles Gross Invoiced, Actual Collections, Refunds, Expenses, and Operating Surplus
 */
export async function getFinancialSummary(clinicId: string, startDate?: Date, endDate?: Date) {
  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.gte = startDate;
    if (endDate) dateFilter.createdAt.lte = endDate;
  }

  // 1. Total Invoiced and Outstanding Balances
  const invoices = await db.invoice.findMany({
    where: {
      clinicId,
      ...(startDate || endDate ? { invoiceDate: dateFilter.createdAt } : {}),
      status: { not: "CANCELLED" },
    },
    include: {
      payments: true,
      refunds: true,
    },
  });

  let grossInvoiced = 0;
  let totalOutstanding = 0;
  let collectedAmount = 0;
  let refundedAmount = 0;

  for (const inv of invoices) {
    grossInvoiced += inv.totalAmount;
    totalOutstanding += inv.balanceDue;
    for (const p of inv.payments) {
      collectedAmount += p.amount;
    }
    for (const r of inv.refunds) {
      refundedAmount += r.amount;
    }
  }

  const netCollections = collectedAmount - refundedAmount;

  // 2. Total Recorded Expenses
  const expenses = await db.expense.findMany({
    where: {
      clinicId,
      ...(startDate || endDate ? { paymentDate: dateFilter.createdAt } : {}),
    },
    include: {
      category: true,
    },
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const operatingSurplus = netCollections - totalExpenses;

  // 3. Payment Methods Breakdown
  const paymentsByMethod: Record<string, number> = {
    UPI: 0,
    CASH: 0,
    CREDIT_CARD: 0,
    DEBIT_CARD: 0,
    BANK_TRANSFER: 0,
  };

  const allPayments = await db.payment.findMany({
    where: {
      invoice: { clinicId },
      ...(startDate || endDate ? { paymentDate: dateFilter.createdAt } : {}),
    },
  });

  for (const p of allPayments) {
    paymentsByMethod[p.paymentMethod] =
      (paymentsByMethod[p.paymentMethod] || 0) + p.amount;
  }

  // 4. Expense Breakdown by Category
  const expensesByCategory: Record<string, number> = {};
  for (const exp of expenses) {
    const catName = exp.category?.name || "Uncategorized";
    expensesByCategory[catName] = (expensesByCategory[catName] || 0) + exp.amount;
  }

  return {
    grossInvoiced,
    collectedAmount,
    refundedAmount,
    netCollections,
    totalOutstanding,
    totalExpenses,
    operatingSurplus,
    invoicesCount: invoices.length,
    paymentsByMethod,
    expensesByCategory,
  };
}
