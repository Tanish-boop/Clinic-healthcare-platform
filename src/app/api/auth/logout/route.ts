import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await destroySession();

  const acceptHeader = req.headers.get("accept") || "";
  const isHtmlRequest = acceptHeader.includes("text/html");

  const response = isHtmlRequest
    ? NextResponse.redirect(new URL("/", req.nextUrl), 303)
    : NextResponse.json({ success: true, redirectUrl: "/" });

  response.cookies.set("medinexus_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function GET(req: NextRequest) {
  await destroySession();

  const response = NextResponse.redirect(new URL("/", req.nextUrl), 303);

  response.cookies.set("medinexus_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
