"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FloorPlan } from "@/data/floorPlans";
import { useCart } from "@/context/CartContext";
import { Bed, Bath, Maximize2, Layers, Download, CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";

interface FloorPlanCardProps {
  plan: FloorPlan;
  onInstantBuy?: (plan: FloorPlan) => void;
}

export default function FloorPlanCard({ plan, onInstantBuy }: FloorPlanCardProps) {
  const { addItem } = useCart();
  const discountPercent =
    plan.salePrice && plan.price > plan.salePrice
      ? Math.round(((plan.price - plan.salePrice) / plan.price) * 100)
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail Header */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <Image
          src={plan.previewImage}
          alt={plan.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-70 group-hover:opacity-80 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-semibold rounded-full shadow-sm">
            {plan.category}
          </span>
          {discountPercent && (
            <span className="px-2.5 py-1 bg-orange-600 text-white text-xs font-bold rounded-full shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Bottom Quick Specs on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center gap-3 text-xs font-medium drop-shadow-sm">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Maximize2 className="w-3.5 h-3.5 text-orange-400" />
            <span>{plan.squareFeet.toLocaleString()} sqft</span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Bed className="w-3.5 h-3.5 text-orange-400" />
            <span>{plan.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
            <Bath className="w-3.5 h-3.5 text-orange-400" />
            <span>{plan.bathrooms} Bath</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-lg text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
              {plan.title}
            </h3>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {plan.tagline || plan.description}
          </p>

          {/* Included Features Bullet Points */}
          <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-medium">Instant CAD + Stamped PDF Blueprints</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500">
              <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Dimensions: {plan.dimensions} • {plan.stories} Story</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Complete Plan Set
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-stone-900">
                ${plan.salePrice || plan.price}
              </span>
              {plan.salePrice && (
                <span className="text-sm line-through text-stone-400">
                  ${plan.price}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/floor-plans/${plan.slug}`}
              className="px-2.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              Details
              <ArrowRight className="w-3 h-3" />
            </Link>

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
              title="Add blueprint to cart"
              className="p-2 text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-orange-600 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            {onInstantBuy && (
              <button
                type="button"
                onClick={() => onInstantBuy(plan)}
                className="px-3 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm hover:shadow-orange-600/20 transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
