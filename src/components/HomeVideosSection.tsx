"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import VideoModal from "@/components/VideoModal";
import { VideoItem, VIDEOS_DATA } from "@/data/videos";
import { Play } from "lucide-react";

interface HomeVideosSectionProps {
  videos?: VideoItem[];
}

export default function HomeVideosSection({ videos }: HomeVideosSectionProps) {
  const [videoList, setVideoList] = useState<VideoItem[]>(videos && videos.length > 0 ? videos : VIDEOS_DATA);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadVideos() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
            setVideoList(data.videos);
          }
        }
      } catch (e) {
        // Fallback to initial VIDEOS_DATA
      }
    }
    loadVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayVideos = videoList.length >= 5 ? videoList.slice(0, 5) : (videoList.length > 0 ? videoList : VIDEOS_DATA);
  const mainVideo = displayVideos[0] || VIDEOS_DATA[0];
  const sideVideos = displayVideos.slice(1, 5);

  return (
    <>
      <section className="py-12 sm:py-16 bg-[#f6f7f9]">
        <div className="wrap">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#fcb907] animate-pulse"></span>
                <span>Factory & Architectural Tours</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
                Watch Our Home Tours
              </h2>
              <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
                Take a virtual tour of modular homes, steel framing, crane deliveries, and luxury interiors.
              </p>
            </div>
            <Link
              href="/videos"
              className="text-[#d97706] hover:text-[#b45309] font-extrabold text-sm sm:text-base hover:underline whitespace-nowrap self-start sm:self-auto"
            >
              View All Videos ({videoList.length}) →
            </Link>
          </div>

          {/* Asymmetric 5-Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-4">
            {/* Featured Main Video */}
            <div
              onClick={() => setSelectedVideo(mainVideo)}
              className="card overflow-hidden relative cursor-pointer group lg:row-span-2 min-h-[260px] sm:min-h-[340px] lg:min-h-[460px] bg-black rounded-[20px]"
            >
              <Image
                src={mainVideo.thumbnail}
                alt={mainVideo.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#fcb907] text-[#101114] flex items-center justify-center transition-all duration-300 shadow-2xl group-hover:scale-110 group-hover:bg-[#e5a706]">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-current" />
                </div>
              </div>

              {/* Badges & Duration */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-xs text-white rounded-full">
                  Featured • {mainVideo.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-[10px] font-mono font-bold bg-black/75 backdrop-blur-xs text-white rounded-full">
                  {mainVideo.duration}
                </span>
              </div>

              {/* Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                <h3 className="text-base sm:text-xl font-extrabold text-white leading-snug drop-shadow-md">
                  {mainVideo.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 mt-1.5 hidden sm:block">
                  {mainVideo.description}
                </p>
              </div>
            </div>

            {/* 4 Secondary Video Cards */}
            {sideVideos.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setSelectedVideo(vid)}
                className="card overflow-hidden relative cursor-pointer group h-[220px] bg-black rounded-[18px]"
              >
                <Image
                  src={vid.thumbnail}
                  alt={vid.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#fcb907] text-[#101114] flex items-center justify-center transition-all duration-300 shadow-lg group-hover:scale-110 group-hover:bg-[#e5a706]">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-black/75 text-white rounded-full">
                    {vid.duration}
                  </span>
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-3.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#fcb907] block mb-0.5">
                    {vid.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight drop-shadow-sm line-clamp-2">
                    {vid.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal Player */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </>
  );
}
