"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Search, BookOpen, Sparkles } from "lucide-react";

interface ResourcesClientProps {
  initialArticles: any[];
}

export default function ResourcesClient({ initialArticles }: ResourcesClientProps) {
  const [articles] = useState<any[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredArticles = articles.filter((art) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (art.title || "").toLowerCase().includes(q) ||
      (art.excerpt || "").toLowerCase().includes(q) ||
      (art.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white pt-24 pb-28 text-[#101114]">
      <div className="wrap">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-[#d97706] text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-[#fcb907]" />
            <span>Modular Housing Knowledge Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#101114] font-display leading-[0.98]">
            Modular Home <br />
            <span className="text-[#d97706]">Resources & Guides</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#555d69] leading-relaxed font-body">
            Everything you need to know about factory modular housing, costs, timelines, financing, land preparation, and floor plan customization.
          </p>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative max-w-md mx-auto">
              <Search className="w-4 h-4 text-[#6b7280] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, pricing, permits, foundation..."
                className="w-full bg-[#f8f9fa] border border-[#d5d9e0] pl-11 pr-4 py-3 text-xs text-[#101114] rounded-full focus:outline-none focus:border-[#fcb907] focus:bg-white shadow-xs transition-all"
              />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#6b7280] space-y-3 bg-[#f8f9fa] rounded-[20px] border border-[#e7e9ee]">
            <BookOpen className="w-8 h-8 mx-auto text-[#6b7280]/40" />
            <div className="font-bold text-[#101114]">No articles matched your search.</div>
            <p className="text-xs text-[#6b7280]">
              Try searching with different terms.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#d97706] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredArticles.map((article: any) => (
              <Link
                key={article.id || article.slug}
                href={`/resources/${article.slug}`}
                className="card overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all group bg-white rounded-[20px] border border-[#e7e9ee] shadow-xs hover:border-[#d97706] hover:shadow-lg"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3.5 left-3.5 bg-[#fcb907] text-[#101114] text-[10px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-xs">
                      {article.category}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                      <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                      <span>{article.readTime}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#101114] group-hover:text-[#d97706] transition-colors leading-snug font-display line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#555d69] leading-relaxed line-clamp-2 font-body">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d97706] group-hover:text-[#b45309] transition-colors">
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom Consultation CTA */}
        <div className="mt-16 p-8 sm:p-12 bg-[#f8f9fa] border border-[#e7e9ee] rounded-[24px] text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#101114] font-display">
            Need Expert Help Planning Your Modular Home?
          </h3>
          <p className="text-xs sm:text-sm text-[#555d69] max-w-xl mx-auto leading-relaxed">
            Our architectural specialists and engineering team are ready to assist with lot feasibility, zoning guidelines, and custom blueprint selection.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/contact"
              className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] px-6 py-3 text-xs font-black uppercase tracking-wider rounded-[11px] transition-all shadow-sm"
            >
              Request Free Consultation
            </Link>
            <Link
              href="/floor-plans"
              className="bg-white hover:bg-[#f4f5f7] border border-[#d5d9e0] text-[#101114] px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-[11px] transition-all"
            >
              Browse 50+ Floor Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
