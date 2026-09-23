import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/auth";
import { getActivityLogs } from "@/lib/activityLog";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminRole(["SUPER_ADMIN"]);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 100;
    const entityType = searchParams.get("entityType") || undefined;
    const action = searchParams.get("action") || undefined;
    const userId = searchParams.get("userId") || undefined;

    const logs = await getActivityLogs({ limit, entityType, action, userId });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch logs.", code: "LOG_FETCH_ERROR" } },
      { status: 500 }
    );
  }
}
