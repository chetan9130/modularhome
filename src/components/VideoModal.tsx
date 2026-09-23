"use client";

import { useEffect } from "react";
import { X, ExternalLink, Film } from "lucide-react";
import Link from "next/link";
import { VideoItem } from "@/types/video";

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const str = urlOrId.trim();

  // If it's already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Match youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., youtube.com/shorts/...
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
    /youtube-nocookie\.com\/embed\/([\w-]{11})/,
  ];

  for (const regex of patterns) {
    const match = str.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function resolveVideoEmbedUrl(video: Partial<VideoItem> | null): string {
  if (!video) return "";

  // Check youtubeVideoId first
  if (video.youtubeVideoId) {
    return `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }

  const rawUrl = video.embedUrl || video.videoUrl || video.youtubeUrl || "";
  if (!rawUrl) return "";

  const ytId = extractYouTubeId(rawUrl);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  }

  // Fallback to rawUrl
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    const fallbackId = extractYouTubeId(rawUrl);
    if (fallbackId) {
      return `https://www.youtube-nocookie.com/embed/${fallbackId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    }
  }

  return rawUrl;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (video) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  const embedSrc = resolveVideoEmbedUrl(video);
  const isDirectVideo = embedSrc.endsWith(".mp4") || embedSrc.endsWith(".webm") || embedSrc.endsWith(".mov");
  const watchUrl = video.youtubeUrl || (video.youtubeVideoId ? `https://www.youtube.com/watch?v=${video.youtubeVideoId}` : "");
  const detailSlug = video.youtubeVideoId || video.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-4xl bg-[#0f1218] border border-white/15 rounded-[22px] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#161a22] text-white border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-[#fcb907] text-[#101114] rounded-full shrink-0">
              {video.category || "Tour"}
            </span>
            <h3 className="text-xs sm:text-sm font-bold truncate text-white">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame (16:9) */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {embedSrc ? (
            isDirectVideo ? (
              <video
                src={embedSrc}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                key={embedSrc}
                src={embedSrc}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )
          ) : (
            <div className="p-8 text-center text-white/60 text-xs">
              <Film className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <span>Video source is currently unavailable.</span>
            </div>
          )}
        </div>

        {/* Video Footer Metadata & Actions */}
        <div className="p-4 sm:p-5 bg-[#161a22] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-white/75 line-clamp-2 leading-relaxed">
              {video.description || "Official architectural tour and modular home build guide by ModularHome.com."}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-white/60 font-mono">
              {video.duration && <span>Duration: {video.duration}</span>}
              {video.views && (
                <>
                  <span>•</span>
                  <span>{video.views}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {detailSlug && (
              <Link
                href={`/videos/${detailSlug}`}
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>Full Page</span>
              </Link>
            )}
            {watchUrl && (
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
