import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { RESOURCE_ARTICLES } from "@/data/resources";
import { getPublicBlogs } from "@/lib/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Modular Home Educational Resources & Guides | ModularHome.com",
  description: "Comprehensive educational guides on modular home construction, pricing, financing, land preparation, delivery, and custom floor plans.",
};

export default async function ResourcesPage() {
  const articles = await getPublicBlogs();

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-[#101114]">
      <div className="wrap">
        {/* Header */}
        <div className="py-8 border-b border-[#e7e9ee] max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#fcb907]"></span>
            <span>Educational Guide Hub</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[-1.5px] text-[#101114]">
            Modular Home Resources
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#6b7280]">
            Everything you need to know about factory modular housing, costs, timelines, financing, land preparation, and floor plan customization.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-10">
          {articles.map((article: any) => (
            <div
              key={article.id}
              className="card overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all group bg-white"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#fcb907] text-[#101114] text-[10px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-sm">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                    <Clock className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>{article.readTime}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>

                  <h2 className="text-base sm:text-lg font-black text-[#101114] group-hover:text-[#d97706] transition-colors leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#e7e9ee]">
                    {Array.isArray(article.content) ? (
                      article.content.map((paragraph: string, idx: number) => (
                        <p key={idx} className="text-xs text-[#101114] leading-relaxed font-medium">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p className="text-xs text-[#101114] leading-relaxed font-medium">
                        {article.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0">
                <Link
                  href="/quote"
                  className="btn-primary w-full py-2.5 text-xs font-extrabold rounded-[9px] flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Request Pricing For This Model</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#101114]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
