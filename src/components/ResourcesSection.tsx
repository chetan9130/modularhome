"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { ResourceArticle } from "@/data/resources";

export default function ResourcesSection() {
  const [articles, setArticles] = useState<ResourceArticle[]>([]);

  useEffect(() => {
    async function loadDynamicBlogs() {
      try {
        const res = await fetch("/api/blogs");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setArticles(json.data);
          }
        }
      } catch (e) {}
    }
    loadDynamicBlogs();
  }, []);

  const featuredArticles = articles.slice(0, 4);

  if (featuredArticles.length === 0) {
    return null;
  }

  return (
    <section id="resources" className="py-20 bg-white border-b border-[var(--line)] text-[var(--ink)]">
      <div className="wrap">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading
            eyebrow="Educational Guides & Knowledge"
            title="MODULAR HOME RESOURCES & BLOG"
            subtitle="Learn how factory modular construction works, compare costs, understand site prep, and navigate financing."
            align="left"
          />

          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--r)] hover:text-[var(--r-dark)] transition-colors shrink-0"
          >
            <span>View All Guides ({articles.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Article Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-[var(--soft)] border border-[var(--line)] rounded-[18px] overflow-hidden flex flex-col justify-between hover:border-[var(--r)] hover:shadow-lg transition-all group duration-200 hover:-translate-y-0.5"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-white">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[var(--r)] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-white/20">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
                    <Clock className="w-3 h-3 text-[var(--r)]" />
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--r)] transition-colors line-clamp-2 leading-snug font-display">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed font-body">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href={`/resources/${article.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--r)] hover:text-[var(--r-dark)] transition-colors"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
