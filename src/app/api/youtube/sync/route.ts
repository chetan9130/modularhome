import { NextRequest, NextResponse } from "next/server";
import { syncYouTubeChannel } from "@/lib/youtubeService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const result = await syncYouTubeChannel();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          stats: result.stats,
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        checkedCount: result.checkedCount,
        newVideosCount: result.newVideosCount,
        updatedVideosCount: result.updatedVideosCount,
        stats: result.stats,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to execute YouTube sync.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST({} as NextRequest);
}
