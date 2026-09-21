import { NextRequest, NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/publicData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const isFeatured = searchParams.get("isFeatured") === "true";

    const data = await getPublicProducts({ category, search, isFeatured });

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching public products:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
