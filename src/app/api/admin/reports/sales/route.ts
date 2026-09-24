import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { getEcommerceAnalytics } from "@/lib/analyticsStore";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminRole(["SUPER_ADMIN", "SALES"]);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await getEcommerceAnalytics({ startDate, endDate });

    return NextResponse.json({
      success: true,
      report: {
        grossRevenue: data.grossRevenue,
        netRevenue: data.netRevenue,
        totalRefunds: data.totalRefunds,
        totalPaidOrders: data.totalPaidOrders,
        aov: data.aov,
        dailyBreakdown: data.dailyRevenue,
        topPlans: data.topFloorPlans,
        attribution: data.attribution,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error?.message || "Failed to generate sales report." } },
      { status: 500 }
    );
  }
}
