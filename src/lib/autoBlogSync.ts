import { generateSeoBlogFromVideo, VideoMetadataInput } from "./seoBlogGenerator";
import { fetchYouTubeChannelRss } from "./youtubeRss";
import { saveCustomBlog, readBlogsFromStore } from "./blogStore";
import { upsertVideo, readVideosFromStore } from "./videoStore";
import { isYouTubeShort, KNOWN_DEMO_VIDEO_IDS } from "./youtubeService";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

// In-memory sync lock to prevent duplicate runs in same node instance
let lastSyncTimestamp = 0;
let isSyncInProgress = false;
const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes minimum interval for auto-checks

export interface AutoBlogSyncResult {
  success: boolean;
  message: string;
  checkedCount: number;
  newBlogsCreated: number;
  createdSlugs: string[];
  durationMs: number;
}

function parseDurationStringSeconds(durationStr?: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(":").map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}

/**
 * Runs the automated YouTube -> SEO Blog synchronization workflow.
 */
export async function runAutoBlogSync(options?: { force?: boolean }): Promise<AutoBlogSyncResult> {
  const startTime = Date.now();

  if (isSyncInProgress) {
    return {
      success: true,
      message: "Sync already in progress.",
      checkedCount: 0,
      newBlogsCreated: 0,
      createdSlugs: [],
      durationMs: Date.now() - startTime,
    };
  }

  if (!options?.force && Date.now() - lastSyncTimestamp < SYNC_INTERVAL_MS) {
    return {
      success: true,
      message: "Skipped: channel checked recently within throttle window.",
      checkedCount: 0,
      newBlogsCreated: 0,
      createdSlugs: [],
      durationMs: Date.now() - startTime,
    };
  }

  isSyncInProgress = true;
  lastSyncTimestamp = Date.now();

  try {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;

    let candidateVideos: VideoMetadataInput[] = [];

    // 1. Try YouTube Data API v3 if API key is provided
    if (apiKey && channelId) {
      try {
        const { syncYouTubeChannel } = await import("./youtubeService");
        const apiResult = await syncYouTubeChannel();
        if (apiResult.success) {
          const stored = readVideosFromStore();
          candidateVideos = stored.map((v) => ({
            youtubeVideoId: v.youtubeVideoId,
            title: v.title,
            description: v.description,
            publishedAt: v.publishedAt,
            thumbnail: v.thumbnail,
            channelTitle: v.channelTitle,
            duration: v.duration,
            views: v.views,
            category: v.category,
          }));
        }
      } catch (apiErr) {
        console.warn("YouTube API sync error, falling back to RSS:", apiErr);
      }
    }

    // 2. If API was not used or yielded no candidates, fetch via YouTube RSS Atom feed
    if (candidateVideos.length === 0 && channelId) {
      candidateVideos = await fetchYouTubeChannelRss(channelId);
    }

    // 3. Fallback to known video library seeds if RSS/API are offline
    if (candidateVideos.length === 0) {
      const stored = readVideosFromStore();
      candidateVideos = stored.map((v) => ({
        youtubeVideoId: v.youtubeVideoId,
        title: v.title,
        description: v.description,
        publishedAt: v.publishedAt,
        thumbnail: v.thumbnail,
        channelTitle: v.channelTitle || "Amish Built Cabins",
        duration: v.duration,
        views: v.views,
        category: v.category,
      }));
    }

    // Filter candidate videos: Remove demo videos and remove Shorts (duration <= 60s or short titles)
    candidateVideos = candidateVideos.filter((v) => {
      if (!v.youtubeVideoId || KNOWN_DEMO_VIDEO_IDS.has(v.youtubeVideoId)) {
        return false;
      }
      const durSec = parseDurationStringSeconds(v.duration);
      if (isYouTubeShort(durSec, v.title, v.description)) {
        return false;
      }
      return true;
    });

    if (candidateVideos.length === 0) {
      return {
        success: true,
        message: "No candidate YouTube videos found to process.",
        checkedCount: 0,
        newBlogsCreated: 0,
        createdSlugs: [],
        durationMs: Date.now() - startTime,
      };
    }

    // 4. Retrieve existing blog posts to avoid duplicate articles
    const existingBlogs = readBlogsFromStore();
    const existingVideoIds = new Set<string>();
    const existingSlugs = new Set<string>();

    for (const b of existingBlogs) {
      if (b.slug) existingSlugs.add(b.slug.toLowerCase());
      if (b.id && b.id.startsWith("blog-yt-")) {
        existingVideoIds.add(b.id.replace("blog-yt-", ""));
      }
      if (b.embeddedVideoUrl) {
        const match = b.embeddedVideoUrl.match(/(?:v=|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match && match[1]) existingVideoIds.add(match[1]);
      }
    }

    // Also check Supabase blogs if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: dbBlogs } = await supabaseAdmin
          .from("blogs")
          .select("id, slug, embedded_video_url");
        if (dbBlogs && dbBlogs.length > 0) {
          for (const dbBlog of dbBlogs) {
            if (dbBlog.slug) existingSlugs.add(dbBlog.slug.toLowerCase());
            if (dbBlog.id && dbBlog.id.startsWith("blog-yt-")) {
              existingVideoIds.add(dbBlog.id.replace("blog-yt-", ""));
            }
            if (dbBlog.embedded_video_url) {
              const match = dbBlog.embedded_video_url.match(/(?:v=|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              if (match && match[1]) existingVideoIds.add(match[1]);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase query check in autoBlogSync warning:", err);
      }
    }

    const createdSlugs: string[] = [];

    // 5. Generate and persist new SEO blogs for any unprocessed YouTube video
    for (const video of candidateVideos) {
      if (!video.youtubeVideoId) continue;

      // Upsert into video store so videos page has it
      upsertVideo({
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        publishedAt: video.publishedAt,
        channelTitle: video.channelTitle,
        category: video.category as any,
      });

      // If a blog already exists for this video ID, skip duplicate generation
      if (existingVideoIds.has(video.youtubeVideoId)) {
        continue;
      }

      // Generate the rich SEO blog post
      const newBlog = generateSeoBlogFromVideo(video);

      // Save to local file store
      saveCustomBlog(newBlog);

      // Save to Supabase `blogs` table if configured
      if (isSupabaseConfigured()) {
        try {
          const supabaseBlogPayload = {
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
          };

          await supabaseAdmin.from("blogs").upsert(supabaseBlogPayload, { onConflict: "slug" });
        } catch (dbErr) {
          console.error("Error persisting auto-generated blog to Supabase:", dbErr);
        }
      }

      existingVideoIds.add(video.youtubeVideoId);
      existingSlugs.add(newBlog.slug.toLowerCase());
      createdSlugs.push(newBlog.slug);
    }

    return {
      success: true,
      message: `Auto blog sync complete. Evaluated ${candidateVideos.length} main videos, created ${createdSlugs.length} new SEO blogs.`,
      checkedCount: candidateVideos.length,
      newBlogsCreated: createdSlugs.length,
      createdSlugs,
      durationMs: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error("Auto blog sync failure:", error);
    return {
      success: false,
      message: error.message || "Failed to complete automated YouTube blog sync.",
      checkedCount: 0,
      newBlogsCreated: 0,
      createdSlugs: [],
      durationMs: Date.now() - startTime,
    };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Non-blocking background trigger for user traffic requests.
 * Runs asynchronously without adding latency to the user response.
 */
export function triggerBackgroundAutoSync(): void {
  if (Date.now() - lastSyncTimestamp < SYNC_INTERVAL_MS || isSyncInProgress) {
    return;
  }

  // Fire-and-forget
  setTimeout(() => {
    runAutoBlogSync({ force: false }).catch((err) => {
      console.warn("Background auto sync execution notice:", err);
    });
  }, 100);
}
