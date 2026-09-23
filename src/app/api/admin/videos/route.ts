import { NextRequest, NextResponse } from "next/server";
import { 
  getAllVideos, 
  updateVideoCategory, 
  toggleVideoPublish, 
  deleteLocalVideo, 
  upsertVideo, 
  readSyncStats 
} from "@/lib/videoStore";
import { requireAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const videos = getAllVideos({ category, search });
    const stats = readSyncStats();

    return NextResponse.json(
      {
        success: true,
        stats,
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
      { success: false, message: error.message || "Failed to fetch admin videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { action, id, category, isPublished, videoData } = body;

    if (action === "updateCategory") {
      if (!id || !category) {
        return NextResponse.json({ success: false, message: "ID and Category are required" }, { status: 400 });
      }
      const updated = updateVideoCategory(id, category);
      return NextResponse.json({ success: updated, message: updated ? "Category updated" : "Video not found" });
    }

    if (action === "togglePublish") {
      if (!id) {
        return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
      }
      const updated = toggleVideoPublish(id, isPublished);
      return NextResponse.json({ success: updated, message: updated ? "Publish status updated" : "Video not found" });
    }

    if (action === "deleteLocal") {
      if (!id) {
        return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
      }
      const deleted = deleteLocalVideo(id);
      return NextResponse.json({ success: deleted, message: deleted ? "Local record removed" : "Video not found" });
    }

    if (action === "upsertManual") {
      if (!videoData || !videoData.youtubeVideoId) {
        return NextResponse.json({ success: false, message: "YouTube Video ID is required" }, { status: 400 });
      }
      const res = upsertVideo(videoData);
      return NextResponse.json({ success: true, isNew: res.isNew, video: res.video });
    }

    return NextResponse.json({ success: false, message: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Admin video operation failed" },
      { status: 500 }
    );
  }
}
