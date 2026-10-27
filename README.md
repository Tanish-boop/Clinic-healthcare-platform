# MediNexus OS: Doctor Website & Clinic Management System

> **A production-ready, multi-tenant healthcare operating system for independent doctors, dental clinics, dermatology aesthetic lounges, physiotherapy studios, and multi-specialty practices in India.**

---

## 🌟 Overview

MediNexus OS bridges the gap between patient acquisition and clinical operations. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Prisma ORM, it provides:
1. **Seamless "Inside & Outside" Architecture**: Completely eliminates the typical generic AI left sidebar in favor of an authentic clinical operating model:
   - 🌐 **Outside Clinic (Patient-Facing Front)**: Verified doctor credentials, transparent treatment catalogs, patient policies, map directions, online appointment booking widget, and self-service patient portal.
   - 🏥 **Inside Clinic (Operational Floor)**: Full-width widescreen clinical cockpit with top command bar, live floor status indicators, quick patient lookup, and a horizontal clinical workflow ribbon.
2. **Doctor Clinical Cockpit**: Electronic Health Records (EHR) with specialized clinical templates including an interactive **Dental FDI 11-48 Tooth Chart**, **Fitzpatrick Skin Phototype Selector**, and **Physiotherapy VAS Pain Score**, coupled with an Indian Medical Council compliant prescription slip generator.
3. **Reconciled Financial Ledger**: Complete invoicing, UPI/Cash/Card/Bank collections, expense recording, and real-time calculation of Gross Invoiced, Net Collections, Outstanding Receivables, and Operating Surplus.
4. **Excel/CSV Prospect Ingestion Engine**: Automated parser for regional doctor/clinic sales leads (`prospects.xlsx`) with 1-click provisioning of custom draft clinic websites.
5. **Patient Self-Service Portal**: Secure portal for patients to view upcoming appointments, download digital prescriptions, and view billing receipts.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v22 tested)
- **npm** or **pnpm**
- **Docker** *(optional, for PostgreSQL)*

### 2. Installation
```bash
# Clone the repository and navigate to root
cd "c:\Users\hp\OneDrive\Desktop\Dr website"

# Install dependencies
npm install
```

### 3. Database Initialization & Seeding
The project is configured by default with SQLite (`prisma/dev.db`) for immediate zero-config local development, with 100% PostgreSQL schema compatibility.
```bash
# Generate Prisma Client & push schema
npx prisma generate
npx prisma db push

# Seed realistic demo clinic, doctors, patients, appointments, and 24 regional prospects
npm run seed
```

### 4. Run Automated Tests
```bash
npm test
```
All 9 unit and integration tests (Auth, Billing Reconciliation, Appointment Conflict Detection, and Tenant Isolation) should pass.

### 5. Launch the Application
```bash
# Start Next.js on port 3001 (avoids collisions with other local dev servers)
npm run dev -- -p 3001
```

Or for production build and run:
```bash
npm run build
npm run start -- -p 3001
```

---

## 🔐 Demo Accounts & Default Credentials

All demo accounts share the password: **`Password@123`**

| Role | Email Address | Access & Core Capabilities |
| :--- | :--- | :--- |
| **Platform Super Admin** | `superadmin@medinexus.in` | Global multi-tenant supervision, tenant creation, subscriptions, and platform metrics. |
| **Clinic Owner / Director** | `owner@apexdental.in` | Complete clinic configuration, doctors, staff permissions, financial reports, settings, and CMS. |
| **Dentist (Doctor)** | `dr.ananya@apexdental.in` | Clinical cockpit, appointments queue, Dental FDI 11-48 chart, SOAP notes, prescription generator. |
| **Dermatologist (Doctor)** | `dr.rohan@apexdental.in` | Clinical cockpit, Fitzpatrick skin scale, dermatological lesion notes, Rx builder. |
| **Receptionist / Front Desk** | `reception@apexdental.in` | Front desk queue, patient registration, duplicate phone detection, walk-ins, check-in flow. |
| **Accountant** | `accounts@apexdental.in` | Financial dashboard, invoice generator, UPI/Cash/Card reconciliation, expense tracking. |
| **Patient (Self-Service)** | `rajesh.sharma@example.com` | Patient portal (`/portal`), appointments, prescription slips, invoices, receipts. |

