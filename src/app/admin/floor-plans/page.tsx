"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Download, Search, Layers } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Floor Plans Catalog</h1>
          <p className="text-xs text-stone-500">
            Manage downloadable architectural blueprint kits, pricing, and specs
          </p>
        </div>
        <Link
          href="/admin/floor-plans/new"
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-orange-600/30 transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Floor Plan
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "Cabins", "ADUs", "Barndominiums", "Modern Residential"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading floor plans...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Specs</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          <Image
                            src={plan.preview_image || plan.previewImage}
                            alt={plan.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{plan.title}</div>
                          <div className="text-stone-400 text-[11px] font-mono">{plan.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold">
                        {plan.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      <div>
                        {plan.square_feet || plan.squareFeet} sqft • {plan.bedrooms} Bed / {plan.bathrooms} Bath
                      </div>
                      <div className="text-[11px] text-stone-400">{plan.dimensions}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-stone-900">
                      ${plan.sale_price || plan.salePrice || plan.price}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          plan.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/floor-plans/${plan.id}`}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 inline-block transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(plan.id, plan.title)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 inline-block transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-400">
            No floor plans found.
          </div>
        )}
      </div>
    </div>
  );
}
