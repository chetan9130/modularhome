import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, CheckCircle2, Share2, Tag, User } from "lucide-react";
import { getPublicBlogBySlug, getPublicBlogs } from "@/lib/publicData";
import { resolveVideoEmbedUrl } from "@/components/VideoModal";

export const dynamic = "force-dynamic";

interface ResourceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicBlogBySlug(slug);

  if (!article) {
    return {
      title: "Resource Not Found | ModularHome.com",
    };
  }

  const title = article.seoTitle || `${article.title} | ModularHome.com Guide`;
  const description = article.metaDescription || article.excerpt || `Read complete guide on ${article.title} by ModularHome.com.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: article.image }],
      type: "article",
    },
    alternates: {
      canonical: `https://modularhome.com/resources/${article.slug}`,
    },
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { slug } = await params;
  const article = await getPublicBlogBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getPublicBlogs();
  const relatedArticles = allArticles
    .filter((a: any) => a.slug !== article.slug && a.id !== article.id)
    .slice(0, 3);

  // Video embed if article has embedded video
  const videoEmbed = article.embeddedVideoUrl
    ? resolveVideoEmbedUrl({ embedUrl: article.embeddedVideoUrl, videoUrl: article.embeddedVideoUrl })
    : null;

  // Structured Schema.org Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.metaDescription,
    "image": [article.image],
    "datePublished": article.date,
    "author": {
      "@type": "Person",
      "name": article.author || "ModularHome Engineering Team",
    },
    "publisher": {
      "@type": "Organization",
      "name": "ModularHome.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://modularhome.com/finallogo.avif",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://modularhome.com/resources/${article.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-28 text-[#101114]">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="wrap max-w-5xl">
        {/* Breadcrumb Navigation */}
        <div className="py-4 text-xs text-[#6b7280] flex items-center gap-2 border-b border-[#e7e9ee] mb-8">
          <Link href="/" className="hover:text-[#101114] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-[#101114] transition-colors">
            Resources & Guides
          </Link>
          <span>/</span>
          <span className="text-[#d97706] font-bold truncate max-w-xs sm:max-w-md">
            {article.title}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-4 max-w-3xl mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-[#fcb907] text-[#101114] rounded-full shadow-xs">
              {article.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              <span>{article.readTime}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
              <Calendar className="w-3.5 h-3.5 text-[#d97706]" />
              <span>{article.date}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-[-1.5px] text-[#101114] leading-[1.1] font-display">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-[#555d69] leading-relaxed font-body">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-[#101114] text-[#fcb907] font-black text-xs flex items-center justify-center">
              {article.author ? article.author[0] : "M"}
            </div>
            <div>
              <div className="text-xs font-bold text-[#101114]">
                {article.author || "ModularHome Engineering Team"}
              </div>
              <div className="text-[11px] text-[#6b7280]">
                Factory Modular & Construction Specialist
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[21/10] w-full rounded-[24px] overflow-hidden bg-gray-100 mb-10 shadow-lg border border-[#e7e9ee]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Article Grid: Content (8 cols) & Sidebar CTA (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <main className="lg:col-span-8 space-y-8">
            {/* Key Takeaways Box */}
            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <div className="p-6 bg-[#f8f9fa] border border-[#e7e9ee] rounded-[20px] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#101114]">
                  <CheckCircle2 className="w-4 h-4 text-[#fcb907]" />
                  <span>Key Architectural Takeaways</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-[#404652] leading-relaxed">
                  {article.keyTakeaways.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] mt-2 shrink-0"></span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Embedded Video If Present */}
            {videoEmbed && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#101114]">
                  Accompanying Video Guide
                </h3>
                <div className="relative aspect-video w-full rounded-[18px] overflow-hidden bg-black shadow-md border border-[#e7e9ee]">
                  <iframe
                    src={videoEmbed}
                    title={article.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}

            {/* Body Paragraphs */}
            <div className="space-y-5 text-sm sm:text-base text-[#2c323f] leading-[1.75] font-body">
              {Array.isArray(article.content) ? (
                article.content.map((para: string, idx: number) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))
              ) : (
                <div className="whitespace-pre-line leading-relaxed">
                  {article.content}
                </div>
              )}
            </div>

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-[#e7e9ee] flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#6b7280] flex items-center gap-1 mr-2">
                  <Tag className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Tags:</span>
                </span>
                {article.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#f4f5f7] hover:bg-[#e7e9ee] text-[#101114] text-xs font-semibold rounded-full transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation back to resources */}
            <div className="pt-4">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#d97706] hover:text-[#b45309] transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Browse All Educational Guides</span>
              </Link>
            </div>
          </main>

          {/* Sidebar CTA (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Instant Quote Box */}
            <div className="bg-[#101114] text-white p-7 rounded-[22px] shadow-xl space-y-4 border border-white/10">
              <div className="inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#fcb907] text-[#101114] rounded-full">
                Custom Floor Plans
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight font-display text-white">
                Planning Your Build?
              </h3>
              <p className="text-xs text-white/75 leading-relaxed font-body">
                Explore our catalog of 50+ pre-engineered modular models, barndominiums, and cabin floor plans with transparent pricing.
              </p>
              <div className="space-y-2 pt-2">
                <Link
                  href="/buildings"
                  className="w-full py-3 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider rounded-[12px] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Browse Home Models</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/quote"
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-[12px] transition-all flex items-center justify-center gap-2"
                >
                  <span>Instant Price Calculator</span>
                </Link>
              </div>
            </div>

            {/* Free Download / Consultation Card */}
            <div className="p-6 bg-[#f8f9fa] border border-[#e7e9ee] rounded-[20px] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#101114]">
                Speak With An Engineer
              </h4>
              <p className="text-xs text-[#6b7280] leading-relaxed">
                Have specific zoning, foundation, or local permit questions about your building lot?
              </p>
              <Link
                href="/contact"
                className="text-xs font-extrabold text-[#d97706] hover:underline inline-flex items-center gap-1"
              >
                <span>Request Free Consultation →</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* Related Articles Carousel/Grid */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e7e9ee]">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#101114] font-display m-0">
                  Related Educational Guides
                </h3>
                <p className="text-xs sm:text-sm text-[#6b7280] mt-1 m-0">
                  Continue learning about modular construction and site preparation.
                </p>
              </div>
              <Link
                href="/resources"
                className="text-xs font-bold uppercase tracking-wider text-[#d97706] hover:underline"
              >
                View Hub →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel: any) => (
                <Link
                  key={rel.id}
                  href={`/resources/${rel.slug}`}
                  className="card overflow-hidden group hover:-translate-y-1 transition-all flex flex-col justify-between bg-white rounded-[18px] border border-[#e7e9ee]"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={rel.image}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#fcb907] text-[#101114] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                        {rel.category}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
                        <Clock className="w-3 h-3 text-[#d97706]" />
                        <span>{rel.readTime}</span>
                      </div>

                      <h4 className="text-sm font-black text-[#101114] group-hover:text-[#d97706] transition-colors leading-snug line-clamp-2 font-display">
                        {rel.title}
                      </h4>

                      <p className="text-xs text-[#6b7280] line-clamp-2 leading-relaxed font-body">
                        {rel.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <span className="text-xs font-bold text-[#d97706] inline-flex items-center gap-1 group-hover:underline">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
