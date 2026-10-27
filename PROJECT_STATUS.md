# Project Status: MediNexus OS (Doctor Website & Clinic Management System)

## 1. Project Overview & Architecture
MediNexus OS is an enterprise-grade, multi-tenant healthcare SaaS and clinic management platform tailored for independent doctors, dental clinics, dermatology aesthetics, physiotherapy centers, and multi-specialty practices in India (Pune, Mumbai, and pan-India).

### Core Architectural Layers:
- **Frontend & App Framework**: Next.js 14.2.15 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons.
- **Design System**: Human-designed, warm, professional healthcare theme. Medical navy (`#0f172a`), crisp white surfaces (`#ffffff`, `#f8fafc`), muted teal and medical emerald accents (`#0d9488`, `#059669`), subtle borders, high-density clinical and accounting data grids.
- **Database & Data Layer**: Relational architecture via Prisma ORM (`prisma/schema.prisma`) with 21 relational models. Local zero-config SQLite (`prisma/dev.db`) and PostgreSQL production-ready configuration via `docker-compose.yml`.
- **Tenant Isolation**: Strict clinic-scoped data isolation (`clinicId` enforced across every query, relation, and mutation).
- **Authentication & Security**: Cryptographic HMAC SHA-256 server session tokens, bcrypt password hashing, HTTP-only SameSite cookies, and strict Role-Based Access Control (RBAC) enforced on the server.
- **Service Layer**: Clean domain separation across `appointmentService.ts`, `billingService.ts`, `clinicalService.ts`, `patientService.ts`, and `prospectService.ts`.
- **Integrations**:
  - Payment gateway abstraction (Razorpay sandbox / offline UPI QR / Cash / Card).
  - Messaging provider abstraction (WhatsApp Business & Transactional Email adapters with logging fallback).
  - Prospect Onboarding Engine: Ingestion pipeline for regional clinic prospect workbooks (`prospects.xlsx` / `prospects.csv`) with 1-click dynamic website provisioning.

---

## 2. Roles & Default Credentials

All demo accounts share the password: **`Password@123`**

| Role | Email Address | Access Level & Capabilities |
| :--- | :--- | :--- |
| **Platform Super Admin** | `superadmin@medinexus.in` | Global multi-tenant supervision, tenant creation, subscription management, platform health. |
| **Clinic Owner / Director** | `owner@apexdental.in` | Full clinic configuration, doctors, staff permissions, financial reports, settings, and CMS. |
| **Dentist (Doctor)** | `dr.ananya@apexdental.in` | Clinical cockpit, appointments queue, Dental FDI 11-48 chart, SOAP notes, prescription generator. |
| **Dermatologist (Doctor)** | `dr.rohan@apexdental.in` | Clinical cockpit, Fitzpatrick skin phototype selector, lesion notes, Rx generator. |
| **Receptionist / Front Desk** | `reception@apexdental.in` | Appointment board, patient registrations, duplicate detection, walk-in scheduling, queue check-ins. |
| **Accountant** | `accounts@apexdental.in` | Financial dashboard, invoice generator, UPI/Cash/Card reconciliation, expense tracking. |
| **Patient (Self-Service)** | `rajesh.sharma@example.com` | Patient portal (`/portal`), appointments, prescription slips, invoices, receipts. |

---

## 3. Implementation Status Summary

