"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FloorPlan, INITIAL_FLOOR_PLANS } from "@/data/floorPlans";
import FloorPlanCheckoutModal from "@/components/FloorPlanCheckoutModal";
import {
  Bed,
  Bath,
  Maximize2,
  Layers,
  Download,
  CheckCircle2,
  ShieldCheck,
  FileCode2,
  ArrowLeft,
  Share2,
  Sparkles,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import RichHtmlContent from "@/components/RichHtmlContent";

export default function FloorPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addItem } = useCart();

  const [plan, setPlan] = useState<FloorPlan | null>(() => {
    return INITIAL_FLOOR_PLANS.find((p) => p.slug === slug || p.id === slug) || null;
  });
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      // Fetch from DB
      try {
        const res = await fetch(`/api/floor-plans/${slug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const p = json.data;
            const mapped: FloorPlan = {
              id: p.id,
              title: p.title,
              slug: p.slug,
              tagline: p.tagline,
              description: p.description,
              price: Number(p.price) || 495,
              salePrice: p.sale_price ? Number(p.sale_price) : undefined,
              currency: p.currency || "USD",
              previewImage: p.preview_image || p.previewImage,
              gallery: p.gallery || [],
              filePath: p.file_path,
              fileFormat: p.file_format || "PDF + CAD (DWG)",
              category: p.category || "Cabins",
              bedrooms: Number(p.bedrooms) || 2,
              bathrooms: Number(p.bathrooms) || 1,
              squareFeet: Number(p.square_feet || p.squareFeet) || 800,
              dimensions: p.dimensions || "24x36 ft",
              stories: Number(p.stories) || 1,
              includedItems: p.included_items || [
                "Full Construction Blueprints",
                "Structural Steel Framing & Truss Layouts",
                "Electrical & Plumbing Schematics",
              ],
              features: p.features || [],
              specs: p.specs || {},
              status: p.status || "PUBLISHED",
              isFeatured: !!p.is_featured,
              displayOrder: Number(p.display_order) || 0,
            };
            setPlan(mapped);
            setSelectedImage(mapped.previewImage);
            return;
          }
        }
      } catch {}
      
      const fallback = INITIAL_FLOOR_PLANS.find((p) => p.slug === slug || p.id === slug);
      if (fallback) {
        setPlan(fallback);
        setSelectedImage(fallback.previewImage);
      }
    }

    if (slug) {
      loadPlan();
    }
  }, [slug]);

  if (!plan) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-[#FAF8F5]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-stone-600">Loading blueprint package...</p>
      </div>
    );
  }

  const price = plan.salePrice || plan.price;
  const discountPercent =
    plan.salePrice && plan.price > plan.salePrice
      ? Math.round(((plan.price - plan.salePrice) / plan.price) * 100)
      : null;

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/floor-plans"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Floor Plan Catalog
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? "Link Copied!" : "Share Plan"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Visual Previews & Blueprint Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Image Stage */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-stone-900 shadow-xl border border-stone-200">
              <Image
                src={selectedImage || plan.previewImage}
                alt={plan.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3.5 py-1 bg-white/95 backdrop-blur-md text-stone-900 text-xs font-bold rounded-full shadow-sm">
                  {plan.category}
                </span>
                {discountPercent && (
                  <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full shadow-sm">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {plan.gallery && plan.gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {plan.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-24 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === imgUrl
                        ? "border-orange-600 ring-2 ring-orange-600/30"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={imgUrl} alt={`${plan.title} view ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Overview & Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
              <h2 className="text-xl font-black text-stone-900">Architectural Overview</h2>
              <RichHtmlContent content={plan.description} />

              {/* Key Features Highlights */}
              {plan.features && plan.features.length > 0 && (
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Design Highlights:
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* What is Included in this Complete Blueprint Set */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900">
                    Complete Construction Drawings Included
                  </h2>
                  <p className="text-xs text-stone-500">
                    Format: {plan.fileFormat} • Single-Build Licensed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.includedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">{item}</div>
                      <div className="text-[11px] text-stone-500">
                        1/4” architectural scale & vector CAD layers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Structural & Engineering Specifications */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
              <h2 className="text-lg font-black text-stone-900">Engineering Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">Square Footage</div>
                  <div className="text-sm font-extrabold text-stone-900">{plan.squareFeet} Sq Ft</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">Dimensions</div>
                  <div className="text-sm font-extrabold text-stone-900">{plan.dimensions}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">Stories</div>
                  <div className="text-sm font-extrabold text-stone-900">{plan.stories} Story</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl">
                  <div className="text-[10px] font-bold text-stone-400 uppercase">Bed / Bath</div>
                  <div className="text-sm font-extrabold text-stone-900">
                    {plan.bedrooms} Bed / {plan.bathrooms} Bath
                  </div>
                </div>
                {plan.specs &&
                  Object.entries(plan.specs).map(([k, v]) => (
                    <div key={k} className="p-3 bg-stone-50 rounded-xl">
                      <div className="text-[10px] font-bold text-stone-400 uppercase">{k}</div>
                      <div className="text-sm font-extrabold text-stone-900">{v}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Box & Checkout Action (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 shadow-xl space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Digital Delivery
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                  {plan.title}
                </h1>
                <p className="text-xs text-stone-500 mt-1">{plan.tagline}</p>
              </div>

              {/* Price Row */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Full Builder Plan Set
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-stone-900">
                      ${price.toLocaleString()}
                    </span>
                    {plan.salePrice && (
                      <span className="text-base line-through text-stone-400">
                        ${plan.price}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    Ready to Build
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart + Instant Buy CTA */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  Buy Floor Plan & Download Now
                </button>

                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      id: plan.id,
                      slug: plan.slug,
                      title: plan.title,
                      price: plan.salePrice || plan.price,
                      previewImage: plan.previewImage,
                      category: plan.category,
                      sqft: plan.squareFeet,
                      dimensions: plan.dimensions,
                    })
                  }
                  className="w-full py-3 px-6 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-300"
                >
                  <ShoppingBag className="w-4 h-4 text-stone-700" />
                  Add to Cart
                </button>
              </div>

              {/* Value Props Bullet List */}
              <div className="space-y-3 pt-2 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Instant access to ZIP file with full PDF & CAD sets</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified engineering calculations matching 2026 IBC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Single-build license included with purchase</span>
                </div>
              </div>

              {/* Quote Wizard Cross-Sell */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-2">
                <div className="text-xs font-bold text-orange-400">Need Factory Prefab Construction?</div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Have this exact plan manufactured in our factory and delivered turnkey to your site.
                </p>
                <Link
                  href={`/quote?model=${plan.slug}`}
                  className="inline-block text-xs font-bold text-white bg-stone-800 hover:bg-stone-700 px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  Configure Turnkey Delivery Quote →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <FloorPlanCheckoutModal
        plan={plan}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}
