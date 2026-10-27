# Implementation Plan: MediNexus OS Healthcare Platform

## Objective
Build a complete, production-ready, multi-tenant Doctor Website & Clinic Management System designed for independent clinics and healthcare practitioners across India (Pune, Mumbai, and nationwide).

---

## Phase 1: Foundation & Infrastructure (Hours 1 - 2)
- [x] Inspect existing workspace and environment.
- [x] Inspect Excel prospect workbook structure (`Pune_Mumbai_Clinic_Website_Prospects.xlsx`).
- [x] Create `PROJECT_STATUS.md` and `IMPLEMENTATION_PLAN.md`.
- [ ] Initialize Next.js 14/15 App Router TypeScript project with Tailwind CSS and Lucide icons.
- [ ] Define comprehensive relational database schema in Prisma:
  - Tenants/Clinics, Users, Roles, Doctor Profiles, Staff Memberships.
  - Patients, Encounters, Diagnoses, Clinical Notes, Specialty Data, Prescriptions.
  - Services, Doctor Schedules, Leave/Holidays, Appointments, Appointment History.
  - Invoices, Invoice Line Items, Payments, Refunds, Expenses, Expense Categories.
  - Audit Logs, Notifications, Website CMS Content.
- [ ] Build Authentication & Session Layer:
  - Cryptographic session cookies, password hashing (bcryptjs).
  - Multi-tenant RBAC middleware and server authorization helpers (`requireAuth`, `requireRole`, `requireClinicTenant`).
- [ ] Design System Tokens & Base Components:
  - Warm clinical light theme (slate text, crisp off-white cards, muted teal/emerald accents, soft borders).
  - Navigation layouts: Public clinic website header/footer, Clinic App Dashboard sidebar/topbar, Patient Portal header.

---

## Phase 2: Public Clinic Website & Interactive Booking Engine
- [ ] Public Clinic Website Pages:
  - **Home**: Hero with clinic identity, doctor profile highlight, verified credentials, specialties, service preview, clinic timing banner, Google Maps direction link, appointment CTA.
  - **About Doctor**: Clinical background, education, medical registration numbers, philosophy of care, certifications.
  - **Services**: Configurable service catalog with durations, indicative fees, and descriptions.
  - **Contact & Timings**: Operating hours, physical address in Pune/Mumbai, phone numbers, parking/directions, emergency notice.
  - **Policies & FAQ**: Booking terms, cancellation policy, patient privacy notice.
- [ ] Public Online Booking Flow:
  - Step 1: Select Service & Doctor.
  - Step 2: Date Picker & Real-Time Available Slot Computation (respecting doctor working hours, break times, existing bookings, buffer intervals).
  - Step 3: Patient Information Form (Name, Mobile, Email, Chief Complaint, Consultation Type: In-person vs Teleconsult).
  - Step 4: Server-Side Conflict Validation (strict prevention of overlapping or double bookings).
  - Step 5: Booking Confirmation with unique reference number (e.g., `APT-2026-XXXX`) and instant booking status display.

---

## Phase 3: Clinic Operations & Clinical Cockpit (EHR)
- [ ] Receptionist & Front-Desk Workflow:
  - Daily appointment queue & status board (`Requested`, `Confirmed`, `Checked-In`, `In-Consultation`, `Completed`, `Cancelled`, `No-Show`).
  - Quick walk-in appointment creation.
  - Patient check-in and queue management.
- [ ] Patient Management Module:
  - Comprehensive patient directory with search (by Name, Mobile, Patient ID `PAT-XXXX`, Email).
  - Patient Profile: Demographics, allergies, emergency contacts, medical history, visit history, billing summary.
  - Patient record export (CSV/JSON) and CSV import.
