import syncedVideosData from "./synced_videos.json";
import { VideoItem as BaseVideoItem } from "@/types/video";

export type VideoItem = BaseVideoItem;

export const VIDEO_CATEGORIES = [
  "All",
  "Building Tours",
  "Construction",
  "Delivery",
  "Interior",
  "Customer Stories",
  "Barndominiums",
] as const;

export const VIDEOS_DATA: VideoItem[] = (syncedVideosData as any[]).map((v) => ({
  id: v.id || `vid-${v.youtubeVideoId}`,
  youtubeVideoId: v.youtubeVideoId,
  title: v.title || "Modular Home & Cabin Tour",
  category: v.category || "Building Tours",
  duration: v.duration || "4:00",
  description: v.description || "",
  thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`,
  modelSlug: v.modelSlug,
  views: v.views || "10K views",
  date: v.date || "Recent",
  publishedAt: v.publishedAt || new Date().toISOString(),
  youtubeUrl: v.youtubeUrl || `https://www.youtube.com/watch?v=${v.youtubeVideoId}`,
  embedUrl: v.embedUrl || `https://www.youtube-nocookie.com/embed/${v.youtubeVideoId}`,
  videoUrl: v.videoUrl || `https://www.youtube-nocookie.com/embed/${v.youtubeVideoId}`,
  channelId: v.channelId || "UCe8Cs76lnVixGuymeoyExKg",
  channelTitle: v.channelTitle || "Amish Built Cabins, Modular Cabins, Modular Homes",
  isPublished: v.isPublished !== false,
  createdAt: v.createdAt || new Date().toISOString(),
  updatedAt: v.updatedAt || new Date().toISOString(),
}));
