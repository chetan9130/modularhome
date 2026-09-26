"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  Search, 
  X, 
  RotateCcw, 
  Building2, 
  SlidersHorizontal,
  Loader2,
  Sparkles,
  Home
} from "lucide-react";
import BuildingCard from "@/components/BuildingCard";
import { BuildingModel } from "@/data/models";
import { isCategorySelected, matchProductCategory } from "@/utils/categoryMatching";

const DEFAULT_CATEGORY_TABS = [
  "All",
  "Modular Homes",
  "Prefab Cabins",
  "Barndominiums",
  "Kit Homes",
  "Turnkey Homes",
  "Affordable Housing",
  "Panelized Log Homes",
  "Tiny Homes & ADUs",
  "Commercial Buildings",
];

const ARCHITECTURAL_STYLES = [
  "All",
  "Modern Homes",
  "Farmhouse",
  "Ranch",
  "Cabin",
  "Contemporary",
  "Barndominium",
  "ADU",
  "Multi-Family",
];

// Loading Skeleton Card
function BuildingCardSkeleton() {
  return (
    <div className="card overflow-hidden bg-white border border-[#e7e9ee] animate-pulse rounded-[14px]">
      <div className="aspect-[16/10] w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3.5 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="h-9 bg-gray-200 rounded-lg w-full mt-3" />
      </div>
    </div>
  );
}

