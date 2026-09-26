"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Download, Loader2, CheckCircle2, User } from "lucide-react";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, itemCount, isCartOpen, setIsCartOpen } = useCart();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerZip, setCustomerZip] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (customer) {
      if (!customerName) setCustomerName(customer.name || "");
      if (!customerEmail) setCustomerEmail(customer.email || "");
      if (!customerZip && customer.billing_address?.zip) {
        setCustomerZip(customer.billing_address.zip);
      }
    }
  }, [customer, isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) return;

    if (!customerEmail || !customerEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address to receive your blueprint files.");
      return;
    }

    if (!customerName || !customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture UTM parameters from URL/session if available
      const urlParams = new URLSearchParams(window.location.search);
      const attribution = {
        utm_source: urlParams.get("utm_source") || "website",
        utm_medium: urlParams.get("utm_medium") || "organic",
        utm_campaign: urlParams.get("utm_campaign") || undefined,
        referrer: document.referrer || undefined,
      };

      const res = await fetch("/api/payments/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ floorPlanId: i.id, quantity: i.quantity })),
          floorPlanId: items[0]?.id, // for backwards compat
          customerName: customerName.trim(),
          customerEmail: customerEmail.toLowerCase().trim(),
          customerZip: customerZip.trim() || undefined,
          attribution,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to initialize checkout.");
      }

      // If Stripe Checkout URL is returned, redirect directly to hosted Stripe checkout
      if (data.order?.checkoutUrl) {
        window.location.href = data.order.checkoutUrl;
      } else {
        // Test / Dry-run fallback redirect
        clearCart();
        setIsCartOpen(false);
        window.location.href = `/checkout/success?session_id=${data.order?.sessionId}&orderNumber=${data.order?.orderNumber}&title=${encodeURIComponent(
          items[0]?.title || "Blueprint Package"
        )}`;
      }
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      setErrorMessage(err?.message || "Checkout could not be started. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-[#101114] text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#fcb907]" />
              <h2 className="text-lg font-black tracking-tight">Your Blueprint Cart</h2>
              <span className="bg-[#fcb907] text-[#101114] text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-[#fcb907] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#101114]">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Explore our precision engineered architectural blueprint packages ready for building permits.
              </p>
              <Link
                href="/floor-plans"
                onClick={() => setIsCartOpen(false)}
                className="mt-6 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md"
              >
                Browse Floor Plans →
              </Link>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <Image
                        src={item.previewImage || "/finallogo.avif"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-black text-[#101114] truncate">{item.title}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.dimensions || "Complete Construction Set"} {item.sqft ? `• ${item.sqft} sqft` : ""}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm font-black text-[#101114]">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold text-[#101114]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form & Summary */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
                <form onSubmit={handleCheckout} className="space-y-3">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  {isAuthenticated && customer ? (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-gray-700">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-[#fcb907] text-[#101114] flex items-center justify-center text-[10px] font-black shrink-0">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                        </span>
                        <span className="truncate font-semibold">
                          Signed in as <strong className="text-[#101114]">{customer.name}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Linked to Portal
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 flex items-center justify-between pb-1">
                      <span>Have an account?</span>
                      <Link
                        href="/account/login"
                        onClick={() => setIsCartOpen(false)}
                        className="text-[#d97706] font-bold hover:underline"
                      >
                        Sign in for faster checkout
                      </Link>
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full Name *"
                      required
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] placeholder-gray-400 focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907]"
                    />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email Address (for blueprint download link) *"
                      required
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] placeholder-gray-400 focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907]"
                    />
                    <input
                      type="text"
                      value={customerZip}
                      onChange={(e) => setCustomerZip(e.target.value)}
                      placeholder="ZIP / Postal Code (optional)"
                      className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] placeholder-gray-400 focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907]"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-200 space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Delivery</span>
                      <span className="text-emerald-600 font-bold">Instant CAD/PDF Download</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#101114] pt-1">
                      <span>Total Due</span>
                      <span className="text-[#d97706] text-base">${subtotal.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-sm py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Securing Stripe Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pt-1">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-Bit SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-[#fcb907]" />
                      <span>Single-Build License</span>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
