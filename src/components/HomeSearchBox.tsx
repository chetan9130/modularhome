"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface HomeSearchBoxProps {
  onFilterChange?: (filters: {
    homeType: string;
    budget: string;
    bedrooms: string;
    bathrooms: string;
    location: string;
  }) => void;
}

export default function HomeSearchBox({ onFilterChange }: HomeSearchBoxProps) {
  const router = useRouter();
  const [homeType, setHomeType] = useState("All Types");
  const [budget, setBudget] = useState("Any Budget");
  const [bedrooms, setBedrooms] = useState("Any");
  const [bathrooms, setBathrooms] = useState("Any");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({ homeType, budget, bedrooms, bathrooms, location });
    }
    
    // Also support redirect to catalog if submitted
    const params = new URLSearchParams();
    if (homeType !== "All Types") params.set("category", homeType);
    if (budget !== "Any Budget") params.set("budget", budget);
    if (bedrooms !== "Any") params.set("beds", bedrooms);
    if (bathrooms !== "Any") params.set("baths", bathrooms);
    if (location) params.set("location", location);

    const query = params.toString();
    router.push(`/buildings${query ? `?${query}` : ""}`);
  };

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="wrap">
        <div className="card p-5 sm:p-7">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
              Find Your Perfect Home
            </h2>
            <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
              Search hundreds of modular homes across the country.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[repeat(5,1fr)_180px] gap-3">
            {/* 1. Home Type */}
            <div className="border border-[#dfe2e7] rounded-[11px] p-3 sm:px-3.5 sm:py-2.5 bg-white flex flex-col justify-center focus-within:border-[#fcb907] focus-within:ring-1 focus-within:ring-[#fcb907] transition-all">
              <label className="block text-[11px] font-semibold text-[#6b7280] mb-0.5">
                Home Type
              </label>
              <select
                value={homeType}
                onChange={(e) => setHomeType(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#101114] focus:outline-none cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Modular Homes">Modular Homes</option>
                <option value="Prefab Cabins">Prefab Cabins</option>
                <option value="Barndominiums">Barndominiums</option>
                <option value="Kit Homes">Kit Homes</option>
                <option value="Turnkey Homes">Turnkey Homes</option>
                <option value="Affordable Housing">Affordable Housing</option>
                <option value="Panelized Log Homes">Panelized Log Homes</option>
                <option value="Tiny Homes & ADUs">Tiny Homes & ADUs</option>
                <option value="Commercial Buildings">Commercial Buildings</option>
              </select>
            </div>

            {/* 2. Budget */}
            <div className="border border-[#dfe2e7] rounded-[11px] p-3 sm:px-3.5 sm:py-2.5 bg-white flex flex-col justify-center focus-within:border-[#fcb907] focus-within:ring-1 focus-within:ring-[#fcb907] transition-all">
              <label className="block text-[11px] font-semibold text-[#6b7280] mb-0.5">
                Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#101114] focus:outline-none cursor-pointer"
              >
                <option value="Any Budget">Any Budget</option>
                <option value="under-75k">Under $75K</option>
                <option value="75k-150k">$75K – $150K</option>
                <option value="150k-250k">$150K – $250K</option>
                <option value="250k-plus">$250K+</option>
              </select>
            </div>

            {/* 3. Bedrooms */}
            <div className="border border-[#dfe2e7] rounded-[11px] p-3 sm:px-3.5 sm:py-2.5 bg-white flex flex-col justify-center focus-within:border-[#fcb907] focus-within:ring-1 focus-within:ring-[#fcb907] transition-all">
              <label className="block text-[11px] font-semibold text-[#6b7280] mb-0.5">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#101114] focus:outline-none cursor-pointer"
              >
                <option value="Any">Any</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>

            {/* 4. Bathrooms */}
            <div className="border border-[#dfe2e7] rounded-[11px] p-3 sm:px-3.5 sm:py-2.5 bg-white flex flex-col justify-center focus-within:border-[#fcb907] focus-within:ring-1 focus-within:ring-[#fcb907] transition-all">
              <label className="block text-[11px] font-semibold text-[#6b7280] mb-0.5">
                Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#101114] focus:outline-none cursor-pointer"
              >
                <option value="Any">Any</option>
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3">3+ Baths</option>
              </select>
            </div>

            {/* 5. Location */}
            <div className="border border-[#dfe2e7] rounded-[11px] p-3 sm:px-3.5 sm:py-2.5 bg-white flex flex-col justify-center focus-within:border-[#fcb907] focus-within:ring-1 focus-within:ring-[#fcb907] transition-all">
              <label className="block text-[11px] font-semibold text-[#6b7280] mb-0.5">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter ZIP or State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-[#101114] focus:outline-none placeholder:text-[#9ca3af] placeholder:font-normal"
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black w-full h-[52px] sm:h-auto min-h-[50px] text-sm sm:text-base flex items-center justify-center gap-2 rounded-[11px] transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Search Homes</span>
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
