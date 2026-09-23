import { NextRequest, NextResponse } from "next/server";
import { fetchYouTubeVideoByUrl } from "@/lib/youtubeService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, message: "YouTube URL or Video ID is required." },
        { status: 400 }
      );
    }

    const videoData = await fetchYouTubeVideoByUrl(url);

    return NextResponse.json(
      {
        success: true,
        video: videoData,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch YouTube video details." },
      { status: 400 }
    );
  }
}
