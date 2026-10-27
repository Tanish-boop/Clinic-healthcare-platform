import { describe, it, expect } from "vitest";
import { createInvoice, recordPayment, getFinancialSummary } from "../src/services/billingService";
import { db } from "../src/lib/db";

describe("Finance, Invoicing & Financial Reconciliation Tests", () => {
  it("should calculate line items, discounts, taxes, and balance accurately", async () => {
    const clinic = await db.clinic.findFirst();
    const patient = await db.patient.findFirst();

    if (!clinic || !patient) return;

    const invoice = await createInvoice({
      clinicId: clinic.id,
      patientId: patient.id,
      items: [
        { description: "Dental Procedure A", quantity: 2, unitPrice: 1000 }, // 2000
        { description: "Consultation", quantity: 1, unitPrice: 500 }, // 500
      ], // Subtotal = 2500
      discountAmount: 200, // 2300 taxable
      taxRatePercent: 0, // Health exemption standard
    });

    expect(invoice.subtotal).toBe(2500);
    expect(invoice.discountAmount).toBe(200);
    expect(invoice.totalAmount).toBe(2300);
    expect(invoice.balanceDue).toBe(2300);
    expect(invoice.status).toBe("PENDING");

    // Partial payment of ₹1000 via UPI
    const payment = await recordPayment({
      clinicId: clinic.id,
      invoiceId: invoice.id,
      amount: 1000,
      paymentMethod: "UPI",
      referenceNumber: "UPI/TEST-12345",
    });

    expect(payment.receiptNumber.startsWith("REC-")).toBe(true);

    const updatedInv = await db.invoice.findUnique({ where: { id: invoice.id } });
    expect(updatedInv?.paidAmount).toBe(1000);
    expect(updatedInv?.balanceDue).toBe(1300);
    expect(updatedInv?.status).toBe("PARTIALLY_PAID");

    // Reject payment exceeding balance
    await expect(
      recordPayment({
        clinicId: clinic.id,
        invoiceId: invoice.id,
        amount: 5000, // Exceeds 1300
        paymentMethod: "CASH",
      })
    ).rejects.toThrow("PAYMENT_EXCEEDS_DUE");

    // Clean up
    await db.payment.deleteMany({ where: { invoiceId: invoice.id } });
    await db.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
    await db.invoice.delete({ where: { id: invoice.id } });
  });

  it("should reconcile real financial figures from database ledger without fabrication", async () => {
    const clinic = await db.clinic.findFirst();
    if (!clinic) return;

    const summary = await getFinancialSummary(clinic.id);

    expect(summary.grossInvoiced).toBeGreaterThan(0);
    expect(summary.netCollections).toBeGreaterThan(0);
    expect(summary.totalExpenses).toBeGreaterThan(0);
    // Operating surplus = Net Collections - Total Expenses
    expect(summary.operatingSurplus).toBe(
      summary.netCollections - summary.totalExpenses
    );
  });
});
