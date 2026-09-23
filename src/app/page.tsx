import Link from "next/link";
import TrustBar from "@/components/TrustBar";
import HomeSearchBox from "@/components/HomeSearchBox";
import CategoryGrid from "@/components/CategoryGrid";
import HomeProductCard, { ProductItem } from "@/components/HomeProductCard";
import BudgetSection from "@/components/BudgetSection";
import NearMeSection from "@/components/NearMeSection";
import CustomizeAndPlansSection from "@/components/CustomizeAndPlansSection";
import QuoteAndStepsSection from "@/components/QuoteAndStepsSection";
import FinancingSection from "@/components/FinancingSection";
import HomeVideosSection from "@/components/HomeVideosSection";
import HomeTestimonialsSection from "@/components/HomeTestimonialsSection";
import HomeArticlesSection from "@/components/HomeArticlesSection";
import CTASection from "@/components/CTASection";
import { getPublicProducts, getPublicReviews, getPublicSettings } from "@/lib/publicData";

// Curated default models fallback matching architectural steel design
const DEFAULT_AVAILABLE: ProductItem[] = [
  {
    id: "aspen",
    slug: "the-aspen",
    name: "The Aspen",
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=700&q=80",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1586,
    price: 189000,
  },
  {
    id: "meadow",
    slug: "the-meadow",
    name: "The Meadow",
    badge: "Quick Ship",
    image: "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=700&q=80",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 2012,
    price: 224900,
  },
  {
    id: "elmwood",
    slug: "the-elmwood",
    name: "The Elmwood",
    badge: "New Model",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=700&q=80",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1404,
    price: 179000,
  },
  {
    id: "clearwater",
    slug: "the-clearwater",
    name: "The Clearwater",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=80",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1726,
    price: 179900,
  },
  {
    id: "ridgeview",
    slug: "the-ridgeview",
    name: "The Ridgeview",
    badge: "Modern",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=700&q=80",
    bedrooms: 4,
    bathrooms: 2,
    sqft: 2256,
    price: 289000,
  },
];

const DEFAULT_TRENDING: ProductItem[] = [
  {
    id: "lakeside",
    slug: "the-lakeside",
    name: "The Lakeside",
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=700&q=78",
    bedrooms: 3,
    bathrooms: 2,
    price: 165000,
  },
  {
    id: "brookhaven",
    slug: "the-brookhaven",
    name: "The Brookhaven",
    image: "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=700&q=78",
    bedrooms: 3,
    bathrooms: 2,
    price: 205000,
  },
  {
    id: "pinecrest",
    slug: "the-pinecrest",
    name: "The Pinecrest",
    image: "https://images.unsplash.com/photo-1600047509782-20d39509f26d?auto=format&fit=crop&w=700&q=78",
    bedrooms: 3,
    bathrooms: 2,
    price: 275000,
  },
  {
    id: "summit",
    slug: "the-summit",
    name: "The Summit",
    image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=700&q=78",
    bedrooms: 3,
    bathrooms: 2,
    price: 199000,
  },
  {
    id: "willow",
    slug: "the-willow",
    name: "The Willow",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=700&q=78",
    bedrooms: 3,
    bathrooms: 2,
    price: 142000,
  },
];

