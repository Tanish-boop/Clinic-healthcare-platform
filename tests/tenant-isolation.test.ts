import { describe, it, expect } from "vitest";
import { requireClinicTenant } from "../src/lib/auth";
import { recordPayment } from "../src/services/billingService";
import { db } from "../src/lib/db";

describe("Tenant Data Isolation & Security Guardrails", () => {
  it("should block cross-tenant payment attempts", async () => {
    const clinic = await db.clinic.findFirst();
    const invoice = await db.invoice.findFirst();

    if (!clinic || !invoice) return;

    // Attempt to pay an invoice belonging to clinic A using foreign clinic ID
    const foreignClinicId = "clinic-unauthorized-tenant-999";

    await expect(
      recordPayment({
        clinicId: foreignClinicId,
        invoiceId: invoice.id,
        amount: 100,
        paymentMethod: "CASH",
      })
    ).rejects.toThrow("TENANT_VIOLATION");
  });
});
