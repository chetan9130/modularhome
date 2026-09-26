"use client";

import React, { useState, useMemo, useEffect } from "react";
import { FloorPlan } from "@/data/floorPlans";
import FloorPlanCard from "@/components/FloorPlanCard";
import FloorPlanCheckoutModal from "@/components/FloorPlanCheckoutModal";
import {
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

export default function FloorPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<FloorPlan[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [bedroomFilter, setBedroomFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedPlanForBuy, setSelectedPlanForBuy] = useState<FloorPlan | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadFloorPlans() {
      setLoading(true);
      try {
        const res = await fetch("/api/floor-plans");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            // Map db schema to FloorPlan interface
            const mapped = json.data.map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              tagline: p.tagline,
              description: p.description,
              price: Number(p.price) || 495,
              salePrice: p.sale_price ? Number(p.sale_price) : undefined,
              currency: p.currency || "USD",
              previewImage: p.preview_image || p.previewImage,
              gallery: p.gallery || [],
              filePath: p.file_path,
              fileFormat: p.file_format || "PDF + CAD (DWG)",
              category: p.category || "Cabins",
              bedrooms: Number(p.bedrooms) || 2,
              bathrooms: Number(p.bathrooms) || 1,
              squareFeet: Number(p.square_feet || p.squareFeet) || 800,
              dimensions: p.dimensions || "24x36 ft",
              stories: Number(p.stories) || 1,
              includedItems: p.included_items || [
                "Full Construction Blueprints",
                "Structural Steel Framing & Truss Layouts",
                "Electrical & Plumbing Schematics",
              ],
              features: p.features || [],
              specs: p.specs || {},
              status: p.status || "PUBLISHED",
              isFeatured: !!p.is_featured,
              displayOrder: Number(p.display_order) || 0,
            }));
            setPlans(mapped);
          }
        }
      } catch {
        // Use static initial floor plans
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFloorPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ["ALL", "Cabins", "ADUs", "Barndominiums", "Modern Residential", "Duplex & Multi-Family"];

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (selectedCategory !== "ALL" && plan.category !== selectedCategory) {
        return false;
      }
      if (bedroomFilter !== "ALL" && plan.bedrooms !== parseInt(bedroomFilter, 10)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = plan.title.toLowerCase().includes(q);
        const matchDesc = plan.description.toLowerCase().includes(q);
        const matchCat = plan.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return (a.salePrice || a.price) - (b.salePrice || b.price);
      if (sortBy === "price-desc") return (b.salePrice || b.price) - (a.salePrice || a.price);
      if (sortBy === "sqft-desc") return b.squareFeet - a.squareFeet;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [plans, selectedCategory, bedroomFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-20">
      {/* Hero Header */}
      <section className="relative bg-stone-900 text-white pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E06322_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Architectural Construction Blueprint Catalog
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto">
            Builder-Grade <span className="text-orange-500">Floor Plans</span> & Engineering Kits
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto">
            Download stamped architectural blueprints, clear-span steel framing calculations, and CAD drawings ready for municipal permit submittals.
          </p>

          {/* Quick Value Metrics */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <Zap className="w-6 h-6 text-orange-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Instant Download</div>
                <div className="text-[11px] text-stone-400">PDF + CAD Vector Formats</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">IBC Code Ready</div>
                <div className="text-[11px] text-stone-400">Nationwide Structural Standard</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <Layers className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Full Plan Sets</div>
                <div className="text-[11px] text-stone-400">MEP, Framing & Foundations</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Single-Build License</div>
                <div className="text-[11px] text-stone-400">Complete Builder Freedom</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filter & Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Controls Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-stone-200/80 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search plans by name, style, sqft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600 text-stone-900"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              ))}
            </div>

            {/* Bedroom & Sort dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-600 cursor-pointer"
              >
                <option value="ALL">All Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-600 cursor-pointer"
              >
                <option value="featured">Featured Plans</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="sqft-desc">Square Footage: Largest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-stone-200 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-full" />
                  <div className="h-3 bg-stone-200 rounded w-2/3" />
                  <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                    <div className="h-6 bg-stone-200 rounded w-1/3" />
                    <div className="h-8 bg-stone-200 rounded-lg w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPlans.map((plan) => (
              <FloorPlanCard
                key={plan.id}
                plan={plan}
                onInstantBuy={(p) => setSelectedPlanForBuy(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
            <SlidersHorizontal className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-900">No Floor Plans Match Your Filters</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category selection, bedroom filters, or search terms.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("ALL");
                setBedroomFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <FloorPlanCheckoutModal
        plan={selectedPlanForBuy}
        isOpen={Boolean(selectedPlanForBuy)}
        onClose={() => setSelectedPlanForBuy(null)}
      />
    </div>
  );
}
