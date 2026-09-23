import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

export default function HomeArticlesSection() {
  const articles = [
    {
      title: "What Is a Modular Home? A Complete Guide to Factory-Built Housing",
      category: "Modular Basics",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      href: "/resources/what-is-a-modular-home",
    },
    {
      title: "Modular vs. Traditional Site-Built Construction: Which Is Right for You?",
      category: "Comparison",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      href: "/resources/modular-vs-traditional-construction",
    },
    {
      title: "How Much Does a Modular Home Cost? Breakdown of Pricing & Expenses",
      category: "Pricing & Budget",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
      href: "/resources/how-much-does-a-modular-home-cost",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#f6f7f9]">
      <div className="wrap">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#fcb907]"></span>
              <span>Educational Knowledge Base</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
              Latest News & Resources
            </h2>
            <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
              Expert guides, pricing breakdowns, and architectural tips for your modular home project.
            </p>
          </div>
          <Link
            href="/resources"
            className="text-[#d97706] hover:text-[#b45309] font-extrabold text-sm sm:text-base hover:underline whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>View All Articles (10)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Article Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {articles.map((art, idx) => (
            <Link
              key={idx}
              href={art.href}
              className="card overflow-hidden group hover:-translate-y-1 transition-all flex flex-col justify-between bg-white rounded-[18px] border border-[#e7e9ee] hover:border-[#d97706] hover:shadow-md"
            >
              <div>
                <div className="relative h-[170px] sm:h-[190px] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-[#fcb907] text-[#101114] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    {art.category}
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                    <Clock className="w-3 h-3 text-[#d97706]" />
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#101114] group-hover:text-[#d97706] transition-colors leading-snug line-clamp-2 font-display">
                    {art.title}
                  </h3>
                </div>
              </div>
              <div className="p-5 pt-0">
                <span className="text-xs font-bold text-[#d97706] inline-flex items-center gap-1 group-hover:underline">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
