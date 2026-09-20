"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FloorPlan } from "@/data/floorPlans";
import { X, Lock, CheckCircle2, ShieldCheck, Download, Sparkles, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !plan) return null;

  const price = plan.salePrice || plan.price;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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

      // 1. Create order on backend
      const orderRes = await fetch("/api/payments/razorpay/create-order", {
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

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error?.message || "Failed to initiate order.");
      }

      const { order } = orderData;
      const rzpLoaded = await loadRazorpayScript();

      // Helper to verify and navigate
      const completeVerification = async (verifyPayload: any) => {
        const verifyRes = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifyPayload),
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success) {
          onClose();
          router.push(
            `/checkout/success?token=${verifyData.downloadToken}&orderNumber=${order.orderNumber}&title=${encodeURIComponent(plan.title)}`
          );
        } else {
          throw new Error(verifyData.error?.message || "Payment verification failed.");
        }
      };

      // 2. Open Razorpay if script available and keys present
      if (rzpLoaded && window.Razorpay && order.keyId && !order.keyId.includes("public_key")) {
        const options = {
          key: order.keyId,
          amount: Math.round(price * 100),
          currency: "USD",
          name: "ModularHome.com",
          description: `Architectural Blueprint Kit: ${plan.title}`,
          image: "/finallogo.avif",
          order_id: order.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: "#E06322",
          },
          handler: async function (response: any) {
            await completeVerification({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id || order.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              floorPlanId: plan.slug,
              customerEmail: formData.email,
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setErrorMsg(response.error?.description || "Payment failed. Please try again.");
          setLoading(false);
        });
        rzp.open();
      } else {
        // Safe sandbox / demo simulated verification
        setTimeout(async () => {
          await completeVerification({
            orderId: order.id,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: `sig_sim_${Date.now()}`,
            floorPlanId: plan.slug,
            customerEmail: formData.email,
          });
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
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
                Official single-build license with verified engineering specs
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

            {/* Security Guarantee Note */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center gap-3 text-xs text-stone-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                256-bit encrypted checkout. Instant digital download link delivered on screen & via email upon confirmation.
              </span>
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
                  Processing Secure Order...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ${price.toLocaleString()} & Download Blueprints
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