- [ ] Doctor Clinical Cockpit:
  - Today's patient queue and waiting list.
  - Active consultation interface:
    - Chief complaints, vital signs (BP, Pulse, SpO2, Temperature, Weight).
    - Clinical notes (SOAP format: Subjective, Objective, Assessment, Plan).
    - Specialty-specific clinical templates:
      - **Dental**: Interactive tooth charting (FDI system 11-48), procedure selection, periodontal notes.
      - **Dermatology**: Skin concern categorization, lesion site, examination, sun exposure / skincare regimen.
      - **Physiotherapy**: Pain score (VAS 1-10), range of motion, postural assessment, exercise protocol.
      - **General Medicine**: Differential diagnosis, investigation orders, lifestyle guidance.
    - Prescription builder: Drug name, dosage, frequency (e.g., 1-0-1), duration, food instructions, warnings.
    - Follow-up date picker with automated reminder flag.
    - Printable consultation summary and prescription view.

---

## Phase 4: Finance, Billing & Accounting Module
- [ ] Invoicing Engine:
  - Unique invoice generator (`INV-2026-XXXX`).
  - Line items linked to clinic services, medications, or custom procedures.
  - Subtotals, configurable GST/tax rates, and discount management.
- [ ] Payment Recording:
  - Multi-mode support: Cash, UPI (GPay/PhonePe/Paytm), Credit/Debit Card, Net Banking.
  - Full and partial payment tracking.
  - Payment receipt generation (`REC-2026-XXXX`).
  - Refund processing with audit logs and reason codes.
- [ ] Clinic Expense Management:
  - Track operating costs across categories: Clinic Rent, Staff Salaries, Consumables/Instruments, Utilities, Software, Marketing, Maintenance.
- [ ] Financial Intelligence & Dashboard:
  - Real calculations based on database ledger:
    - Gross Billings vs Net Collections (actual cash/UPI collected).
    - Total Outstanding Receivables.
    - Total Operating Expenses.
    - Net Operating Surplus / Margin.
  - Revenue trends by service, doctor, and payment channel.

---

## Phase 5: Administration, CMS & Patient Self-Service Portal
- [ ] Clinic Administration & Settings:
  - Clinic identity: Name, tagline, phone, address, Google Maps embed, logo.
  - Doctor profiles & availability rules (weekly hours, slot durations, buffers).
  - Staff user management with role assignment (Doctor, Receptionist, Accountant, Nurse).
  - Clinic service catalog and pricing management.
  - Website CMS: Customize hero text, FAQs, announcements, and clinic policies.
- [ ] Patient Self-Service Portal:
  - Secure patient login via mobile / email verification.
  - Patient dashboard: Upcoming appointments, past visit history.
  - Downloadable doctor-authorized prescriptions.
  - Downloadable receipts and invoice summaries.
  - Reschedule / cancel request within policy window.

---

## Phase 6: SaaS Platform & Excel Prospect Onboarding Engine
- [ ] Platform Super Admin:
  - Global tenant overview (All clinics, active subscriptions, revenue).
  - Tenant provisioning (create new clinic tenant, initialize owner account).
- [ ] Excel & CSV Clinic Prospect Ingestion:
  - File upload supporting `.xlsx` and `.csv` files formatted like `Pune_Mumbai_Clinic_Website_Prospects.xlsx`.
  - Column mapping preview and validation.
  - Automatic clinic draft generation (City, Area, Specialty, Contact Numbers, Lead status).
  - Conflict detection to prevent accidental duplication of existing clinics.
  - "Launch Clinic Site" one-click provisioner to instantiate a tailored live website from prospect data.

---

## Phase 7: Verification, Automated Testing & Documentation
- [ ] Automated Test Suite:
  - Unit tests for financial calculations, invoice balancing, and slot collision detection.
  - Multi-tenant data isolation tests (verifying clinic A cannot read clinic B).
  - RBAC server permission enforcement tests.
- [ ] Comprehensive Synthetic Demo Seed:
  - Pune/Mumbai flagship clinic ("Apex Dental & Multi-Specialty Lounge").
  - 2 Doctors, 3 Staff members, 25+ realistic patient records.
  - 30+ appointments across all states, 20+ invoices with real UPI/Cash payments, realistic clinic expenses.
- [ ] Production Build & Health Check:
  - Full Next.js production build (`npm run build`).
  - Comprehensive `README.md` with zero-friction setup guide.
  - Comprehensive `IMPLEMENTATION_REPORT.md` with test output and operational checklist.
