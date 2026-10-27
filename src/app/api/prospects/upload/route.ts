import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { parseProspectsBuffer, importProspects } from "@/services/prospectService";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parsed = parseProspectsBuffer(buffer);
    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "Could not parse any valid clinic prospect rows from file." },
        { status: 400 }
      );
    }

    const results = await importProspects(parsed);

    return NextResponse.json({
      success: true,
      results,
      parsedCount: parsed.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to parse prospect spreadsheet" },
      { status: 500 }
    );
  }
}
