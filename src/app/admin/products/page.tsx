"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [publishFilter, setPublishFilter] = useState("ALL");

  const categories = [
    "Residential",
    "Modular Homes",
    "Prefab Homes",
    "Barndominiums",
    "Cabins",
    "Tiny Homes",
    "ADUs",
    "House Kits",
    "A-Frames",
    "Commercial",
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/products", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (categoryFilter !== "ALL") url.searchParams.set("category", categoryFilter);
      if (publishFilter !== "ALL") url.searchParams.set("isPublished", publishFilter === "PUBLISHED" ? "true" : "false");

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setProducts(json.data || []);
      }
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, publishFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === id ? { ...p, isPublished: !current } : p))
        );
      }
    } catch (e) {
      alert("Failed to toggle publish status.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      } else {
        alert(json.error?.message || "Failed to delete product.");
      }
    } catch (e) {
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Home Models & Catalog CMS
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage your catalog of precision steel modular homes, specifications, gallery renderings, and architectural series.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Model</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
          <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#101114] font-bold uppercase tracking-wider font-mono">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#101114] font-bold uppercase tracking-wider font-mono">Status:</span>
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
            >
              <option value="ALL">All</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading product catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-[#6b7280] text-xs font-medium">
            No home models found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e7e9ee] text-[#6b7280] font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-4 px-5">Model / Preview</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Specifications</th>
                  <th className="py-4 px-5">Starting Price</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {products.map((prod) => {
                  const prodId = prod._id || prod.id;
                  return (
                    <tr key={prodId} className="hover:bg-[#f8f9fa]/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#f8f9fa] shrink-0 border border-[#e7e9ee]">
                            <Image
                              src={prod.primaryImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#101114] text-sm font-sans">{prod.name}</div>
                            <div className="text-[11px] font-mono text-[#6b7280]">/models/{prod.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#f8f9fa] text-[#101114] border border-[#d5d9e0] font-bold text-[11px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#101114] text-xs font-medium">
                        {prod.sqft?.toLocaleString()} sq ft • {prod.bedrooms} Bed, {prod.bathrooms} Bath
                      </td>
                      <td className="py-4 px-5 font-bold text-[#101114] text-sm font-serif">
                        ${prod.startingPrice?.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleTogglePublish(prodId, prod.isPublished)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                            prod.isPublished
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {prod.isPublished ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-gray-500" />}
                          <span>{prod.isPublished ? "Published" : "Hidden"}</span>
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Link
                          href={`/admin/products/${prodId}`}
                          className="p-2 rounded-xl text-[#101114] hover:bg-white hover:border-[#d5d9e0] border border-transparent inline-block transition-all shadow-2xs"
                          title="Edit Model"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prodId, prod.name)}
                          className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 border border-transparent hover:border-red-200 inline-block transition-all cursor-pointer"
                          title="Delete Model"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