export default async function HomePage() {
  const [products, reviews, settings] = await Promise.all([
    getPublicProducts(),
    getPublicReviews(),
    getPublicSettings(),
  ]);

  // Map dynamic products to ProductItem format
  let availableHomes: ProductItem[] = [];
  let trendingHomes: ProductItem[] = [];

  if (products && products.length > 0) {
    availableHomes = products.slice(0, 5).map((p, idx) => ({
      id: p.id || String(idx),
      slug: p.slug,
      name: p.name,
      badge: idx === 0 ? "Best Seller" : idx === 1 ? "Quick Ship" : idx === 2 ? "Popular" : undefined,
      image: p.primaryImage || p.image || DEFAULT_AVAILABLE[0].image,
      bedrooms: p.bedrooms || 3,
      bathrooms: p.bathrooms || 2,
      sqft: p.sqft || 1600,
      price: p.startingPrice || 189000,
    }));

    if (products.length > 5) {
      trendingHomes = products.slice(5, 10).map((p, idx) => ({
        id: p.id || String(idx),
        slug: p.slug,
        name: p.name,
        badge: idx === 0 ? "Trending" : undefined,
        image: p.primaryImage || p.image || DEFAULT_TRENDING[0].image,
        bedrooms: p.bedrooms || 3,
        bathrooms: p.bathrooms || 2,
        sqft: p.sqft || 1800,
        price: p.startingPrice || 195000,
      }));
    } else {
      trendingHomes = DEFAULT_TRENDING;
    }
  } else {
    availableHomes = DEFAULT_AVAILABLE;
    trendingHomes = DEFAULT_TRENDING;
  }

  const heroHeading = settings?.defaultSeoTitle || "Modular Homes For A Better Tomorrow";
  const heroTagline = settings?.announcementText || "MODERN. AFFORDABLE. BUILT FOR LIFE.";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section 
        className="min-h-[560px] sm:min-h-[590px] lg:min-h-[620px] text-white flex items-center relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.35) 48%, rgba(0,0,0,0.12) 100%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1900&q=85')`
        }}
      >
        <div className="wrap w-full py-16 sm:py-20 relative z-10">
          <div className="max-w-2xl text-left">
            <div className="text-xs sm:text-[13px] font-black tracking-[1.4px] text-white/95 uppercase mb-3">
              {heroTagline}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-[-2.5px] sm:tracking-[-3px] text-white leading-[0.98] sm:leading-[0.96] mb-4 sm:mb-5">
              Modular Homes
              <br />
              For A Better <span className="text-[#fcb907]">Tomorrow</span>
            </h1>

            <p className="text-base sm:text-[19px] text-white/90 leading-[1.55] max-w-xl mb-7 sm:mb-8 font-normal">
              Explore precision steel modular homes, downloadable construction floor plans, and turnkey prefab models designed around your lifestyle, location and budget.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="#quote"
                className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] py-3.5 px-6 text-sm sm:text-base font-black rounded-[11px] shadow-lg text-center transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Get a Quote →
              </Link>
              <Link
                href="#homes"
                className="btn-outline py-3.5 px-6 text-sm sm:text-base font-extrabold rounded-[11px] bg-white/95 text-[#101114] hover:bg-white text-center hover:border-[#fcb907]"
              >
                Browse Homes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST / BENEFITS (Floating Overlap Bar) */}
      <TrustBar />

      {/* 3. FIND YOUR PERFECT HOME (Search & Filter Section) */}
      <HomeSearchBox />

      {/* 4. SHOP BY HOME TYPE (10 Category 5-Column Grid) */}
      <CategoryGrid />

      {/* 5. HOMES AVAILABLE RIGHT NOW (5-Column Product Grid) */}
      <section id="homes" className="py-12 sm:py-16 bg-white">
        <div className="wrap">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
                Homes Available Right Now
              </h2>
              <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
                Move-in ready and quick-ship modular homes.
              </p>
            </div>
            <Link
              href="/buildings"
              className="text-[#d97706] hover:text-[#b45309] font-extrabold text-sm sm:text-base hover:underline whitespace-nowrap self-start sm:self-auto"
            >
              View All Homes →
            </Link>
          </div>

          {/* 5-Column Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-4.5">
            {availableHomes.map((home) => (
              <HomeProductCard key={home.id} product={home} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. FIND A HOME IN YOUR BUDGET (4 Budget Cards) */}
      <BudgetSection />

      {/* 7. FIND HOMES NEAR YOU (ZIP Search + USA Map + Nationwide Delivery) */}
      <NearMeSection />

      {/* 8. TRENDING HOMES (5-Column Product Grid) */}
      <section className="py-12 sm:py-16 bg-[#f6f7f9]">
        <div className="wrap">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
                Trending Homes
              </h2>
              <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
                Popular modular homes customers are exploring now.
              </p>
            </div>
            <Link
              href="/buildings"
              className="text-[#d97706] hover:text-[#b45309] font-extrabold text-sm sm:text-base hover:underline whitespace-nowrap self-start sm:self-auto"
            >
              View Trending Homes →
            </Link>
          </div>

          {/* 5-Column Trending Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-4.5">
            {trendingHomes.map((home) => (
              <HomeProductCard key={home.id} product={home} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. CUSTOMIZE YOUR DREAM HOME & FLOOR PLANS (Split Section) */}
      <CustomizeAndPlansSection />

      {/* 10. GET YOUR CUSTOM QUOTE & HOW IT WORKS (Split Section, #quote) */}
      <QuoteAndStepsSection />

      {/* 11. FINANCING & MORTGAGE CALCULATOR */}
      <FinancingSection />

      {/* 12. WATCH OUR HOME TOURS (Asymmetric 5-Video Showcase) */}
      <HomeVideosSection />

      {/* 13. WHAT OUR CUSTOMERS SAY (Live Testimonials) */}
      <HomeTestimonialsSection initialReviews={reviews} />

      {/* 14. LATEST NEWS & RESOURCES (Articles) */}
      <HomeArticlesSection />

      {/* 15. READY TO BUILD YOUR DREAM HOME? (CTA Banner) */}
      <CTASection />
    </div>
  );
}
