"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, FileText } from "lucide-react";
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

      router.push("/admin/floor-plans");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-stone-500">
        <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading floor plan details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/floor-plans"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Floor Plans
        </Link>
        <h1 className="text-xl font-bold text-stone-900">
          {isNew ? "New Floor Plan Kit" : `Edit: ${form.title}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Tagline & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-stone-700 mb-1">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            >
              <option value="Cabins">Cabins</option>
              <option value="ADUs">ADUs</option>
              <option value="Barndominiums">Barndominiums</option>
              <option value="Modern Residential">Modern Residential</option>
              <option value="Duplex & Multi-Family">Duplex & Multi-Family</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
          />
        </div>

        {/* Specs & Pricing */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Price ($) *</label>
            <input
              type="number"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Sale Price ($)</label>
            <input
              type="number"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Square Feet</label>
            <input
              type="number"
              value={form.squareFeet}
              onChange={(e) => setForm({ ...form, squareFeet: Number(e.target.value) })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Dimensions</label>
            <input
              type="text"
              value={form.dimensions}
              onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Media & Blueprints Visual Assets */}
        <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-6">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2">
            Architectural Drawings & Visual Media
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUpload
              label="Primary Blueprint Cover Image *"
              value={form.previewImage}
              onChange={(url) => setForm({ ...form, previewImage: url })}
              folder="floor-plans"
              aspectRatio="16/10"
              helperText="Featured exterior rendering or architectural 3D layout."
            />

            <ImageUpload
              label="Downloadable Blueprint Kit (PDF / ZIP)"
              value={form.filePath}
              onChange={(url) => setForm({ ...form, filePath: url })}
              folder="floor-plans/packages"
              accept=".pdf,.zip,.dwg,application/pdf,application/zip"
              aspectRatio="16/10"
              placeholder="e.g. downloads/blueprints/plan-kit.zip or upload file"
              helperText="The secure architectural package delivered to customer upon purchase."
            />
          </div>

          <GalleryUpload
            label="Floor Plan Image Gallery"
            values={form.gallery || []}
            onChange={(urls) => setForm({ ...form, gallery: urls })}
            folder="floor-plans/gallery"
            helperText="Upload floor layouts, elevations, electrical riser schematics, and dimension sheets."
          />
        </div>

        {/* Status & Featured */}
        <div className="flex items-center gap-6 pt-4 border-t border-stone-100">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Publish Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-orange-600"
            >
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-5">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-orange-500"
            />
            <span className="text-xs font-semibold text-stone-700">Feature on Homepage</span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Floor Plan Blueprint
          </button>
        </div>
      </form>
    </div>
  );
}
