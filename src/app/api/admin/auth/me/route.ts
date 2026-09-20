import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";

export async function GET() {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json({
    success: true,
    user: authResult,
    data: authResult,
  });
}
