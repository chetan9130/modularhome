import fs from "fs";
import path from "path";
import { VideoItem, SyncStats } from "@/types/video";
import { VIDEOS_DATA } from "@/data/videos";
import syncedVideosFallback from "@/data/synced_videos.json";
import syncStatsFallback from "@/data/sync_stats.json";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "synced_videos.json");
const STATS_FILE_PATH = path.join(DATA_DIR, "sync_stats.json");

// In-memory cache
let memoryVideosCache: VideoItem[] | null = null;
let memoryStatsCache: SyncStats | null = null;

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Expected on read-only serverless filesystems (e.g., Vercel AWS Lambda)
  }
}

export function normalizeVideo(v: any): VideoItem {
  const ytId =
    v.youtubeVideoId ||
    v.youtube_video_id ||
    (v.id && !v.id.startsWith("vid-") ? v.id : v.id ? v.id.replace("vid-", "") : "MHWHDE87Pp4");
  const embed = v.embedUrl || v.embed_url || `https://www.youtube-nocookie.com/embed/${ytId}`;
  return {
    id: v.id || `vid-${ytId}`,
    youtubeVideoId: ytId,
    title: v.title || "Modular Home & Cabin Tour",
    category: v.category || "Building Tours",
    duration: v.duration || "4:00",
    description: v.description || "",
    thumbnail: v.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    modelSlug: v.modelSlug || v.model_slug,
    views: v.views || "10K views",
    date: v.date || "Recent",
    publishedAt: v.publishedAt || v.published_at || new Date().toISOString(),
    youtubeUrl: v.youtubeUrl || v.youtube_url || `https://www.youtube.com/watch?v=${ytId}`,
    embedUrl: embed,
    videoUrl: v.videoUrl || v.video_url || embed,
    channelId: v.channelId || v.channel_id || "UCe8Cs76lnVixGuymeoyExKg",
    channelTitle: v.channelTitle || v.channel_title || "Amish Built Cabins, Modular Cabins, Modular Homes",
    isPublished: v.isPublished !== undefined ? v.isPublished : v.is_published !== false,
    createdAt: v.createdAt || v.created_at || new Date().toISOString(),
    updatedAt: v.updatedAt || v.updated_at || new Date().toISOString(),
  };
}

export function readVideosFromStore(): VideoItem[] {
  if (memoryVideosCache && memoryVideosCache.length > 0) {
    return memoryVideosCache;
  }

  try {
    ensureDataDirectory();
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryVideosCache = parsed.map(normalizeVideo);
        return memoryVideosCache;
      }
    }
  } catch (error) {
    // Silently fallback to bundled static data on read errors
  }

  if (Array.isArray(syncedVideosFallback) && syncedVideosFallback.length > 0) {
    const normalized = (syncedVideosFallback as any[]).map(normalizeVideo);
    memoryVideosCache = normalized;
    return normalized;
  }

  const normalizedSeeds = VIDEOS_DATA.map(normalizeVideo);
  memoryVideosCache = normalizedSeeds;
  return normalizedSeeds;
}

export function writeVideosToStore(videos: VideoItem[]): void {
  memoryVideosCache = videos;
  try {
    ensureDataDirectory();
    fs.writeFileSync(FILE_PATH, JSON.stringify(videos, null, 2), "utf-8");
  } catch (error) {
    // In Vercel serverless environment, local writes fail gracefully without crashing
  }
}

export function readSyncStats(): SyncStats {
  if (memoryStatsCache) return memoryStatsCache;

  try {
    ensureDataDirectory();
    if (fs.existsSync(STATS_FILE_PATH)) {
      const data = fs.readFileSync(STATS_FILE_PATH, "utf-8");
      memoryStatsCache = JSON.parse(data);
      return memoryStatsCache!;
    }
  } catch (error) {}

  if (syncStatsFallback) {
    memoryStatsCache = syncStatsFallback as SyncStats;
    return memoryStatsCache;
  }

  const defaultStats: SyncStats = {
    lastSyncAt: new Date().toISOString(),
    totalFound: VIDEOS_DATA.length,
    newVideosAdded: 0,
    updatedVideos: 0,
    status: "success",
  };
  memoryStatsCache = defaultStats;
  return defaultStats;
}

