"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FloorPlan } from "@/data/floorPlans";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { X, Lock, CheckCircle2, ShieldCheck, Download, Sparkles, Loader2, CreditCard, User } from "lucide-react";

interface FloorPlanCheckoutModalProps {
  plan: FloorPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FloorPlanCheckoutModal({
  plan,
  isOpen,
  onClose,
}: FloorPlanCheckoutModalProps) {
  const router = useRouter();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (customer && isOpen) {
      setFormData((prev) => ({
        name: prev.name || customer.name || "",
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
        zip: prev.zip || customer.billing_address?.zip || "",
      }));
    }
  }, [customer, isOpen]);

  if (!isOpen || !plan) return null;

  const price = plan.salePrice || plan.price;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (!formData.name || !formData.email) {
        setErrorMsg("Please enter your name and email address to receive download access.");
        setLoading(false);
        return;
      }

      // 1. Create Stripe Checkout Session on backend
      const res = await fetch("/api/payments/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          floorPlanId: plan.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerZip: formData.zip,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to initiate checkout session.");
      }

      const { order } = data;

      // 2. If live Stripe Checkout URL provided, redirect to Stripe
      if (order.checkoutUrl) {
        window.location.href = order.checkoutUrl;
        return;
      }

      // 3. Sandbox / local offline fallback simulation
      setTimeout(async () => {
        try {
          const verifyRes = await fetch(
            `/api/payments/stripe/verify-session?session_id=${encodeURIComponent(order.sessionId)}`
          );
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            onClose();
            router.push(
              `/checkout/success?token=${verifyData.downloadToken}&orderNumber=${order.orderNumber}&title=${encodeURIComponent(
                plan.title
              )}`
            );
          } else {
            throw new Error(verifyData.error?.message || "Payment verification failed.");
          }
        } catch (vErr: any) {
          setErrorMsg(vErr.message || "Failed to verify session.");
          setLoading(false);
        }
      }, 1000);
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black">Instant Blueprint Checkout</h2>
              <p className="text-xs text-stone-400">
                Official single-build license with verified CAD & engineering specs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Plan Summary Card */}
          <div className="flex gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200/80">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-stone-200">
              <Image
                src={plan.previewImage}
                alt={plan.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                  {plan.category}
                </span>
                <h3 className="text-base font-bold text-stone-900 line-clamp-1">
                  {plan.title}
                </h3>
                <p className="text-xs text-stone-500">
                  {plan.squareFeet.toLocaleString()} sqft • {plan.bedrooms} Bed • {plan.bathrooms} Bath • {plan.dimensions}
                </p>
              </div>

              <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-200">
                <span className="text-xs font-medium text-stone-600">
                  Total Payable:
                </span>
                <span className="text-xl font-black text-stone-900">
                  ${price.toLocaleString()} <span className="text-xs font-normal text-stone-500">USD</span>
                </span>
              </div>
            </div>
          </div>

          {/* Included Items Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              What You Receive Immediately:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
              {plan.includedItems.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleCheckout} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {errorMsg}
              </div>
            )}

            {isAuthenticated && customer && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span>
                    Signed in as <strong>{customer.name}</strong> ({customer.email})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                  Linked to Portal
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  placeholder="78701"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/30 focus:border-orange-600 text-stone-900"
                />
              </div>
            </div>

            {/* Security & Stripe Guarantee */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Secured with 256-bit SSL encryption via <strong>Stripe</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-stone-400 text-[11px]">
                <CreditCard className="w-4 h-4 text-stone-500" />
                <span>Cards, Apple Pay, Google Pay</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting to Stripe Checkout...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ${price.toLocaleString()} via Stripe & Unlock Blueprints
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
