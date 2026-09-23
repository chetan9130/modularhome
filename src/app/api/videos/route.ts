import { NextRequest, NextResponse } from "next/server";
import { getPublishedVideos } from "@/lib/videoStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const videos = getPublishedVideos({ category, search });

    return NextResponse.json(
      {
        success: true,
        count: videos.length,
        videos,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