export function saveSyncStats(stats: SyncStats): void {
  memoryStatsCache = stats;
  try {
    ensureDataDirectory();
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2), "utf-8");
  } catch (error) {}
}

export function getPublishedVideos(params?: { category?: string; search?: string }): VideoItem[] {
  const videos = readVideosFromStore();
  let result = videos.filter((v) => v.isPublished !== false);

  if (params?.category && params.category !== "All" && params.category !== "ALL") {
    result = result.filter(
      (v) => (v.category || "").toLowerCase() === params.category!.toLowerCase()
    );
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (v) =>
        (v.title || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q) ||
        (v.category || "").toLowerCase().includes(q)
    );
  }

  // Sort newest first
  return result.sort(
    (a, b) => new Date(b.publishedAt || "").getTime() - new Date(a.publishedAt || "").getTime()
  );
}

export function getAllVideos(params?: { category?: string; search?: string }): VideoItem[] {
  const videos = readVideosFromStore();
  let result = [...videos];

  if (params?.category && params.category !== "All" && params.category !== "ALL") {
    result = result.filter(
      (v) => (v.category || "").toLowerCase() === params.category!.toLowerCase()
    );
  }

  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (v) =>
        (v.title || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
    );
  }

  return result.sort(
    (a, b) => new Date(b.publishedAt || "").getTime() - new Date(a.publishedAt || "").getTime()
  );
}

export function getVideoByIdOrSlug(idOrSlug: string): VideoItem | null {
  if (!idOrSlug) return null;
  const videos = readVideosFromStore();
  const lower = decodeURIComponent(idOrSlug).toLowerCase().trim().replace(/^vid-/, "");

  return (
    videos.find(
      (v) =>
        v.id.toLowerCase() === `vid-${lower}` ||
        v.id.toLowerCase() === lower ||
        v.youtubeVideoId.toLowerCase() === lower ||
        (v.modelSlug && v.modelSlug.toLowerCase() === lower) ||
        (v.title && v.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === lower)
    ) || null
  );
}

export function upsertVideo(videoData: Partial<VideoItem> & { youtubeVideoId: string }): {
  video: VideoItem;
  isNew: boolean;
} {
  const videos = readVideosFromStore();
  const existingIdx = videos.findIndex((v) => v.youtubeVideoId === videoData.youtubeVideoId);
  const now = new Date().toISOString();

  let finalVideo: VideoItem;
  let isNew = false;

  if (existingIdx >= 0) {
    const existing = videos[existingIdx];
    finalVideo = normalizeVideo({
      ...existing,
      ...videoData,
      updatedAt: now,
    });
    videos[existingIdx] = finalVideo;
    isNew = false;
  } else {
    finalVideo = normalizeVideo({
      id: `vid-${videoData.youtubeVideoId}`,
      youtubeVideoId: videoData.youtubeVideoId,
      title: videoData.title || "Untitled Cabin Video",
      category: videoData.category || "Building Tours",
      duration: videoData.duration || "4:00",
      description: videoData.description || "",
      thumbnail: videoData.thumbnail || `https://img.youtube.com/vi/${videoData.youtubeVideoId}/hqdefault.jpg`,
      views: videoData.views || "New Upload",
      date: videoData.date || "Just now",
      publishedAt: videoData.publishedAt || now,
      youtubeUrl: videoData.youtubeUrl || `https://www.youtube.com/watch?v=${videoData.youtubeVideoId}`,
      embedUrl: videoData.embedUrl || `https://www.youtube-nocookie.com/embed/${videoData.youtubeVideoId}`,
      videoUrl: videoData.videoUrl || `https://www.youtube-nocookie.com/embed/${videoData.youtubeVideoId}`,
      channelId: videoData.channelId || "UCe8Cs76lnVixGuymeoyExKg",
      channelTitle: videoData.channelTitle || "Amish Built Cabins, Modular Cabins, Modular Homes",
      isPublished: videoData.isPublished !== undefined ? videoData.isPublished : true,
      createdAt: now,
      updatedAt: now,
    });
    videos.unshift(finalVideo);
    isNew = true;
  }

  writeVideosToStore(videos);

  // Background sync to Supabase `videos` table if configured
  if (isSupabaseConfigured()) {
    (async () => {
      try {
        await supabaseAdmin.from("videos").upsert(
          {
            id: finalVideo.id,
            youtube_video_id: finalVideo.youtubeVideoId,
            title: finalVideo.title,
            category: finalVideo.category,
            duration: finalVideo.duration,
            description: finalVideo.description,
            thumbnail: finalVideo.thumbnail,
            views: finalVideo.views,
            date: finalVideo.date,
            published_at: finalVideo.publishedAt,
            youtube_url: finalVideo.youtubeUrl,
            embed_url: finalVideo.embedUrl,
            video_url: finalVideo.videoUrl,
            channel_id: finalVideo.channelId,
            channel_title: finalVideo.channelTitle,
            is_published: finalVideo.isPublished,
            created_at: finalVideo.createdAt,
            updated_at: finalVideo.updatedAt,
          },
          { onConflict: "youtube_video_id" }
        );
      } catch (e) {}
    })();
  }

  return { video: finalVideo, isNew };
}

