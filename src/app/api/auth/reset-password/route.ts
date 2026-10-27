import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithOtp } from "@/lib/otpService";

const resetPasswordSchema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  code: z.string().length(6, "6-digit OTP code is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.parse(body);

    const result = await resetPasswordWithOtp({
      identifier: parsed.identifier,
      code: parsed.code,
      newPassword: parsed.newPassword,
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
      { error: error?.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
