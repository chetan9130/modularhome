import fs from "fs";
import path from "path";
import { VideoItem, SyncStats } from "@/types/video";
import { VIDEOS_DATA } from "@/data/videos";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "synced_videos.json");
const STATS_FILE_PATH = path.join(DATA_DIR, "sync_stats.json");

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function normalizeVideo(v: any): VideoItem {
  const ytId = v.youtubeVideoId || (v.id && !v.id.startsWith("vid-") ? v.id : (v.id ? v.id.replace("vid-", "") : "FFSiyvRYhlw"));
  const embed = v.embedUrl || `https://www.youtube-nocookie.com/embed/${ytId}`;
  return {
    id: v.id || `vid-${ytId}`,
    youtubeVideoId: ytId,
    title: v.title || "Modular Home & Cabin Tour",
    category: v.category || "Building Tours",
    duration: v.duration || "4:00",
    description: v.description || "",
    thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    modelSlug: v.modelSlug,
    views: v.views || "100K views",
    date: v.date || "Recent",
    publishedAt: v.publishedAt || new Date().toISOString(),
    youtubeUrl: v.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`,
    embedUrl: embed,
    videoUrl: v.videoUrl || embed,
    channelId: v.channelId,
    channelTitle: v.channelTitle,
    isPublished: v.isPublished !== false,
    createdAt: v.createdAt || new Date().toISOString(),
    updatedAt: v.updatedAt || new Date().toISOString(),
  };
}

export function readVideosFromStore(): VideoItem[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(FILE_PATH)) {
      const normalizedSeeds = VIDEOS_DATA.map(normalizeVideo);
      fs.writeFileSync(FILE_PATH, JSON.stringify(normalizedSeeds, null, 2), "utf-8");
      return normalizedSeeds;
    }
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const normalizedSeeds = VIDEOS_DATA.map(normalizeVideo);
      fs.writeFileSync(FILE_PATH, JSON.stringify(normalizedSeeds, null, 2), "utf-8");
      return normalizedSeeds;
    }
    return parsed.map(normalizeVideo);
  } catch (error) {
    console.error("Error reading synced_videos.json:", error);
    return VIDEOS_DATA.map(normalizeVideo);
  }
}

export function writeVideosToStore(videos: VideoItem[]): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(FILE_PATH, JSON.stringify(videos, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to synced_videos.json:", error);
  }
}

export function readSyncStats(): SyncStats {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(STATS_FILE_PATH)) {
      const defaultStats: SyncStats = {
        lastSyncAt: null,
        totalFound: VIDEOS_DATA.length,
        newVideosAdded: 0,
        updatedVideos: 0,
        status: "never",
      };
      return defaultStats;
    }
    const data = fs.readFileSync(STATS_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {
      lastSyncAt: null,
      totalFound: 0,
      newVideosAdded: 0,
      updatedVideos: 0,
      status: "never",
    };
  }
}

export function saveSyncStats(stats: SyncStats): void {
  try {
    ensureDataDirectory();
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving sync stats:", error);
  }
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

  if (existingIdx >= 0) {
    const existing = videos[existingIdx];
    const updated: VideoItem = normalizeVideo({
      ...existing,
      ...videoData,
      updatedAt: now,
    });
    videos[existingIdx] = updated;
    writeVideosToStore(videos);
    return { video: updated, isNew: false };
  } else {
    const newVideo: VideoItem = normalizeVideo({
      id: `vid-${videoData.youtubeVideoId}`,
      youtubeVideoId: videoData.youtubeVideoId,
      title: videoData.title || "Untitled Cabin Video",
      category: videoData.category || "Building Tours",
      duration: videoData.duration || "4:00",
      description: videoData.description || "",
      thumbnail: videoData.thumbnail || `https://i.ytimg.com/vi/${videoData.youtubeVideoId}/hqdefault.jpg`,
      views: videoData.views || "New Upload",
      date: videoData.date || "Just now",
      publishedAt: videoData.publishedAt || now,
      youtubeUrl: videoData.youtubeUrl || `https://www.youtube.com/watch?v=${videoData.youtubeVideoId}`,
      embedUrl: videoData.embedUrl || `https://www.youtube-nocookie.com/embed/${videoData.youtubeVideoId}`,
      videoUrl: videoData.videoUrl || `https://www.youtube-nocookie.com/embed/${videoData.youtubeVideoId}`,
      channelId: videoData.channelId,
      channelTitle: videoData.channelTitle,
      isPublished: videoData.isPublished !== undefined ? videoData.isPublished : true,
      createdAt: now,
      updatedAt: now,
    });
    videos.unshift(newVideo);
    writeVideosToStore(videos);
    return { video: newVideo, isNew: true };
  }
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
  return true;
}

export function toggleVideoPublish(id: string, isPublished?: boolean): boolean {
  const videos = readVideosFromStore();
  const idx = videos.findIndex((v) => v.id === id || v.youtubeVideoId === id);
  if (idx < 0) return false;
  videos[idx].isPublished = isPublished !== undefined ? isPublished : !videos[idx].isPublished;
  videos[idx].updatedAt = new Date().toISOString();
  writeVideosToStore(videos);
  return true;
}

export function deleteLocalVideo(id: string): boolean {
  const videos = readVideosFromStore();
  const filtered = videos.filter((v) => v.id !== id && v.youtubeVideoId !== id);
  if (filtered.length === videos.length) return false;
  writeVideosToStore(filtered);
  return true;
}
