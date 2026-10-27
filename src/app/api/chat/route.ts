import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================================
// 1. RATE LIMITING ENGINE (In-Memory Sliding Window)
// Protects against bot flooding, automated scrapers, and DDoS attempts
// ============================================================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 8;      // Max 8 chat messages per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const client = rateLimitMap.get(ip);

  // Clean old window
  if (!client || now > client.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (client.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  client.count += 1;
  return false;
}

// Cleanup stale IPs every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((data, ip) => {
    if (now > data.resetAt) {
      rateLimitMap.delete(ip);
    }
  });
}, 5 * 60 * 1000);

// ============================================================================
// 2. INPUT VALIDATION & SANITIZATION SCHEMA (Anti-Injection & XSS Defense)
// ============================================================================
const ChatInputSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(300, "Message length exceeded (max 300 characters)")
    .transform((str) =>
      // Strip HTML tags, script vectors, and dangerous control characters
      str
        .replace(/<[^>]*>?/gm, "")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim()
    ),
});

// ============================================================================
// 3. CLINICAL TRIAGE KNOWLEDGE REPOSITORY (Zero-Trust, Hardened)
// ============================================================================
const CLINIC_KNOWLEDGE = {
  name: "Apex Dental & Aesthetic Lounge",
  doctors: [
    {
      name: "Dr. Ananya Kulkarni",
      qualifications: "BDS, MDS (Prosthodontics & Implantology)",
      regNumber: "MDC-74921",
      experience: "12+ Years",
      specialty: "Dental Implants, Smile Architecture, Single-Sitting RCT",
    },
    {
      name: "Dr. Rohan Deshmukh",
      qualifications: "MBBS, MD (Dermatology, Venereology & Leprosy)",
      regNumber: "MMC-2015-8832",
      experience: "10+ Years",
      specialty: "Clinical Dermatology, Laser Aesthetics, Acne Scar Subcision",
    },
  ],
  timings: "Mon-Sat: 09:30 AM – 08:30 PM | Sun: 10:00 AM – 02:00 PM (Emergency Trauma & Pre-booked)",
  location: "Plot 42, West Avenue, Kalyani Nagar / Somwar Peth, Pune - 411006 (Landmark: Near Jogger's Park)",
  contact: "+91 98230 45678 / +91 (020) 2668-9100",
  whatsapp: "+91 98230 45678",
  fees: [
    "Consultation & Diagnostic X-Rays: ₹500",
    "Digital Scaling & Polishing: ₹1,500",
    "Single-Visit Rotary Root Canal: ₹4,500",
    "Ceramic / Zirconia Crown: ₹8,000",
    "Invisalign / Clear Aligners: From ₹65,000",
    "Chemical Peel & Skin Rejuvenation: ₹3,500",
  ],
};

