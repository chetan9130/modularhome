"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  ImageIcon,
  FolderOpen,
  Video,
} from "lucide-react";
import ImageUpload, { GalleryUpload } from "@/components/admin/ImageUpload";

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [collections, setCollections] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/collections").then((r) => r.json()),
      fetch(`/api/admin/products/${productId}`).then((r) => r.json()),
    ])
      .then(([collJson, prodJson]) => {
        if (collJson.success) setCollections(collJson.data || []);
        if (prodJson.success) {
          const p = prodJson.data;
          const assignedIds =
            p.collectionIds ||
            p.collections?.map((c: any) => c._id || c.collectionId || c.collection?.id || c.id) ||
            [];
          setProduct({
            ...p,
            collectionIds: assignedIds,
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleCollectionToggle = (id: string) => {
    setProduct((prev: any) => {
      const exists = prev.collectionIds?.includes(id);
      return {
        ...prev,
        collectionIds: exists
          ? prev.collectionIds.filter((c: string) => c !== id)
          : [...(prev.collectionIds || []), id],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Product model updated successfully!" });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to update product." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
        <Loader2 className="w-8 h-8 animate-spin text-[#d97706]" />
        <span>Loading product model details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white rounded-[18px] border border-[#e7e9ee] p-8">
        <p className="text-sm font-bold text-[#101114]">Product model not found.</p>
        <Link href="/admin/products" className="text-xs font-bold text-[#d97706] mt-3 inline-block hover:underline">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in pb-12">
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
              Edit Model: {product.name}
            </h1>
            <p className="text-xs text-[#6b7280] font-mono mt-0.5">
              Slug: /models/{product.slug}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
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
                  value={product.name || ""}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Slug / URL Identifier *</label>
                <input
                  type="text"
                  required
                  value={product.slug || ""}
                  onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs font-mono text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Category</label>
                <select
                  value={product.category || "Residential"}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
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
                  value={product.startingPrice || 0}
                  onChange={(e) => setProduct({ ...product, startingPrice: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-bold font-serif focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Square Footage (Sq Ft)</label>
                <input
                  type="number"
                  value={product.sqft || 0}
                  onChange={(e) => setProduct({ ...product, sqft: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Tagline</label>
              <input
                type="text"
                value={product.tagline || ""}
                onChange={(e) => setProduct({ ...product, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Full Description</label>
              <textarea
                rows={4}
                value={product.description || ""}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>

          {/* Specs */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              Room Dimensions & Structural Specs
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Bedrooms</label>
                <input
                  type="number"
                  value={product.bedrooms || 0}
                  onChange={(e) => setProduct({ ...product, bedrooms: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Bathrooms</label>
                <input
                  type="number"
                  value={product.bathrooms || 0}
                  onChange={(e) => setProduct({ ...product, bathrooms: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Stories</label>
                <input
                  type="number"
                  value={product.stories || 1}
                  onChange={(e) => setProduct({ ...product, stories: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Dimensions</label>
                <input
                  type="text"
                  value={product.dimensions || ""}
                  onChange={(e) => setProduct({ ...product, dimensions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Frame Engineering</label>
                <input
                  type="text"
                  value={product.frameType || ""}
                  onChange={(e) => setProduct({ ...product, frameType: e.target.value })}
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
                <span className={`text-[10px] ${product.seoTitle?.length > 60 ? "text-amber-600 font-bold" : "text-[#6b7280]"}`}>
                  {product.seoTitle?.length || 0} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={product.seoTitle || ""}
                onChange={(e) => setProduct({ ...product, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#101114]">Meta Description</label>
                <span className={`text-[10px] ${product.metaDescription?.length > 160 ? "text-amber-600 font-bold" : "text-[#6b7280]"}`}>
                  {product.metaDescription?.length || 0} / 160 chars
                </span>
              </div>
              <textarea
                rows={2}
                value={product.metaDescription || ""}
                onChange={(e) => setProduct({ ...product, metaDescription: e.target.value })}
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
              value={product.primaryImage || ""}
              onChange={(url) => setProduct({ ...product, primaryImage: url })}
              folder="products"
              aspectRatio="16/10"
              helperText="High-resolution hero photo for catalog cards and detail pages."
            />

            <ImageUpload
              label="Floor Plan Architecture Preview"
              value={product.floorPlanImage || ""}
              onChange={(url) => setProduct({ ...product, floorPlanImage: url })}
              folder="products/floor-plans"
              aspectRatio="4/3"
              helperText="Blueprint layout preview image displayed in specs tab."
            />

            <GalleryUpload
              label="Model Photo Gallery"
              values={product.gallery || []}
              onChange={(urls) => setProduct({ ...product, gallery: urls })}
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
                value={product.videoUrl || ""}
                onChange={(e) => setProduct({ ...product, videoUrl: e.target.value })}
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
                      checked={product.collectionIds?.includes(cId)}
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
                checked={!!product.isPublished}
                onChange={(e) => setProduct({ ...product, isPublished: e.target.checked })}
                className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
              />
              <span>Published (Live in Model Catalog)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-bold text-[#101114] cursor-pointer">
              <input
                type="checkbox"
                checked={!!product.isFeatured}
                onChange={(e) => setProduct({ ...product, isFeatured: e.target.checked })}
                className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
              />
              <span>Featured on Homepage</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
