"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Search,
  RefreshCw,
  Layers,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    status: "PUBLISHED",
  });
  const [createError, setCreateError] = useState("");

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/collections", window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setCollections(json.data || []);
      }
    } catch (e) {
      console.error("Error loading collections:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();

      if (json.success) {
        setCreateModalOpen(false);
        setCreateForm({
          name: "",
          slug: "",
          tagline: "",
          description: "",
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          isFeatured: true,
          status: "PUBLISHED",
        });
        await fetchCollections();
      } else {
        setCreateError(json.error?.message || "Failed to create collection.");
      }
    } catch (e: any) {
      setCreateError(e.message || "Network error.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCollections((prev) => prev.filter((c) => (c._id || c.id) !== id));
      } else {
        alert(json.error?.message || "Failed to delete collection.");
      }
    } catch (e) {
      alert("Failed to delete collection.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Collection & Series Management
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Organize steel modular models into curated architectural series, themes, and promotional lines.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
          <span>Loading collections...</span>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-[0_12px_35px_rgba(16,24,40,0.04)]">
          No collections found. Click &quot;New Collection&quot; to create your first architectural series.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((coll) => {
            const collId = coll._id || coll.id;
            return (
              <div
                key={collId}
                className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden flex flex-col group hover:shadow-[0_18px_45px_rgba(16,24,40,0.08)] hover:border-[#fcb907] transition-all duration-200"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/10] w-full bg-[#f8f9fa] overflow-hidden">
                  {coll.image ? (
                    <Image
                      src={coll.image}
                      alt={coll.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
                      <FolderOpen className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold font-mono">
                      {coll.productCount !== undefined ? coll.productCount : (coll.productIds?.length || 0)} Models
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#101114] font-serif">{coll.name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          coll.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {coll.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#6b7280] mt-0.5">/{coll.slug}</p>
                    {coll.tagline && (
                      <p className="text-xs text-[#6b7280] mt-2 line-clamp-2 font-medium">{coll.tagline}</p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-[#e7e9ee] flex items-center justify-between">
                    <Link
                      href={`/admin/collections/${collId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b45309] hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit & Assign Models</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(collId, coll.name)}
                      className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e7e9ee] animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
              <h3 className="text-base font-bold text-[#101114] font-serif">
                Create New Collection
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setCreateForm({ ...createForm, name, slug });
                  }}
                  placeholder="e.g. Modern Minimalist Series"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Slug / URL Path *</label>
                <input
                  type="text"
                  required
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="modern-minimalist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] font-mono text-[11px] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={createForm.tagline}
                  onChange={(e) => setCreateForm({ ...createForm, tagline: e.target.value })}
                  placeholder="e.g. Clean architectural lines with panoramic glass walls."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={createForm.image}
                  onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[#101114] font-bold hover:bg-[#f8f9fa] border border-[#d5d9e0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