---

## 🗺️ Application Routes

### Public Website
- `http://localhost:3001` - Flagship Clinic Homepage (*Apex Dental & Aesthetic Lounge, Pune*)
- `http://localhost:3001/about` - Doctor Qualifications & Medical Council Registrations
- `http://localhost:3001/services` - Service Catalog with transparent Indian Rupee (₹) pricing
- `http://localhost:3001/book` - Interactive Online Appointment Booking
- `http://localhost:3001/contact` - Clinic Address, Phone, Emergency Trauma Guidance
- `http://localhost:3001/policies` - Cancellation Policy, DPDP Privacy Terms, Medical Disclaimer
- `http://localhost:3001/c/[slug]` - Dynamic multi-tenant website for any provisioned clinic (e.g. `http://localhost:3001/c/vinaykia-dental-care-pune`)

### Clinic Management System (Staff & Doctors)
- `http://localhost:3001/login` - Universal Secure Login
- `http://localhost:3001/app` - Real-time Operational KPI Dashboard & Queue
- `http://localhost:3001/app/appointments` - Receptionist Queue Board, Walk-In Scheduler, Status Transitions
- `http://localhost:3001/app/doctor` - Clinical Cockpit (Vitals, Dental FDI Chart, Derma Phototypes, Physio VAS, Rx Generator)
- `http://localhost:3001/app/patients` - Patient Directory, Duplicate Detection, Medical Alerts, CSV Export
- `http://localhost:3001/app/finance` - Financial Ledger, Invoicing, UPI/Cash Payments, Expenses, Printable Tax Invoices
- `http://localhost:3001/app/prospects` - Regional Prospect Lead Viewer, XLSX/CSV Uploader, 1-Click Clinic Website Provisioner
- `http://localhost:3001/app/settings` - Clinic Profile, Timings, Booking Buffers, Website CMS Editor
- `http://localhost:3001/app/superadmin` - Platform SaaS Supervisor & Multi-Clinic Monitor

### Patient Self-Service Portal
- `http://localhost:3001/portal` - Patient Dashboard for Bookings, Prescriptions, and Payment Receipts

---

## 🐳 Docker Deployment (PostgreSQL 16)

For deploying with an enterprise PostgreSQL database:

```bash
# 1. Start the PostgreSQL container
docker compose up -d

# 2. Update .env to use PostgreSQL
DATABASE_URL="postgresql://medinexus:medinexus_secure_pass@localhost:5432/medinexus_db?schema=public"

# 3. Synchronize schema and seed
npx prisma db push
npm run seed

# 4. Build and start Next.js
npm run build
npm run start
```

---

## 🛡️ Security, Privacy & Compliance

1. **Digital Personal Data Protection (DPDP) Act & Privacy**:
   - Patient phone numbers, medical alerts, and clinical notes are isolated per clinic tenant.
   - Public booking API returns strictly anonymized availability (available time slots only) without exposing other patients' details.
2. **Medical Council Guidelines**:
   - Prescriptions automatically render verified state medical council registration numbers (e.g., `MDC-74921`, `MMC-2015-8832`).
   - Prescription slips include patient details, date, dosage, frequency, dietary guidance, and a clinical disclaimer.
3. **Session Security & RBAC**:
   - Cryptographic HMAC SHA-256 session tokens with HTTP-only, SameSite cookies.
   - Passwords hashed with bcrypt (10 rounds).
   - Strict server-side RBAC validation on all API endpoints and server components.

---

## 📄 Documentation

- [Implementation Plan](file:///c:/Users/hp/OneDrive/Desktop/Dr%20website/IMPLEMENTATION_PLAN.md)
- [Project Status](file:///c:/Users/hp/OneDrive/Desktop/Dr%20website/PROJECT_STATUS.md)
- [Implementation & Verification Report](file:///c:/Users/hp/OneDrive/Desktop/Dr%20website/IMPLEMENTATION_REPORT.md)
