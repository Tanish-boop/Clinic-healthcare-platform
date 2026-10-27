import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "@/lib/otpService";

const sendOtpSchema = z.object({
  identifier: z.string().min(3, "Valid email address or phone number is required"),
  type: z.enum(["EMAIL_VERIFY", "PHONE_VERIFY", "PASSWORD_RESET"]),
  channel: z.enum(["EMAIL", "SMS"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.parse(body);

    const result = await sendOtp({
      identifier: parsed.identifier,
      type: parsed.type,
      channel: parsed.channel,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error, retryAfter: result.retryAfter }, { status: 429 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch verification code" },
      { status: 500 }
    );
  }
}