| Module | Status | Verification & Features |
| :--- | :--- | :--- |
| **Multi-Tenant Foundation** | Complete | 21 relational Prisma models, clinic scoping, foreign key relations, session security. |
| **Public Clinic Website** | Complete | Home, About Doctor with verified credentials, Service catalog with transparent fees, Standalone booking widget, Timings & Directions, Patient Policies, Dynamic multi-tenant clinic route (`/c/[slug]`). |
| **Scheduling Engine** | Complete | Real-time available slot computation, buffer minutes, lunch break avoidance, server transaction conflict rejection (HTTP 409). |
| **Printable Hospital Slips**| Complete | CSS `@media print` A4 document isolation (`.printable-slip-container`). Clean appointment passes (`AppointmentSlip.tsx`), NMC/DCI statutory prescriptions (`DoctorPrescriptionSlip.tsx`), and tax receipts (`InvoiceReceiptSlip.tsx`). |
| **Clinical Cockpit (EHR)** | Complete | Queue management, vitals, SOAP notes, Dental FDI 11-48 chart, Dermatology phototypes, Physiotherapy VAS score, finalize & sign consultation with auto-unlocking prescription. |
| **Reception Workflow** | Complete | Streamlined desk triage: Reception calls patient from lobby into room ("Call to Doctor" / `IN_CONSULTATION`), while Doctor Cockpit conducts clinical exam. On-demand appointment slip printing. |
| **Patient Directory** | Complete | Search by name/phone/ID, duplicate phone detection, emergency contacts, medical alerts, CSV export. |
| **Financial Accounting** | Complete | Reconciled ledger (Gross Invoiced, Net Collections, Receivables, Operating Expenses, Operating Surplus), printable tax receipts. |
| **Prospect Ingestion Engine**| Complete | Excel/CSV parser, 24 Pune/Mumbai seeded prospects, 1-click provisioning of separate draft clinic websites. |
| **Settings & CMS Editor** | Complete | Clinic profile, operating hours, slot buffer, consultation fees, public announcements. |
| **Super Admin Platform** | Complete | Tenant list, MRR metrics, subscription tiers, platform health monitor. |
| **Patient Portal** | Complete | Dual-mode portal (`/portal`): authenticated chart view & public quick lookup by Booking Ref (`APT-2610-1000`) or phone (`98220 12345`), 1-click downloads for passes, prescriptions, and receipts. |
| **Authentication & Registration** | Complete | Dual Sign-in / Sign-up portal (`/login`): Fast-fill 1-click demo profiles + real self-registration for Patients, Doctors, Clinic Owners, and Desk Staff via `/api/auth/register`. |
| **Floating WhatsApp & Chatbot**| Complete | Direct WhatsApp shortcut (`wa.me/919765539107`) + 24/7 Dr. Apex AI triage assistant (`/api/chat`) with sliding-window rate limiting, input sanitization, and prompt-injection defense. |
| **AWS Deployment Suite** | Complete | Multi-stage production `Dockerfile`, `docker-compose.prod.yml` with PostgreSQL, and comprehensive AWS deployment guide (`AWS_DEPLOYMENT.md`). |
| **Automated Test Suite** | Complete | 9 unit/integration tests passing in Vitest (`tests/`). |
| **Production Build** | Complete | Next.js 14 production build succeeds with 0 errors across all 32 routes. Listening on `http://localhost:3001`. |

---

## 4. Run & Development Instructions

### Local Development (Port 3001)
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client & sync schema
npx prisma generate
npx prisma db push

# 3. Seed demo data (Clinics, Doctors, Patients, Appointments, Invoices, Prospects)
npm run seed

# 4. Run automated tests
npm test

# 5. Start development server on port 3001
npm run dev -- -p 3001
```

### Production Build & Launch
```bash
npm run build
npm run start -- -p 3001
```

Access the application in your browser:
- Public Clinic Website: `http://localhost:3001`
- Clinic Management Cockpit: `http://localhost:3001/app`
- Patient Self-Service Portal: `http://localhost:3001/portal`
- Super Admin Supervisor: `http://localhost:3001/app/superadmin`
- Provisioned Prospect Clinic (Demo): `http://localhost:3001/c/vinaykia-dental-care-pune`

---

## 5. Docker Deployment (PostgreSQL 16)
To run with a dedicated PostgreSQL database container:
```bash
# Start PostgreSQL container
docker compose up -d

# Point DATABASE_URL in .env to postgresql://medinexus:medinexus_secure_pass@localhost:5432/medinexus_db?schema=public
# Then push schema and seed
npx prisma db push
npm run seed
npm run build
npm run start
```
