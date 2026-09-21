import { NextRequest, NextResponse } from "next/server";
import { getPublicBlogs } from "@/lib/publicData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await getPublicBlogs({ category, search });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
