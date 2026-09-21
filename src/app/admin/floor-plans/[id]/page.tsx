"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import ImageUpload, { GalleryUpload } from "@/components/admin/ImageUpload";

export default function AdminFloorPlanEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isNew = id === "new";

  const [form, setForm] = useState({
    title: "",
    slug: "",
    tagline: "",
    description: "",
    price: 495,
    salePrice: "",
    category: "Cabins",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 800,
    dimensions: "24x36 ft",
    stories: 1,
    previewImage:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
    gallery: [] as string[],
    filePath: "downloads/blueprints/plan-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    status: "PUBLISHED",
    isFeatured: false,
    seoTitle: "",
    metaDescription: "",
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isNew && id) {
      fetch(`/api/admin/floor-plans/${id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const p = json.data;
            let galleryUrls: string[] = [];
            try {
              galleryUrls = typeof p.gallery === "string" ? JSON.parse(p.gallery) : p.gallery || [];
            } catch {}
            setForm({
              title: p.title || "",
              slug: p.slug || "",
              tagline: p.tagline || "",
              description: p.description || "",
              price: Number(p.price) || 495,
              salePrice: p.sale_price ? String(p.sale_price) : p.salePrice ? String(p.salePrice) : "",
              category: p.category || "Cabins",
              bedrooms: Number(p.bedrooms) || 2,
              bathrooms: Number(p.bathrooms) || 1,
              squareFeet: Number(p.square_feet || p.squareFeet) || 800,
              dimensions: p.dimensions || "24x36 ft",
              stories: Number(p.stories) || 1,
              previewImage: p.preview_image || p.previewImage || "",
              gallery: galleryUrls,
              filePath: p.file_path || p.filePath || "",
              fileFormat: p.file_format || p.fileFormat || "PDF + CAD (DWG)",
              status: p.status || "PUBLISHED",
              isFeatured: !!(p.is_featured ?? p.isFeatured),
              seoTitle: p.seo_title || p.seoTitle || "",
              metaDescription: p.meta_description || p.metaDescription || "",
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const url = isNew ? "/api/admin/floor-plans" : `/api/admin/floor-plans/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          salePrice: form.salePrice ? Number(form.salePrice) : null,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          squareFeet: Number(form.squareFeet),
          stories: Number(form.stories),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to save floor plan");
      }

      setSuccessMsg("Floor plan blueprint saved successfully!");
      if (isNew) {
        router.push("/admin/floor-plans");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#6b7280] flex flex-col items-center gap-2 font-medium">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span>Loading floor plan details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/floor-plans"
            className="p-2.5 rounded-xl border border-[#d5d9e0] bg-white text-[#101114] hover:bg-[#f8f9fa] transition-all shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
              {isNew ? "New Floor Plan Kit" : `Edit Blueprint: ${form.title}`}
            </h1>
            <p className="text-xs text-[#6b7280] font-mono mt-0.5">
              Slug: /{form.slug || "new-plan"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Blueprint</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
                Blueprint Identity & Categorization
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setForm({ ...form, title, slug: form.slug || slug });
                    }}
                    placeholder="e.g. Modern Barnhouse 1200"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Slug / URL Path *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="modern-barnhouse-1200"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-mono focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Tagline</label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="e.g. Compact 2-Bedroom Minimalist Cabin with Vaulted Ceilings"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-bold focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  >
                    <option value="Cabins">Cabins</option>
                    <option value="ADUs">ADUs</option>
                    <option value="Barndominiums">Barndominiums</option>
                    <option value="Modern Residential">Modern Residential</option>
                    <option value="Duplex & Multi-Family">Duplex & Multi-Family</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Architectural overview, inclusions, CAD file deliverables..."
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                />
              </div>
            </div>

            {/* Specs & Dimensions */}
            <div className="bg-white p-6 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
                Architectural Dimensions & Specifications
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Regular Price ($) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-serif font-bold focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Sale Price ($)</label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-serif font-bold focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Square Feet</label>
                  <input
                    type="number"
                    value={form.squareFeet}
                    onChange={(e) => setForm({ ...form, squareFeet: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Dimensions</label>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    placeholder="24x36 ft"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Bedrooms</label>
                  <input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Bathrooms</label>
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1.5">Stories</label>
                  <input
                    type="number"
                    value={form.stories}
                    onChange={(e) => setForm({ ...form, stories: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:ring-2 focus:ring-[#fcb907] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Visuals & Package Upload */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
              <h3 className="text-xs font-bold text-[#101114] uppercase tracking-wider border-b border-[#e7e9ee] pb-3 font-mono">
                Visual Assets & Blueprints
              </h3>

              <ImageUpload
                label="Primary Blueprint Cover Image *"
                value={form.previewImage}
                onChange={(url) => setForm({ ...form, previewImage: url })}
                folder="floor-plans"
                aspectRatio="16/10"
                helperText="Featured exterior 3D render or blueprint cover."
              />

              <ImageUpload
                label="Downloadable Blueprint Kit (PDF / ZIP)"
                value={form.filePath}
                onChange={(url) => setForm({ ...form, filePath: url })}
                folder="floor-plans/packages"
                accept=".pdf,.zip,.dwg,application/pdf,application/zip"
                aspectRatio="16/10"
                placeholder="e.g. downloads/blueprints/plan-kit.zip or upload"
                helperText="Delivered automatically to customer upon Stripe purchase."
              />

              <GalleryUpload
                label="Floor Plan Drawing Gallery"
                values={form.gallery || []}
                onChange={(urls) => setForm({ ...form, gallery: urls })}
                folder="floor-plans/gallery"
                helperText="Upload electrical diagrams, dimension sheets, and room elevations."
              />
            </div>

            {/* Status & Featured */}
            <div className="bg-white p-6 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
              <h3 className="text-xs font-bold text-[#101114] uppercase tracking-wider border-b border-[#e7e9ee] pb-3 font-mono">
                Publish Status
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Visibility</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-bold focus:bg-white focus:ring-2 focus:ring-[#fcb907]"
                >
                  <option value="PUBLISHED">Published (Live in Blueprint Store)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
                />
                <span className="text-xs font-bold text-[#101114]">Feature in Homepage Carousel</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
