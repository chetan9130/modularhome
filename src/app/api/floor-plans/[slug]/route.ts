import { NextRequest, NextResponse } from "next/server";
import { getPublicFloorPlanBySlug } from "@/lib/publicData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const plan = await getPublicFloorPlanBySlug(slug);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Floor plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch floor plan" },
      { status: 500 }
    );
  }
}
