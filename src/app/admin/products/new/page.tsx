"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Search,
  ImageIcon,
  FolderOpen,
  Video,
} from "lucide-react";
import ImageUpload, { GalleryUpload } from "@/components/admin/ImageUpload";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<any>({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    category: "Residential",
    series: "Signature Luxury Series",
    architecturalStyle: "Modern Architectural",
    sqft: 1500,
    bedrooms: 3,
    bathrooms: 2,
    stories: 1,
    startingPrice: 125000,
    dimensions: "32' x 48'",
    frameType: "Engineered Rigid-Steel / Heavy Timber",
    roofPitch: "6:12 Architectural",
    windRating: "150 MPH Hurricane Rated",
    snowLoad: "50 PSF Extreme Load",
    warranty: "10-Year Structural Integrity",
    primaryImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    floorPlanImage: "",
    videoUrl: "",
    isPublished: true,
    isFeatured: false,
    displayOrder: 1,
    seoTitle: "",
    metaDescription: "",
    imageAltText: "",
    canonicalUrl: "",
    collectionIds: [] as string[],
  });

  useEffect(() => {
    fetch("/api/admin/collections")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCollections(json.data || []);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleNameChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setForm({
      ...form,
      name: val,
      slug,
      seoTitle: `${val} | ModularHome.com`,
      metaDescription: `Explore ${val} factory-engineered home with modern architectural design.`,
      imageAltText: val,
    });
  };

  const handleCollectionToggle = (id: string) => {
    setForm((prev: any) => {
      const exists = prev.collectionIds.includes(id);
      return {
        ...prev,
        collectionIds: exists
          ? prev.collectionIds.filter((c: string) => c !== id)
          : [...prev.collectionIds, id],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        router.push("/admin/products");
      } else {
        setError(json.error?.message || "Failed to create product.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl border border-[#d5d9e0] bg-white text-[#101114] hover:bg-[#f6f7f9] transition-all shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
              Create New Home Model
            </h1>
            <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5 font-medium">
              Add a new modular home or building model to the catalog database.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Create Model</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#d97706]" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              Model Identification & Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Model Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Apex 2400 Steel Villa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Slug / URL Identifier *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="apex-2400"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs font-mono text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                >
                  <option value="Residential">Residential</option>
                  <option value="Modular Homes">Modular Homes</option>
                  <option value="Prefab Homes">Prefab Homes</option>
                  <option value="Barndominiums">Barndominiums</option>
                  <option value="Cabins">Cabins</option>
                  <option value="Tiny Homes">Tiny Homes</option>
                  <option value="ADUs">ADUs</option>
                  <option value="House Kits">House Kits</option>
                  <option value="A-Frames">A-Frames</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Starting Price ($) *</label>
                <input
                  type="number"
                  required
                  value={form.startingPrice}
                  onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-bold font-serif focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Square Footage (Sq Ft)</label>
                <input
                  type="number"
                  value={form.sqft}
                  onChange={(e) => setForm({ ...form, sqft: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Flagship 3-Bedroom Single Story Steel Residence"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Full Description</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe architectural features, engineering tolerances, layouts, and energy ratings..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              Room Dimensions & Structural Specs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Bedrooms</label>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Bathrooms</label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Stories / Levels</label>
                <input
                  type="number"
                  value={form.stories}
                  onChange={(e) => setForm({ ...form, stories: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Dimensions</label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="60' x 40'"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Frame Engineering</label>
                <input
                  type="text"
                  value={form.frameType}
                  onChange={(e) => setForm({ ...form, frameType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              <Search className="w-4 h-4 text-[#d97706]" />
              <span>Product SEO Metadata</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#101114]">SEO Title</label>
                <span className={`text-[10px] ${form.seoTitle?.length > 60 ? "text-amber-600 font-bold" : "text-[#6b7280]"}`}>
                  {form.seoTitle?.length || 0} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#101114]">Meta Description</label>
                <span className={`text-[10px] ${form.metaDescription?.length > 160 ? "text-amber-600 font-bold" : "text-[#6b7280]"}`}>
                  {form.metaDescription?.length || 0} / 160 chars
                </span>
              </div>
              <textarea
                rows={2}
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Media Links & Uploads */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              <ImageIcon className="w-4 h-4 text-[#d97706]" />
              <span>Media & Visual Assets</span>
            </div>

            <ImageUpload
              label="Primary Exterior Image *"
              value={form.primaryImage}
              onChange={(url) => setForm({ ...form, primaryImage: url })}
              folder="products"
              aspectRatio="16/10"
              helperText="High-resolution hero photo for catalog cards and detail pages."
            />

            <ImageUpload
              label="Floor Plan Architecture Preview"
              value={form.floorPlanImage}
              onChange={(url) => setForm({ ...form, floorPlanImage: url })}
              folder="products/floor-plans"
              aspectRatio="4/3"
              helperText="Blueprint layout preview image displayed in specs tab."
            />

            <GalleryUpload
              label="Model Photo Gallery"
              values={form.gallery || []}
              onChange={(urls) => setForm({ ...form, gallery: urls })}
              folder="products/gallery"
              helperText="Upload additional angles, interior renders, and walkthrough stills."
            />

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#d97706]" />
                <span>YouTube Walkthrough URL</span>
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>

          {/* Collection Assignments */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              <FolderOpen className="w-4 h-4 text-[#d97706]" />
              <span>Assign to Collections</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {collections.map((c) => {
                const cId = c._id || c.id;
                return (
                  <label
                    key={cId}
                    className="flex items-center gap-2.5 text-xs text-[#101114] font-bold cursor-pointer hover:bg-[#f6f7f9] p-2 rounded-xl transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.collectionIds.includes(cId)}
                      onChange={() => handleCollectionToggle(cId)}
                      className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status & Featured */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-[#101114] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
              />
              <span>Published (Live in Model Catalog)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-bold text-[#101114] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
              />
              <span>Featured on Homepage Showcase</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
