import { NextRequest, NextResponse } from "next/server";
import { getPublicFloorPlans } from "@/lib/publicData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await getPublicFloorPlans({ category, search });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching public floor plans:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch floor plans" },
      { status: 500 }
    );
  }
}
