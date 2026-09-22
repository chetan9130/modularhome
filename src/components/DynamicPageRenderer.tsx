"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, 
  Home, 
  Calendar, 
  Clock, 
  Share2, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Sparkles,
  Layers,
  PhoneCall,
  Building,
  ImageIcon
} from "lucide-react";
import { CmsPage, PageSection } from "@/lib/publicData";
import TrustBar from "@/components/TrustBar";
import CategoryGrid from "@/components/CategoryGrid";
import HowItWorks from "@/components/HowItWorks";
import FinancingSection from "@/components/FinancingSection";
import HomeVideosSection from "@/components/HomeVideosSection";
import HomeTestimonialsSection from "@/components/HomeTestimonialsSection";
import CTASection from "@/components/CTASection";

interface DynamicPageRendererProps {
  page: CmsPage;
}

interface ParsedContent {
  text: string;
  image?: string;
  gallery?: string[];
  items?: any[];
}

function parseContentData(rawContent?: string): ParsedContent {
  if (!rawContent || !rawContent.trim()) {
    return { text: "" };
  }
  const trimmed = rawContent.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") {
        return { text: parsed };
      }
      if (Array.isArray(parsed)) {
        return { text: "", items: parsed };
      }
      return {
        text: parsed.rawText || parsed.text || parsed.content || parsed.description || parsed.html || "",
        image: parsed.image || parsed.imageUrl || parsed.featuredImage || parsed.src || undefined,
        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : (Array.isArray(parsed.images) ? parsed.images : undefined),
        items: Array.isArray(parsed.items) ? parsed.items : undefined,
      };
    } catch {
      return { text: rawContent };
    }
  }
  return { text: rawContent };
}

