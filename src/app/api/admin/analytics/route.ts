import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { getEcommerceAnalytics } from "@/lib/analyticsStore";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "CONTENT_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const analytics = await getEcommerceAnalytics({ startDate, endDate });

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to load analytics." } },
      { status: 500 }
    );
  }
}
