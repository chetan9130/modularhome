import { VideoItem } from "@/types/video";

/**
 * Robust YouTube video ID parser supporting standard, short, embed, and nocookie URLs
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // If already a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /youtube-nocookie\.com\/embed\/([\w-]{11})/,
    /[?&]v=([\w-]{11})/,
    /\/vi\/([\w-]{11})/,
  ];

  for (const regex of patterns) {
    const match = clean.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Resolves a secure, privacy-enhanced (youtube-nocookie.com) embed URL
 */
export function resolveVideoEmbedUrl(
  video: Partial<VideoItem> | { embedUrl?: string; videoUrl?: string; youtubeUrl?: string; youtubeVideoId?: string } | null,
  options?: { autoplay?: boolean }
): string {
  if (!video) return "";

  const autoplayParam = options?.autoplay ? "autoplay=1&" : "";

  // Check youtubeVideoId first
  if (video.youtubeVideoId) {
    return `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?${autoplayParam}rel=0&modestbranding=1&playsinline=1`;
  }

  const rawUrl = video.embedUrl || video.videoUrl || video.youtubeUrl || "";
  if (!rawUrl) return "";

  const ytId = extractYouTubeId(rawUrl);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?${autoplayParam}rel=0&modestbranding=1&playsinline=1`;
  }

  return rawUrl;
}