export default function DynamicPageRenderer({ page }: DynamicPageRendererProps) {
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const sections = (page.sections || []).filter((s) => s.isVisible !== false);

  // Parse FAQ content helper
  const parseFaqItems = (contentStr?: string): { q: string; a: string }[] => {
    if (!contentStr) return [];
    try {
      const parsed = JSON.parse(contentStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          q: String(item.q || item.question || item.title || ""),
          a: String(item.a || item.answer || item.content || ""),
        }));
      }
      if (parsed.items && Array.isArray(parsed.items)) {
        return parsed.items.map((item: any) => ({
          q: String(item.q || item.question || item.title || ""),
          a: String(item.a || item.answer || item.content || ""),
        }));
      }
      if (parsed.faqs && Array.isArray(parsed.faqs)) {
        return parsed.faqs.map((item: any) => ({
          q: String(item.q || item.question || item.title || ""),
          a: String(item.a || item.answer || item.content || ""),
        }));
      }
    } catch {
      // Fallback: parse markdown/text with Q: and A:
      const lines = contentStr.split("\n").filter((l) => l.trim());
      const items: { q: string; a: string }[] = [];
      let currentQ = "";
      let currentA = "";

      for (const line of lines) {
        if (line.startsWith("Q:") || line.startsWith("###") || line.startsWith("**Q")) {
          if (currentQ) {
            items.push({ q: currentQ, a: currentA.trim() });
            currentA = "";
          }
          currentQ = line.replace(/^(Q:|###|\*\*Q:?\*\*?)\s*/i, "").trim();
        } else if (line.startsWith("A:") || line.startsWith("**A")) {
          currentA += line.replace(/^(A:|\*\*A:?\*\*?)\s*/i, "").trim() + " ";
        } else {
          currentA += line + " ";
        }
      }
      if (currentQ) {
        items.push({ q: currentQ, a: currentA.trim() });
      }
      if (items.length > 0) return items;
    }

    return [
      {
        q: "What makes ModularHome.com steel structures superior?",
        a: "Our structures are built with cold-formed galvanized steel framing engineered for hurricane resistance (up to 150 MPH) and extreme longevity with a 50-year structural frame guarantee."
      },
      {
        q: "How long does the entire modular home process take?",
        a: "Factory assembly typically takes 4-8 weeks, followed by on-site delivery and crane installation on your foundation within 1-3 days."
      },
      {
        q: "Do you offer nationwide delivery across the United States?",
        a: "Yes! We coordinate regional transportation, permitting, and certified crane set services nationwide."
      }
    ];
  };

  // Render individual modular section block
  const renderSectionBlock = (section: PageSection, index: number) => {
    const data = parseContentData(section.content);

    switch (section.type) {
      case "HERO": {
        const bgImg = data.image || page.featuredImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1900&q=85";

        return (
          <section
            key={section.id || index}
            className="relative min-h-[440px] sm:min-h-[500px] text-white flex items-center bg-cover bg-center overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.2) 100%), url('${bgImg}')`,
            }}
          >
            <div className="wrap py-16 sm:py-20 relative z-10 w-full">
              <div className="max-w-2xl text-left space-y-4">
                {section.subtitle && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fcb907]/20 border border-[#fcb907]/40 text-[#fcb907] text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{section.subtitle}</span>
                  </div>
                )}
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  {section.title || page.title}
                </h2>
                {data.text && (
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                    {data.text}
                  </p>
                )}
                <div className="pt-3 flex flex-wrap gap-3">
                  <Link
                    href="/quote"
                    className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] py-3 px-6 text-sm font-black rounded-xl shadow-lg transition-all hover:shadow-xl"
                  >
                    Get a Quote →
                  </Link>
                  <Link
                    href="/buildings"
                    className="bg-white/95 hover:bg-white text-[#101114] py-3 px-6 text-sm font-extrabold rounded-xl transition-all"
                  >
                    Explore Models
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case "TRUST":
        return (
          <div key={section.id || index} className="my-10">
            {section.title && (
              <div className="wrap text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-[#101114]">{section.title}</h3>
                {section.subtitle && <p className="text-xs sm:text-sm text-[#6b7280] mt-1">{section.subtitle}</p>}
              </div>
            )}
            <TrustBar />
          </div>
        );

      case "COLLECTION_GRID":
        return (
          <div key={section.id || index} className="py-12 bg-[#f8f9fa] border-y border-[#e7e9ee]">
            <div className="wrap">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                  {section.subtitle || "Browse By Architectural Style"}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#101114] mt-1">
                  {section.title || "Shop By Home Type"}
                </h2>
              </div>
              <CategoryGrid />
            </div>
          </div>
        );

      case "HOW_IT_WORKS":
        return (
          <div key={section.id || index}>
            <HowItWorks />
          </div>
        );

      case "FINANCING":
        return (
          <div key={section.id || index}>
            <FinancingSection />
          </div>
        );

      case "VIDEO":
        return (
          <div key={section.id || index}>
            <HomeVideosSection />
          </div>
        );

      case "TESTIMONIALS":
        return (
          <div key={section.id || index}>
            <HomeTestimonialsSection />
          </div>
        );

      case "GALLERY": {
        const galleryImgs = data.gallery && data.gallery.length > 0 
          ? data.gallery 
          : (data.image ? [data.image] : []);

        return (
          <section key={section.id || index} className="py-12 sm:py-16 bg-[#f8f9fa] border-y border-[#e7e9ee]">
            <div className="wrap">
              {section.title && (
                <div className="text-center max-w-2xl mx-auto mb-8">
                  {section.subtitle && (
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                      {section.subtitle}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-black text-[#101114] mt-1">
                    {section.title}
                  </h2>
                </div>
              )}

              {galleryImgs.length > 0 ? (
                <div className={`grid gap-4 ${
                  galleryImgs.length === 1 
                    ? "max-w-3xl mx-auto" 
                    : galleryImgs.length === 2 
                    ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto" 
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                }`}>
                  {galleryImgs.map((imgUrl, gIdx) => (
                    <div
                      key={gIdx}
                      className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#e7e9ee] shadow-sm group bg-gray-100"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${section.title || "Gallery"} ${gIdx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">No images in gallery</div>
              )}

              {data.text && (
                <p className="text-center text-sm text-[#6b7280] mt-6 max-w-2xl mx-auto font-medium">
                  {data.text}
                </p>
              )}
            </div>
          </section>
        );
      }

      case "PRODUCT_GRID": {
        return (
          <section key={section.id || index} className="py-12 sm:py-16 bg-white border-y border-[#e7e9ee]">
            <div className="wrap space-y-8">
              {(section.title || section.subtitle) && (
                <div className="text-center max-w-2xl mx-auto">
                  {section.subtitle && (
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                      {section.subtitle}
                    </span>
                  )}
                  {section.title && (
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-[#101114] mt-1">
                      {section.title}
                    </h2>
                  )}
                </div>
              )}

              {data.image && (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#e7e9ee] shadow-md bg-gray-50">
                  <Image
                    src={data.image}
                    alt={section.title || "Featured Visual"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {data.text && (
                <div
                  className="prose prose-lg max-w-3xl mx-auto text-[#374151] leading-relaxed text-center"
                  dangerouslySetInnerHTML={{ __html: data.text }}
                />
              )}

              <CategoryGrid />
            </div>
          </section>
        );
      }

      case "FAQ": {
        const faqList = parseFaqItems(section.content);
        return (
          <section key={section.id || index} className="py-16 sm:py-20 bg-white border-t border-[#e7e9ee]">
            <div className="wrap max-w-4xl">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                  {section.subtitle || "Got Questions?"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#101114] mt-2">
                  {section.title || "Frequently Asked Questions"}
                </h2>
              </div>

              <div className="space-y-4">
                {faqList.map((item: { q: string; a: string }, fIdx: number) => {
                  const isOpen = openFaqIndex === fIdx;
                  return (
                    <div
                      key={fIdx}
                      className="border border-[#e7e9ee] rounded-[16px] overflow-hidden bg-[#f8f9fa] transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                        className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#101114] cursor-pointer hover:bg-[#f1f3f7] transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <HelpCircle className="w-5 h-5 text-[#fcb907] shrink-0" />
                          <span>{item.q}</span>
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-[#6b7280] shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#6b7280] shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[#4b5563] leading-relaxed border-t border-[#e7e9ee]/60 bg-white">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      case "CTA":
        return (
          <div key={section.id || index}>
            <CTASection />
          </div>
        );

      case "RICH_CONTENT":
      default: {
        return (
          <section key={section.id || index} className="py-12 sm:py-16 bg-white">
            <div className="wrap max-w-4xl space-y-6">
              {section.title && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#101114] font-serif">{section.title}</h2>
                  {section.subtitle && <p className="text-sm text-[#6b7280] mt-1 font-medium">{section.subtitle}</p>}
                </div>
              )}

              {/* Render Section Image if provided */}
              {data.image && (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-[#e7e9ee] shadow-md bg-gray-50">
                  <Image
                    src={data.image}
                    alt={section.title || page.title || "Section Media"}
                    fill
                    className="object-cover hover:scale-102 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Render Section Gallery if multiple images */}
              {data.gallery && data.gallery.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {data.gallery.map((imgUrl, gIdx) => (
                    <div key={gIdx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#e7e9ee] shadow-xs">
                      <Image
                        src={imgUrl}
                        alt={`${section.title || "Gallery"} ${gIdx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Render Rich Text Content if present */}
              {data.text && (
                <div
                  className="prose prose-lg max-w-none text-[#374151] leading-relaxed prose-headings:font-black prose-headings:text-[#101114] prose-a:text-[#d97706] prose-a:underline hover:prose-a:text-[#b45309]"
                  dangerouslySetInnerHTML={{ __html: data.text }}
                />
              )}
            </div>
          </section>
        );
      }
    }
  };

  const parsedPageContent = parseContentData(page.content);

  return (
    <div className="min-h-screen bg-white text-[#101114] pt-24 pb-20">
      {/* 1. Header Banner / Hero */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-b from-[#f8f9fa] to-white border-b border-[#e7e9ee]">
        <div className="wrap">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[#6b7280] mb-6 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#101114] flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span className="text-[#101114] font-bold truncate max-w-xs sm:max-w-md">{page.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#b45309] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#fcb907] animate-pulse"></span>
                <span>ModularHome.com Official Page</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#101114] leading-[1.05] font-serif">
                {page.title}
              </h1>

              {page.subtitle && (
                <p className="text-base sm:text-xl text-[#4b5563] leading-relaxed font-medium">
                  {page.subtitle}
                </p>
              )}

              {/* Meta & Share bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#6b7280]">
                {page.updatedAt && (
                  <span className="flex items-center gap-1.5" suppressHydrationWarning>
                    <Calendar className="w-3.5 h-3.5 text-[#fcb907]" />
                    <span suppressHydrationWarning>
                      Updated {(() => {
                        try {
                          const d = new Date(page.updatedAt);
                          if (isNaN(d.getTime())) return "Recently";
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
                        } catch {
                          return "Recently";
                        }
                      })()}
                    </span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#fcb907]" />
                  <span>3 min read</span>
                </span>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d5d9e0] bg-white hover:bg-[#f8f9fa] text-[#101114] font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? "Link Copied!" : "Share Page"}</span>
                </button>
              </div>
            </div>

            {page.featuredImage && (
              <div className="lg:col-span-4">
                <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-[20px] overflow-hidden border border-[#e7e9ee] shadow-lg">
                  <Image
                    src={page.featuredImage}
                    alt={page.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Body Content (Parsed Rich Text/HTML and inline media) */}
      {(parsedPageContent.text || (parsedPageContent.image && parsedPageContent.image !== page.featuredImage)) && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="wrap max-w-4xl space-y-6">
            {parsedPageContent.image && parsedPageContent.image !== page.featuredImage && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[#e7e9ee] shadow-md bg-gray-50">
                <Image
                  src={parsedPageContent.image}
                  alt={page.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {parsedPageContent.text && (
              <div
                className="prose prose-lg max-w-none text-[#374151] leading-relaxed prose-headings:font-black prose-headings:text-[#101114] prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:border-b prose-h2:border-[#e7e9ee] prose-h2:pb-3 prose-h2:mt-10 prose-h3:text-xl prose-h3:mt-8 prose-p:text-[#4b5563] prose-p:leading-relaxed prose-li:text-[#4b5563] prose-strong:text-[#101114] prose-a:text-[#d97706] prose-a:underline hover:prose-a:text-[#b45309]"
                dangerouslySetInnerHTML={{ __html: parsedPageContent.text }}
              />
            )}
          </div>
        </section>
      )}

      {/* 3. Modular Sections (configured in admin/sections) */}
      {sections.length > 0 && (
        <div className="space-y-0">
          {sections.map((section, idx) => renderSectionBlock(section, idx))}
        </div>
      )}

      {/* 4. Default CTA Footer if no custom sections present */}
      {sections.length === 0 && !parsedPageContent.text && (
        <section className="py-20 text-center wrap max-w-2xl">
          <div className="p-8 bg-[#f8f9fa] rounded-[22px] border border-[#e7e9ee] space-y-4">
            <h2 className="text-xl font-black text-[#101114]">Page Content In Development</h2>
            <p className="text-xs sm:text-sm text-[#6b7280]">
              This page has been published. Add narrative content or configure modular blocks from your Admin Section Manager.
            </p>
            <div className="pt-2">
              <Link
                href="/buildings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase rounded-xl"
              >
                <span>Browse Homes & Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
