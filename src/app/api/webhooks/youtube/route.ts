import { NextRequest, NextResponse } from "next/server";
import { runAutoBlogSync } from "@/lib/autoBlogSync";
import { parseYouTubeAtomFeed } from "@/lib/youtubeRss";
import { generateSeoBlogFromVideo } from "@/lib/seoBlogGenerator";
import { saveCustomBlog } from "@/lib/blogStore";
import { upsertVideo } from "@/lib/videoStore";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Handles Google WebSub (PubSubHubbub) challenge verification.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" || mode === "unsubscribe") {
    if (challenge) {
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  return NextResponse.json({ status: "ready", service: "YouTube WebSub Webhook" });
}

/**
 * Handles incoming YouTube video push notifications from Google WebSub.
 */
export async function POST(request: NextRequest) {
  try {
    const rawXml = await request.text();

    if (!rawXml) {
      // Trigger general sync if payload is empty
      const res = await runAutoBlogSync({ force: true });
      return NextResponse.json({ mode: "fallback_sync", ...res });
    }

    const channelId = process.env.YOUTUBE_CHANNEL_ID || "UCu_Q38VwYk6_kR1Y2sQcM1A";
    const parsedVideos = parseYouTubeAtomFeed(rawXml, channelId);

    if (parsedVideos.length === 0) {
      // Run general auto sync if XML entry parsing didn't match
      const res = await runAutoBlogSync({ force: true });
      return NextResponse.json({ mode: "fallback_parsed", ...res });
    }

    const createdBlogs: string[] = [];

    for (const video of parsedVideos) {
      if (!video.youtubeVideoId) continue;

      // 1. Register video
      upsertVideo({
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        publishedAt: video.publishedAt,
        channelTitle: video.channelTitle,
        category: video.category as any,
      });

      // 2. Generate SEO Blog
      const newBlog = generateSeoBlogFromVideo(video);
      saveCustomBlog(newBlog);

      // 3. Persist to Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabaseAdmin.from("blogs").upsert(
            {
              id: newBlog.id,
              slug: newBlog.slug,
              title: newBlog.title,
              category: newBlog.category,
              read_time: newBlog.readTime,
              excerpt: newBlog.excerpt,
              content: newBlog.content,
              featured_image: newBlog.image,
              published_at: newBlog.publishedAt,
              author_name: newBlog.author,
              status: "PUBLISHED",
              categories: newBlog.categories,
              tags: newBlog.tags,
              embedded_video_url: newBlog.embeddedVideoUrl,
              seo_title: newBlog.seoTitle,
              meta_description: newBlog.metaDescription,
              image_alt_text: newBlog.imageAltText,
              canonical_url: newBlog.canonicalUrl,
              key_takeaways: newBlog.keyTakeaways,
              created_at: newBlog.createdAt,
              updated_at: newBlog.updatedAt,
            },
            { onConflict: "slug" }
          );
        } catch (dbErr) {
          console.error("Supabase webhook blog insert error:", dbErr);
        }
      }

      createdBlogs.push(newBlog.slug);
    }

    return NextResponse.json({
      success: true,
      receivedVideos: parsedVideos.length,
      createdBlogs,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process YouTube webhook" },
      { status: 500 }
    );
  }
}
