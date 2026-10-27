import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otpService";

const verifyOtpSchema = z.object({
  identifier: z.string().min(3, "Identifier required"),
  code: z.string().length(6, "OTP must be exactly 6 digits"),
  type: z.enum(["EMAIL_VERIFY", "PHONE_VERIFY", "PASSWORD_RESET"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.parse(body);

    const result = await verifyOtp({
      identifier: parsed.identifier,
      code: parsed.code,
      type: parsed.type,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
