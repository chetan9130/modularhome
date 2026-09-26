"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BuildingCard from "@/components/BuildingCard";
import SectionHeading from "@/components/SectionHeading";
import { BuildingModel } from "@/data/models";

const FEATURED_TABS = [
  "All",
  "Modular Homes",
  "Prefab Homes",
  "Barndominiums",
  "Cabins",
  "Tiny Homes",
  "ADUs & Granny Pods",
  "Custom Homes",
];

export default function FeaturedHomesSection() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [homes, setHomes] = useState<BuildingModel[]>([]);

  useEffect(() => {
    async function loadDynamicHomes() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setHomes(json.data);
          }
        }
      } catch (e) {}
    }
    loadDynamicHomes();
  }, []);

  const filteredHomes = homes.filter((home) => {
    if (activeTab === "All") return true;
    const tabLower = activeTab.toLowerCase().replace(/-/g, " ");
    const hCat = (home.category || "").toLowerCase();
    const hSeries = (home.series || "").toLowerCase();
    const hName = (home.name || "").toLowerCase();
    return hCat.includes(tabLower) || hSeries.includes(tabLower) || hName.includes(tabLower);
  });

  return (
    <section id="featured-homes" className="py-20 bg-white border-b border-[var(--line)] text-[var(--ink)]">
      <div className="wrap">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <SectionHeading
            eyebrow="Architectural Showcase"
            title="FEATURED HOME DESIGNS"
            subtitle="Explore our top-rated modular models, prefabs, log cabins, and barndominium floor plans."
            align="left"
          />

          {/* Filter Tab Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
            {FEATURED_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full shrink-0 transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[var(--r)] text-white shadow-md"
                    : "bg-[var(--soft)] text-[var(--ink)] hover:bg-[var(--r)] hover:text-white border border-[var(--line)]"
                }`}
              >
                {tab === "ADUs & Granny Pods" ? "ADU" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Homes Grid */}
        {filteredHomes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredHomes.slice(0, 6).map((model) => (
              <BuildingCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-[var(--soft)] border border-[var(--line)] rounded-[18px] text-xs text-[var(--muted)]">
            No featured models currently in this category. View our complete catalog for full listings.
          </div>
        )}

        {/* Explore Full Catalog Link */}
        <div className="mt-12 text-center">
          <Link
            href="/models"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--r)] hover:bg-[var(--r-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-[14px] transition-all shadow-md"
          >
            <span>Explore All Floor Plans & Models</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
