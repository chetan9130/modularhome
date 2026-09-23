export type VideoCategory = 
  | "Building Tours" 
  | "Construction" 
  | "Delivery" 
  | "Interior" 
  | "Customer Stories" 
  | "Barndominiums" 
  | "General";

export interface VideoItem {
  id: string; // Internal unique ID or youtubeVideoId
  youtubeVideoId: string;
  title: string;
  category: VideoCategory | string;
  duration: string;
  description: string;
  thumbnail: string;
  modelSlug?: string;
  views: string;
  date: string;
  publishedAt?: string;
  youtubeUrl?: string;
  embedUrl?: string;
  videoUrl?: string;
  channelId?: string;
  channelTitle?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncStats {
  lastSyncAt: string | null;
  totalFound: number;
  newVideosAdded: number;
  updatedVideos: number;
  status: "success" | "error" | "never";
  errorMessage?: string;
}

export interface YouTubeSyncResult {
  success: boolean;
  message: string;
  checkedCount: number;
  newVideosCount: number;
  updatedVideosCount: number;
  stats: SyncStats;
  errors?: string[];
}
