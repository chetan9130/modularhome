import { NextRequest, NextResponse } from "next/server";
import { getPublicCollections } from "@/lib/publicData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const featuredOnly = searchParams.get("featured") === "true";

    let collections = await getPublicCollections();

    if (featuredOnly) {
      collections = collections.filter((c) => c.isFeatured);
    }

    if (limit && limit > 0) {
      collections = collections.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      count: collections.length,
      data: collections,
    });
  } catch (error: any) {
    console.error("Error fetching public collections API:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
