"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Download, Search, Layers, Loader2, ArrowRight } from "lucide-react";

export default function AdminFloorPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/floor-plans");
      const json = await res.json();
      if (json.success) {
        setPlans(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete floor plan "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/floor-plans/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPlans(plans.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = plans.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Digital Floor Plan Kits
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage downloadable architectural CAD/PDF blueprint packages, dimensions, and customer licenses.
          </p>
        </div>
        <Link
          href="/admin/floor-plans/new"
          className="px-5 py-3 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Floor Plan</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search blueprints by name, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "Cabins", "ADUs", "Barndominiums", "Modern Residential"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#101114] text-white shadow-xs"
                  : "bg-[#f8f9fa] text-[#6b7280] hover:text-[#101114] hover:bg-[#e7e9ee] border border-[#d5d9e0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#6b7280] flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading floor plan packages...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead className="bg-[#f8f9fa] text-[#6b7280] uppercase text-[10px] font-bold border-b border-[#e7e9ee] tracking-wider font-mono">
                <tr>
                  <th className="px-5 py-4">Blueprint Model</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Specifications</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-[#f8f9fa]/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-xl bg-[#f8f9fa] overflow-hidden shrink-0 border border-[#e7e9ee]">
                          <Image
                            src={plan.preview_image || plan.previewImage || "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600&auto=format&fit=crop"}
                            alt={plan.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#101114] text-sm font-sans">{plan.title}</div>
                          <div className="text-[#6b7280] text-[11px] font-mono mt-0.5">/{plan.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#f8f9fa] border border-[#d5d9e0] text-[#101114] text-[11px] font-bold">
                        {plan.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#101114]">
                      <div className="font-medium">
                        {plan.square_feet || plan.squareFeet} sqft • {plan.bedrooms} Bed / {plan.bathrooms} Bath
                      </div>
                      <div className="text-[11px] text-[#6b7280]">{plan.dimensions}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#101114] text-sm font-serif">
                      ${plan.sale_price || plan.salePrice || plan.price}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          plan.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/floor-plans/${plan.id}`}
                        className="p-2 rounded-xl text-[#101114] hover:bg-white hover:border-[#d5d9e0] border border-transparent inline-block transition-all shadow-2xs"
                        title="Edit Blueprint Kit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(plan.id, plan.title)}
                        className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 border border-transparent hover:border-red-200 inline-block transition-all cursor-pointer"
                        title="Delete Blueprint Kit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-[#6b7280] font-medium">
            No floor plan blueprint kits found matching your query.
          </div>
        )}
      </div>
    </div>
  );
}
