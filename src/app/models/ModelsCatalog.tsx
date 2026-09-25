"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  X, 
  RotateCcw, 
  Building2, 
} from "lucide-react";
import BuildingCard from "@/components/BuildingCard";
import { BUILDING_MODELS, BuildingModel } from "@/data/models";

const CATEGORY_TABS = [
  "All",
  "Modular Homes",
  "Prefab Homes",
  "Barndominiums",
  "House Kits",
  "Tiny Homes",
  "Park Models",
  "Cabins",
  "ADUs & Granny Pods",
  "A-Frame Homes",
  "Commercial Buildings",
  "Custom Homes",
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

export default function ModelsCatalog() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [models, setModels] = useState<BuildingModel[]>(BUILDING_MODELS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStyle, setSelectedStyle] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");
  const [bathroomFilter, setBathroomFilter] = useState<string>("all");
  const [storiesFilter, setStoriesFilter] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(350000);
  const [minSqft, setMinSqft] = useState<number>(0);

  useEffect(() => {
    async function loadDynamicProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setModels(json.data);
          }
        }
      } catch (e) {
        // Fall back to INITIAL BUILDING_MODELS
      }
    }
    loadDynamicProducts();
  }, []);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORY_TABS.includes(cat)) {
      setSelectedCategory(cat);
    }
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Filtering Logic
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // Category Filter
      if (selectedCategory !== "All" && model.category !== selectedCategory) {
        return false;
      }

      // Architectural Style Filter
      if (selectedStyle !== "All" && model.architecturalStyle !== selectedStyle) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = model.name.toLowerCase().includes(query);
        const matchesSeries = model.series.toLowerCase().includes(query);
        const matchesTagline = model.tagline.toLowerCase().includes(query);
        const matchesCat = model.category.toLowerCase().includes(query);
        if (!matchesName && !matchesSeries && !matchesTagline && !matchesCat) {
          return false;
        }
      }

      // Bedrooms Filter
      if (bedroomFilter !== "all") {
        const requiredBeds = parseInt(bedroomFilter, 10);
        if (model.bedrooms < requiredBeds) {
          return false;
        }
      }

      // Bathrooms Filter
      if (bathroomFilter !== "all") {
        const requiredBaths = parseInt(bathroomFilter, 10);
        if (model.bathrooms < requiredBaths) {
          return false;
        }
      }

      // Stories / Floors Filter
      if (storiesFilter !== "all") {
        const requiredStories = parseFloat(storiesFilter);
        if (model.stories < requiredStories) {
          return false;
        }
      }

      // Max Price Filter
      if (model.startingPrice > maxPrice) {
        return false;
      }

      // Min Sqft Filter
      if (model.sqft < minSqft) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, selectedStyle, searchQuery, bedroomFilter, bathroomFilter, storiesFilter, maxPrice, minSqft]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
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
          <p className="mt-3 text-sm sm:text-base text-[#6b7280] max-w-3xl">
            Discover, compare, and customize factory-built modular homes, prefabs, barndominiums, cabins, ADUs, A-frames, and commercial structures. Filter by bedrooms, bathrooms, square footage, home type, architectural style, and budget.
          </p>

          {/* Category Tabs */}
          <div className="mt-7 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-[9px] shrink-0 transition-all duration-200 cursor-pointer ${
                  selectedCategory === tab
                    ? "bg-[#fcb907] text-[#101114] shadow-sm"
                    : "bg-[#f6f7f9] text-[#101114] hover:bg-[#fcb907]/20 hover:text-[#101114] border border-[#e7e9ee]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
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

            {/* Reset Button */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#d97706] hover:bg-[#fcb907] hover:text-[#101114] bg-white border border-[#dfe2e7] rounded-[9px] transition-colors shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Detailed Multi-Filter Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
          <div>
            Showing <span className="text-[#101114] font-bold">{filteredModels.length}</span> of {models.length} models
          </div>
          {isFiltered && (
            <span className="text-[#d97706] font-bold">
              Filtered results active
            </span>
          )}
        </div>

        {/* Product Grid */}
        {filteredModels.length > 0 ? (
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
