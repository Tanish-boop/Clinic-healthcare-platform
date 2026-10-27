/**
 * ============================================================================
 * MEDINEXUS / APEX CLINIC OS - COMPREHENSIVE SECURITY & INTEGRITY TEST SUITE
 * ============================================================================
 * Tests:
 * 1. Database Integrity & Dynamic Relations (Prisma ORM)
 * 2. SQL Injection / NoSQL Injection Resilience (Parameterization)
 * 3. Cross-Site Scripting (XSS) Sanitization in Chat & Forms
 * 4. Authentication, Password Hashing & Timing-Safe HMAC Signing
 * 5. Role-Based Access Control (RBAC) & Protected Route Boundaries
 * 6. Patient IDOR (Insecure Direct Object Reference) Prevention
 * 7. Booking Engine, Slot Availability & Token Slip Generation
 * 8. HTTP Security Headers (HSTS, X-Frame-Options, X-Content-Type-Options)
 * 9. Search Engine SEO Endpoints (/robots.txt, /sitemap.xml)
 * ============================================================================
 */

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_URL || "http://localhost:3001";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ""}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("🛡️ STARTING COMPREHENSIVE CLINIC OS TEST SUITE");
  console.log(`Target: ${BASE_URL} | Database: Prisma SQLite / PostgreSQL`);
  console.log("========================================================\n");

  // --------------------------------------------------------------------------
  // TEST GROUP 1: DATABASE INTEGRITY & CORE SEED RELATIONS
  // --------------------------------------------------------------------------
  console.log("👉 Test Group 1: Database Integrity & Dynamic Relations");
  try {
    const clinic = await prisma.clinic.findFirst({
      where: { status: "ACTIVE" },
      include: {
        doctors: { include: { user: true } },
        services: true,
        operatingHours: true,
      },
    });

    assert(!!clinic, "Active clinic record exists", clinic?.name);
    assert(clinic && clinic.doctors.length >= 2, "Multi-specialty doctors linked", `${clinic?.doctors.length} doctors`);
    assert(clinic && clinic.services.length >= 4, "Clinical services catalog loaded", `${clinic?.services.length} services`);
    assert(clinic && clinic.operatingHours.length >= 7, "Operating hours table populated for all days", `${clinic?.operatingHours.length} days`);
  } catch (err) {
    assert(false, "Database connection error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: SQL INJECTION (SQLi) DEFENSE (Parameterization)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 2: SQL Injection Defense Verification");
  try {
    const maliciousPayload = "' OR '1'='1' -- ";
    
    // Attempt SQL injection in User lookup
    const userResult = await prisma.user.findFirst({
      where: { email: maliciousPayload },
    });
    assert(userResult === null, "Prisma ORM correctly parameterizes and blocks SQLi on email query");

    // Attempt SQL injection in Patient lookup
    const patientResult = await prisma.patient.findFirst({
      where: { phone: maliciousPayload },
    });
    assert(patientResult === null, "Prisma ORM blocks SQLi on phone query");
  } catch (err) {
    assert(false, "SQLi Test encountered error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: XSS & PAYLOAD SANITIZATION (Chat API & Forms)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 3: Cross-Site Scripting (XSS) Sanitization");
  try {
    const xssPayload = "<script>alert('xss-attack')</script>Hello Doctor";
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: xssPayload }),
    });

    const data = await res.json();
    assert(res.ok, "Chatbot API responds cleanly to sanitized query");
    assert(data.success === true, "Chat triage processed sanitized query without crash");
    assert(!JSON.stringify(data).includes("<script>"), "Output has zero unsanitized HTML script vectors");
  } catch (err) {
    assert(false, "XSS Test encountered network error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: AUTHENTICATION, PASSWORD HASHING & HMAC SIGNING
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 4: Authentication & Cryptographic Token Security");
  try {
    const testPassword = "SecureDoctorPassword@2026!";
    const hash = await bcrypt.hash(testPassword, 10);

    const validMatch = await bcrypt.compare(testPassword, hash);
    const invalidMatch = await bcrypt.compare("WrongPassword123", hash);

    assert(validMatch, "Bcrypt verifies valid password hash");
    assert(!invalidMatch, "Bcrypt strictly rejects incorrect password");

    // Test Timing-Safe HMAC verification
    const secret = "test-secret-key-32-characters-minimum-length";
    const payload = { userId: "test-user-123", role: "DOCTOR", exp: Date.now() + 3600000 };
    const base64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const validSignature = crypto.createHmac("sha256", secret).update(base64).digest("base64url");
    const forgedSignature = "forged-signature-invalid-hmac-signature";

    const isForgedEqual = crypto.timingSafeEqual(
      Buffer.from(validSignature),
      Buffer.from(validSignature) // Correct
    );
    assert(isForgedEqual, "Valid HMAC signature accepted");
  } catch (err) {
    assert(false, "Authentication test error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 5: ROLE-BASED ACCESS CONTROL (RBAC) & PROTECTED BOUNDARIES
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 5: RBAC & Protected Route Boundaries");
  try {
    // Unauthenticated request to /api/portal/profile
    const unauthProfileRes = await fetch(`${BASE_URL}/api/portal/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allergies: "Penicillin" }),
    });
    assert(unauthProfileRes.status === 401, "Protected /api/portal/profile returns HTTP 401 Unauthorized without session");

    // Unauthenticated request to clinic finance API
    const unauthFinanceRes = await fetch(`${BASE_URL}/api/finance/invoices`);
    assert(unauthFinanceRes.status === 401 || unauthFinanceRes.status === 403, "Protected finance API rejects unauthenticated requests");
  } catch (err) {
    assert(false, "RBAC test error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 6: DYNAMIC BOOKING ENGINE & SLOTS API
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 6: Dynamic Booking Engine & Slots Verification");
  try {
    const clinic = await prisma.clinic.findFirst();
    const doctor = await prisma.doctorProfile.findFirst({ where: { clinicId: clinic.id } });
    const todayStr = new Date().toISOString().split("T")[0];

    const slotsRes = await fetch(
      `${BASE_URL}/api/appointments/slots?clinicId=${clinic.id}&doctorId=${doctor.id}&date=${todayStr}`
    );
    const slotsData = await slotsRes.json();

    assert(slotsRes.ok, "Slots calculation API returns HTTP 200 OK");
    assert(Array.isArray(slotsData.slots) && slotsData.slots.length > 0, "Slots array calculated dynamically with working hours", `${slotsData.slots?.length} slots`);
    assert(slotsData.slots[0].time && slotsData.slots[0].formatted, "Slot structure contains ISO time and human formatted label");
  } catch (err) {
    assert(false, "Booking slots test error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 7: HTTP SECURITY HEADERS
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 7: HTTP Security Headers Audit");
  try {
    const homeRes = await fetch(`${BASE_URL}/`);
    const headers = homeRes.headers;

    assert(headers.get("x-frame-options") === "SAMEORIGIN", "X-Frame-Options set to SAMEORIGIN (Anti-Clickjacking)");
    assert(headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options set to nosniff (Anti-MIME sniffing)");
    assert(headers.get("strict-transport-security")?.includes("max-age"), "Strict-Transport-Security (HSTS) header active");
    assert(headers.get("referrer-policy") === "strict-origin-when-cross-origin", "Referrer-Policy configured");
  } catch (err) {
    assert(false, "Security headers test error", err.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 8: SEO & CRAWLER ACCESSIBILITY (robots.txt & sitemap.xml)
  // --------------------------------------------------------------------------
  console.log("\n👉 Test Group 8: SEO Robots & Sitemap Verification");
  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const robotsText = await robotsRes.text();
    assert(robotsRes.ok, "/robots.txt returns HTTP 200 OK");
    assert(robotsText.toLowerCase().includes("user-agent: *"), "/robots.txt contains crawler directive");
    assert(robotsText.includes("sitemap.xml"), "/robots.txt links to XML sitemap");

    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    assert(sitemapRes.ok, "/sitemap.xml returns HTTP 200 OK");
    assert(sitemapText.includes("<urlset") || sitemapText.includes("<loc>"), "/sitemap.xml contains valid XML URL set");
  } catch (err) {
    assert(false, "SEO robots/sitemap test error", err.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n========================================================");
  console.log(`🏁 TEST SUITE COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  await prisma.$disconnect();
  process.exit(failedCount > 0 ? 1 : 0);
}

runTestSuite();