// ============================================================================
// 4. DEFENSIVE CLINICAL TRIAGE RESPONDER
// Sanitized matching ensuring NO server-side execution, code eval, or prompt escape
// ============================================================================
function generateSecureTriageResponse(sanitizedQuery: string): { reply: string; actionUrl?: string; actionText?: string } {
  const q = sanitizedQuery.toLowerCase();

  // Attack Detection: Reject jailbreak / prompt dump attempts
  const suspiciousKeywords = [
    "system prompt",
    "ignore previous",
    "jailbreak",
    "as dan",
    "execute",
    "select *",
    "drop table",
    "union select",
    "base64",
    "<script",
    "eval(",
    "delete from",
    "__proto__",
  ];

  if (suspiciousKeywords.some((kw) => q.includes(kw))) {
    return {
      reply:
        "Security Alert: Your request contains invalid or unauthorized patterns. Dr. Apex Virtual Assistant strictly handles clinical scheduling, doctor credentials, clinic timings, and appointment queries.",
    };
  }

  // 1. Timings & Working Hours
  if (q.includes("timing") || q.includes("hours") || q.includes("open") || q.includes("sunday") || q.includes("close")) {
    return {
      reply: `Apex Dental & Aesthetic Lounge is open:\n\n• Monday to Saturday: 09:30 AM – 08:30 PM\n• Sunday: 10:00 AM – 02:00 PM (Emergency & Pre-booked)\n\nConsultations are scheduled in 30-minute private slots to ensure zero waiting time.`,
      actionUrl: "/contact",
      actionText: "View Timings & Location",
    };
  }

  // 2. Doctor Qualifications & Reg Numbers
  if (q.includes("doctor") || q.includes("ananya") || q.includes("rohan") || q.includes("qualification") || q.includes("experience") || q.includes("specialist")) {
    return {
      reply: `Our clinic is led by senior verified medical specialists:\n\n• Dr. Ananya Kulkarni — BDS, MDS (Prosthodontics & Implantology), Reg: MDC-74921 (12+ yrs experience).\n• Dr. Rohan Deshmukh — MBBS, MD (Dermatology), Reg: MMC-2015-8832 (10+ yrs experience).\n\nBoth doctors maintain active state council licenses with zero disciplinary records.`,
      actionUrl: "/about",
      actionText: "Read Doctor Bios & Credentials",
    };
  }

  // 3. Fees & Pricing
  if (q.includes("fee") || q.includes("cost") || q.includes("price") || q.includes("rate") || q.includes("charge") || q.includes("rct cost") || q.includes("how much")) {
    return {
      reply: `We believe in transparent, honest pricing with zero hidden surcharges:\n\n• Comprehensive Consultation: ₹500\n• Full Mouth Scaling & Ultrasonic Polish: ₹1,500\n• Single-Visit Rotary Endodontics (RCT): ₹4,500\n• Zirconia CAD/CAM Crown: ₹8,000\n• Clear Aligners / Invisalign: From ₹65,000\n• Medical Dermatological Peel: ₹3,500\n\nAll treatments include computerized GST receipts for insurance & tax deduction.`,
      actionUrl: "/services",
      actionText: "View Full Treatment Menu",
    };
  }

  // 4. Emergency Toothache / Acute Dental Pain
  if (q.includes("pain") || q.includes("toothache") || q.includes("emergency") || q.includes("swelling") || q.includes("bleeding") || q.includes("broken")) {
    return {
      reply: `Clinical First-Aid Notice:\n\nIf you are experiencing severe acute dental pain or facial swelling:\n1. Rinse with warm saline (salt water).\n2. Avoid placing crushed aspirin directly on the gums.\n3. Apply a cold compress outside the cheek.\n\n⚠️ Please visit our clinic immediately or call our emergency triage desk at +91 98230 45678. We keep designated same-day priority emergency slots.`,
      actionUrl: "/book",
      actionText: "Book Same-Day Emergency Slot",
    };
  }

  // 5. Booking & Appointments
  if (q.includes("book") || q.includes("appointment") || q.includes("schedule") || q.includes("slot") || q.includes("visit")) {
    return {
      reply: `You can instantly reserve a confirmed consultation online in 4 simple steps:\n\n1. Select your desired service (Dental / Dermatology).\n2. Choose Dr. Ananya or Dr. Rohan.\n3. Pick an available date & time slot.\n4. Receive your official Hospital Pass & Booking Reference instantly.`,
      actionUrl: "/book",
      actionText: "Open Online Booking Widget",
    };
  }

  // 6. Location, Directions, Parking
  if (q.includes("location") || q.includes("where") || q.includes("address") || q.includes("pune") || q.includes("kalyani") || q.includes("somwar") || q.includes("parking")) {
    return {
      reply: `Apex Dental & Aesthetic Lounge is conveniently located at:\n\n📍 Plot 42, West Avenue, Kalyani Nagar / Somwar Peth, Pune - 411006\n(Landmark: Near Jogger's Park)\n\n• Reserved valet parking available for patients.\n• Wheelchair accessible entrance and operatory suites.`,
      actionUrl: "/contact",
      actionText: "Get Map Directions",
    };
  }

  // 7. Prescriptions, Receipts & Patient Portal
  if (q.includes("prescription") || q.includes("portal") || q.includes("slip") || q.includes("pass") || q.includes("bill") || q.includes("receipt") || q.includes("download")) {
    return {
      reply: `You can access and print your verified doctor prescriptions, appointment passes, and tax receipts anytime through our Patient Portal. Enter your Booking Reference (e.g. APT-2610-1000) or phone number for instant access.`,
      actionUrl: "/portal",
      actionText: "Open Patient Health Portal",
    };
  }

  // 8. General Healthcare / Dermatology / Dental Advice
  return {
    reply: `Hello! I am Dr. Apex's virtual assistant for Apex Dental & Aesthetic Lounge, Pune.\n\nI can help you with:\n• Booking an appointment with Dr. Ananya or Dr. Rohan\n• Checking transparent treatment fees & pricing\n• Clinic timings & emergency trauma directions\n• Accessing your digital prescriptions & slips\n\nHow may I assist your care today? You can also message our front desk directly on WhatsApp at +91 98230 45678.`,
    actionUrl: "/book",
    actionText: "Book Consultation",
  };
}

// ============================================================================
// 5. SECURE ROUTE HANDLER
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    // A. Enforce Content-Type
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected application/json" },
        { status: 415 }
      );
    }

    // B. IP Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a minute before sending another message or contact our front desk at +91 98230 45678.",
        },
        { status: 429 }
      );
    }

    // C. Validate & Sanitize Input
    const body = await req.json();
    const parseResult = ChatInputSchema.safeParse(body);

    if (!parseResult.success) {
      const errMsg = parseResult.error.errors[0]?.message || "Invalid message format";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const { message } = parseResult.data;

    // D. Generate Safe Triage Response
    const response = generateSecureTriageResponse(message);

    return NextResponse.json({
      success: true,
      reply: response.reply,
      actionUrl: response.actionUrl,
      actionText: response.actionText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chatbot API Security Handler Error:", error);
    return NextResponse.json(
      { error: "Internal assistant error. Please try again or contact clinic reception." },
      { status: 500 }
    );
  }
}
