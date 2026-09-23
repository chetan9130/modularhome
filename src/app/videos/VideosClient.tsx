"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { VIDEOS_DATA } from "@/data/videos";
import { VideoItem } from "@/types/video";
import VideoCard from "@/components/VideoCard";
import VideoModal from "@/components/VideoModal";

export default function VideosClient() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSyncedVideos() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        if (!isMounted) return;
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        } else {
          setVideos(VIDEOS_DATA as unknown as VideoItem[]);
        }
      } catch (err) {
        console.error("Failed to fetch synced videos, using fallback:", err);
        if (isMounted) {
          setVideos(VIDEOS_DATA as unknown as VideoItem[]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadSyncedVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVideos = videos.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      (v.category && v.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-white pt-28 pb-28 text-[var(--ink)]">
      <div className="wrap">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[var(--r)] text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[var(--r)] animate-pulse"></span>
            <span>Official YouTube Channel Sync</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-[var(--ink)] font-display leading-[0.95]">
            See Our Buildings <br />
            <span className="text-[var(--r)]">Come To Life.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[var(--muted)] leading-relaxed font-body">
            Watch complete architectural walkthroughs, steel frame erection time-lapses, luxury interior detailing, and genuine homeowner build stories automatically synced from our YouTube channel.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by keyword..."
                className="w-full bg-[var(--soft)] border border-[var(--line)] pl-11 pr-4 py-3 text-xs text-[var(--ink)] rounded-full focus:outline-none focus:border-[var(--r)] shadow-xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-xs text-[var(--muted)]">
            Loading video gallery...
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="p-16 text-center text-xs text-[var(--muted)] space-y-2 bg-[var(--soft)] rounded-[18px] border border-[var(--line)]">
            <div>No videos matched your search query.</div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[var(--r)] font-bold hover:underline cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video as any}
                onPlay={(v) => setActiveVideo(v as any)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video Modal Player */}
      <VideoModal video={activeVideo as any} onClose={() => setActiveVideo(null)} />
    </div>
  );
}