export default function ModelsCatalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<BuildingModel[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORY_TABS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStyle, setSelectedStyle] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");
  const [bathroomFilter, setBathroomFilter] = useState<string>("all");
  const [storiesFilter, setStoriesFilter] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(350000);
  const [minSqft, setMinSqft] = useState<number>(0);

  // Load models and categories
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicData() {
      setLoading(true);
      try {
        const [prodRes, colRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/collections"),
        ]);

        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (isMounted && prodJson.success && Array.isArray(prodJson.data)) {
            setModels(prodJson.data);
          }
        }

        if (colRes.ok) {
          const colJson = await colRes.json();
          if (isMounted && colJson.success && Array.isArray(colJson.data) && colJson.data.length > 0) {
            const topCols = colJson.data
              .filter((c: any) => c.productCount > 0 || /modular|prefab|cabin|barndo|kit|turnkey|affordable/i.test(c.name))
              .slice(0, 15)
              .map((c: any) => c.name);
            const merged = Array.from(new Set(["All", ...DEFAULT_CATEGORY_TABS, ...topCols]));
            setCategories(merged);
          }
        }
      } catch (e) {
        console.error("Failed to load catalog data:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadDynamicData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state with URL search params
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory("All");
    }
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Handle category tab change with URL update
  const handleCategoryChange = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
    const params = new URLSearchParams(window.location.search);
    if (categoryName === "All") {
      params.delete("category");
    } else {
      params.set("category", categoryName);
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    window.history.replaceState(null, "", newUrl);
  }, [pathname]);

  // Filtering Logic
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // 1. Category Filter using smart matcher
      if (selectedCategory && selectedCategory !== "All") {
        if (!matchProductCategory(model, selectedCategory)) {
          return false;
        }
      }

      // 2. Architectural Style Filter
      if (selectedStyle !== "All" && model.architecturalStyle && model.architecturalStyle !== selectedStyle) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (model.name || "").toLowerCase().includes(query);
        const matchesSeries = (model.series || "").toLowerCase().includes(query);
        const matchesTagline = (model.tagline || "").toLowerCase().includes(query);
        const matchesCat = (model.category || "").toLowerCase().includes(query);
        const matchesDesc = (model.description || "").toLowerCase().includes(query);
        const matchesTags = (model.tags || []).some((t) => t.toLowerCase().includes(query));
        
        if (!matchesName && !matchesSeries && !matchesTagline && !matchesCat && !matchesDesc && !matchesTags) {
          return false;
        }
      }

      // 4. Bedrooms Filter
      if (bedroomFilter !== "all") {
        const requiredBeds = parseInt(bedroomFilter, 10);
        if (model.bedrooms < requiredBeds) {
          return false;
        }
      }

      // 5. Bathrooms Filter
      if (bathroomFilter !== "all") {
        const requiredBaths = parseInt(bathroomFilter, 10);
        if (model.bathrooms < requiredBaths) {
          return false;
        }
      }

      // 6. Stories / Floors Filter
      if (storiesFilter !== "all") {
        const requiredStories = parseFloat(storiesFilter);
        if (model.stories < requiredStories) {
          return false;
        }
      }

      // 7. Max Price Filter
      if (model.startingPrice && model.startingPrice > maxPrice) {
        return false;
      }

      // 8. Min Sqft Filter
      if (model.sqft && model.sqft < minSqft) {
        return false;
      }

      return true;
    });
  }, [models, selectedCategory, selectedStyle, searchQuery, bedroomFilter, bathroomFilter, storiesFilter, maxPrice, minSqft]);

  const handleResetFilters = () => {
    handleCategoryChange("All");
    setSelectedStyle("All");
    setSearchQuery("");
    setBedroomFilter("all");
    setBathroomFilter("all");
    setStoriesFilter("all");
    setMaxPrice(350000);
    setMinSqft(0);
  };

  const isFiltered =
    selectedCategory !== "All" ||
    selectedStyle !== "All" ||
    searchQuery !== "" ||
    bedroomFilter !== "all" ||
    bathroomFilter !== "all" ||
    storiesFilter !== "all" ||
    maxPrice < 350000 ||
    minSqft > 0;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-[#101114]">
      <div className="wrap">
        {/* Page Header */}
        <div className="py-8 border-b border-[#e7e9ee]">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#fcb907]"></span>
            <span>Floor Plans & Architectural Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[-1.5px] text-[#101114]">
            Explore Floor Plans & Homes
          </h1>
        </div>

        {/* Search & Advanced Filters Bar */}
        <div className="py-5 border border-[#e7e9ee] bg-[#f6f7f9] px-4 sm:px-6 rounded-[14px] shadow-xs mt-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search floor plans by name, style, or type..."
                className="w-full bg-white border border-[#dfe2e7] pl-10 pr-4 py-2.5 text-xs text-[#101114] placeholder-[#9ca3af] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#101114]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Reset Filter Button */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="btn-outline py-2 px-3 text-xs font-bold rounded-[9px] flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Grid of Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2 border-t border-[#e7e9ee]">
            {/* Category / Home Type */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5 truncate"
              >
                <option value="All">All Categories</option>
                {categories
                  .filter((c) => c !== "All")
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            {/* Architectural Style */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Style</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5"
              >
                <option value="All">All Styles</option>
                <option value="Modern">Modern</option>
                <option value="Rustic">Rustic</option>
                <option value="Farmhouse">Farmhouse</option>
                <option value="Industrial">Industrial</option>
                <option value="Contemporary">Contemporary</option>
              </select>
            </div>

            {/* Bedrooms Dropdown */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Bedrooms</span>
              <select
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5"
              >
                <option value="all">Any Beds</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>

            {/* Bathrooms Dropdown */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Bathrooms</span>
              <select
                value={bathroomFilter}
                onChange={(e) => setBathroomFilter(e.target.value)}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5"
              >
                <option value="all">Any Baths</option>
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3+">3+ Baths</option>
              </select>
            </div>

            {/* Floors / Stories */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Stories</span>
              <select
                value={storiesFilter}
                onChange={(e) => setStoriesFilter(e.target.value)}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5"
              >
                <option value="all">Any Levels</option>
                <option value="1">1 Story</option>
                <option value="2">2 Stories</option>
              </select>
            </div>

            {/* Min SQ FT Dropdown */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Min Sq Ft</span>
              <select
                value={minSqft}
                onChange={(e) => setMinSqft(Number(e.target.value))}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5"
              >
                <option value={0}>Any Size</option>
                <option value={500}>500+ sq ft</option>
                <option value={1000}>1,000+ sq ft</option>
                <option value={1500}>1,500+ sq ft</option>
                <option value={2000}>2,000+ sq ft</option>
              </select>
            </div>

            {/* Max Budget Filter */}
            <div className="flex flex-col bg-white border border-[#dfe2e7] px-3 py-2 rounded-[9px]">
              <span className="text-[10px] text-[#6b7280] uppercase font-bold">Max Budget</span>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="bg-transparent text-xs text-[#101114] focus:outline-none font-bold cursor-pointer pt-0.5"
              >
                <option value={350000}>All Budgets</option>
                <option value={300000}>Under $300k</option>
                <option value={200000}>Under $200k</option>
                <option value={150000}>Under $150k</option>
                <option value={100000}>Under $100k</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Criteria */}
        <div className="py-4 flex items-center justify-between text-xs text-[#6b7280]">
          {loading ? (
            <div className="flex items-center gap-2 text-[#d97706] font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching live architectural models &amp; floor plans...</span>
            </div>
          ) : (
            <div>
              Showing <span className="text-[#101114] font-bold">{filteredModels.length}</span> of {models.length} models
              {selectedCategory !== "All" && (
                <span className="ml-1 text-[#d97706] font-bold">
                  in {selectedCategory}
                </span>
              )}
            </div>
          )}

          {isFiltered && !loading && (
            <span className="text-[#d97706] font-bold">
              Filtered results active
            </span>
          )}
        </div>

        {/* Product Grid / Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <BuildingCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2">
            {filteredModels.map((model) => (
              <BuildingCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-[#f6f7f9] border border-[#e7e9ee] rounded-[18px] p-8 space-y-3 shadow-sm">
            <Building2 className="w-12 h-12 text-[#6b7280] mx-auto" />
            <h3 className="text-lg font-black uppercase text-[#101114]">
              No Architectural Models Match Your Criteria
            </h3>
            <p className="text-xs sm:text-sm text-[#6b7280] max-w-md mx-auto">
              Try adjusting your maximum price, bedroom count, or category tabs to view our full collection of engineered plans.
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="btn-primary py-2.5 px-6 text-xs font-bold rounded-[9px]"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