export function batchUpsertVideos(videosData: Partial<VideoItem>[]): {
  newCount: number;
  updatedCount: number;
} {
  let newCount = 0;
  let updatedCount = 0;

  for (const item of videosData) {
    if (!item.youtubeVideoId) continue;
    const res = upsertVideo({ ...item, youtubeVideoId: item.youtubeVideoId });
    if (res.isNew) {
      newCount++;
    } else {
      updatedCount++;
    }
  }

  return { newCount, updatedCount };
}

export function updateVideoCategory(id: string, category: VideoItem["category"]): boolean {
  const videos = readVideosFromStore();
  const idx = videos.findIndex((v) => v.id === id || v.youtubeVideoId === id);
  if (idx < 0) return false;
  videos[idx].category = category;
  videos[idx].updatedAt = new Date().toISOString();
  writeVideosToStore(videos);

  if (isSupabaseConfigured()) {
    (async () => {
      try {
        await supabaseAdmin
          .from("videos")
          .update({ category, updated_at: videos[idx].updatedAt })
          .eq("id", videos[idx].id);
      } catch (e) {}
    })();
  }

  return true;
}

export function toggleVideoPublish(id: string, isPublished?: boolean): boolean {
  const videos = readVideosFromStore();
  const idx = videos.findIndex((v) => v.id === id || v.youtubeVideoId === id);
  if (idx < 0) return false;
  videos[idx].isPublished = isPublished !== undefined ? isPublished : !videos[idx].isPublished;
  videos[idx].updatedAt = new Date().toISOString();
  writeVideosToStore(videos);

  if (isSupabaseConfigured()) {
    (async () => {
      try {
        await supabaseAdmin
          .from("videos")
          .update({ is_published: videos[idx].isPublished, updated_at: videos[idx].updatedAt })
          .eq("id", videos[idx].id);
      } catch (e) {}
    })();
  }

  return true;
}

export function deleteLocalVideo(id: string): boolean {
  const videos = readVideosFromStore();
  const filtered = videos.filter((v) => v.id !== id && v.youtubeVideoId !== id);
  if (filtered.length === videos.length) return false;
  writeVideosToStore(filtered);

  if (isSupabaseConfigured()) {
    (async () => {
      try {
        await supabaseAdmin
          .from("videos")
          .delete()
          .or(`id.eq.${id},youtube_video_id.eq.${id}`);
      } catch (e) {}
    })();
  }

  return true;
}
