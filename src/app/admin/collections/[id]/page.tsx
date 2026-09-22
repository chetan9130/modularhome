"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  Home,
  Check,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminEditCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params?.id as string;

  const [collection, setCollection] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch(`/api/admin/collections/${collectionId}`).then((r) => r.json()),
    ])
      .then(([prodsJson, collJson]) => {
        if (prodsJson.success) setAllProducts(prodsJson.data || []);
        if (collJson.success) {
          const c = collJson.data;
          setCollection(c);
          const assigned =
            c.productIds ||
            c.products?.map((p: any) => p._id || p.productId || p.product?.id || p.id) ||
            [];
          setSelectedProductIds(assigned);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, [collectionId]);

  const handleProductToggle = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...collection,
          productIds: selectedProductIds,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Collection updated successfully!" });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to update collection." });
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
        <span>Loading collection data...</span>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-20 bg-white rounded-[18px] border border-[#e7e9ee] p-8">
        <p className="text-sm font-bold text-[#101114]">Collection not found.</p>
        <Link href="/admin/collections" className="text-xs font-bold text-[#d97706] mt-3 inline-block hover:underline">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/collections"
            className="p-2.5 rounded-xl border border-[#d5d9e0] bg-white text-[#101114] hover:bg-[#f6f7f9] transition-all shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
              Edit Collection: {collection.name}
            </h1>
            <p className="text-xs text-[#6b7280] font-mono mt-0.5">
              Slug: /{collection.slug} • {selectedProductIds.length} Models Assigned
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Collection</span>
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
        {/* Left 2 Cols: Details & Models assignment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              Collection Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={collection.name || ""}
                  onChange={(e) => setCollection({ ...collection, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1.5">Slug *</label>
                <input
                  type="text"
                  required
                  value={collection.slug || ""}
                  onChange={(e) => setCollection({ ...collection, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs font-mono text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Tagline</label>
              <input
                type="text"
                value={collection.tagline || ""}
                onChange={(e) => setCollection({ ...collection, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Description</label>
              <textarea
                rows={3}
                value={collection.description || ""}
                onChange={(e) => setCollection({ ...collection, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>

          {/* Product Multi-Select Assignment */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114]">
                <Home className="w-4 h-4 text-[#d97706]" />
                <span>Assigned Home Models ({selectedProductIds.length})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {allProducts.map((prod) => {
                const pId = prod._id || prod.id;
                const isSelected = selectedProductIds.includes(pId);
                return (
                  <div
                    key={pId}
                    onClick={() => handleProductToggle(pId)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#fcb907] bg-red-50/50 text-[#101114] shadow-2xs"
                        : "border-[#e7e9ee] bg-[#f6f7f9] text-[#6b7280] hover:border-[#d5d9e0] hover:bg-white"
                    }`}
                  >
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white shrink-0 border border-[#e7e9ee]">
                      <Image
                        src={prod.primaryImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate text-[#101114]">{prod.name}</div>
                      <div className="text-[11px] text-[#6b7280] truncate font-medium">
                        ${prod.startingPrice?.toLocaleString()} • {prod.sqft} sq ft
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#fcb907] text-white" : "border border-[#d5d9e0] bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              <Search className="w-4 h-4 text-[#d97706]" />
              <span>Collection SEO Metadata</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">SEO Title</label>
              <input
                type="text"
                value={collection.seoTitle || ""}
                onChange={(e) => setCollection({ ...collection, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Meta Description</label>
              <textarea
                rows={2}
                value={collection.metaDescription || ""}
                onChange={(e) => setCollection({ ...collection, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              Media & Images
            </h3>

            <ImageUpload
              label="Collection Cover Thumbnail *"
              value={collection.image || ""}
              onChange={(url) => setCollection({ ...collection, image: url })}
              folder="collections"
              aspectRatio="16/10"
              helperText="Square or 16:10 card image displayed in category grids."
            />

            <ImageUpload
              label="Wide Banner Header Image"
              value={collection.bannerImage || ""}
              onChange={(url) => setCollection({ ...collection, bannerImage: url })}
              folder="collections/banners"
              aspectRatio="banner"
              helperText="Panoramic hero banner shown on top of the collection landing page."
            />
          </div>

          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
              Status & Sorting
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Status</label>
              <select
                value={collection.status || "PUBLISHED"}
                onChange={(e) => setCollection({ ...collection, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 text-xs font-bold text-[#101114] cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={!!collection.isFeatured}
                onChange={(e) => setCollection({ ...collection, isFeatured: e.target.checked })}
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
