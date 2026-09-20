"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const initialToken = searchParams.get("token") || "";
  const initialOrderNumber = searchParams.get("orderNumber") || "MH-ORD-VERIFIED";
  const initialTitle = searchParams.get("title") || "Architectural Floor Plan Blueprint Kit";

  const [loading, setLoading] = useState(Boolean(sessionId && !initialToken));
  const [token, setToken] = useState(initialToken);
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyStripeSession() {
      if (!sessionId || token) return;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/payments/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await res.json();

        if (res.ok && data.success && data.downloadToken) {
          setToken(data.downloadToken);
          if (data.orderNumber) setOrderNumber(data.orderNumber);
          if (data.planTitle) setTitle(data.planTitle);
        } else {
          throw new Error(data.error?.message || "Failed to verify Stripe payment session.");
        }
      } catch (err: any) {
        console.error("Session verification error:", err);
        setError(err.message || "Failed to verify payment status.");
      } finally {
        setLoading(false);
      }
    }

    verifyStripeSession();
  }, [sessionId, token]);

  const downloadUrl = `/api/downloads/${token}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-stone-200/80 shadow-xl">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto" />
          <h2 className="text-xl font-black text-stone-900">Verifying Stripe Payment...</h2>
          <p className="text-xs text-stone-500">
            Confirming your single-build architectural license and generating secure download access.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 border border-red-200 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-stone-900">Payment Verification Issue</h2>
          <p className="text-xs text-stone-600">{error}</p>
          <div className="pt-2">
            <Link
              href="/floor-plans"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl"
            >
              Back to Floor Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Stripe Payment Verified & Licensed
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-stone-900">
              Thank You for Your Order!
            </h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Your architectural blueprints for <span className="font-semibold text-stone-800">{title}</span> have been unlocked.
            </p>
          </div>

          {/* Order Metadata Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 max-w-lg mx-auto flex items-center justify-around text-xs text-stone-600">
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Order Number</div>
              <div className="font-mono font-bold text-stone-900 text-sm mt-0.5">{orderNumber}</div>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Access Status</div>
              <div className="font-bold text-emerald-600 text-sm mt-0.5">Active (7 Days)</div>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <div className="text-[10px] uppercase font-bold text-stone-400">Downloads Left</div>
              <div className="font-bold text-stone-900 text-sm mt-0.5">5 Downloads</div>
            </div>
          </div>

          {/* Direct Download Button */}
          <div className="pt-2">
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-orange-600/25 transition-all hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download Blueprint Package (.PDF)
            </a>
          </div>

          <p className="text-xs text-stone-400">
            Clicking download delivers your full CAD and architectural engineering blueprint package.
          </p>
        </div>

        {/* Instructions & Next Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 space-y-6">
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-orange-600" />
            Next Steps & Construction Guidance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600">
            <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Review Drawing Sheets</h3>
              <p className="text-stone-500 leading-relaxed">
                Open the PDF package to inspect sheet layouts, 1/4” elevations, and room dimension schedules.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Submit to Local City/County</h3>
              <p className="text-stone-500 leading-relaxed">
                Provide these drawings to your local building department for zoning, setback, and permit approvals.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl space-y-1.5">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Factory Build or DIY</h3>
              <p className="text-stone-500 leading-relaxed">
                Hand plans to your general contractor or contact ModularHome for complete factory framing delivery.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-stone-500">
              <HelpCircle className="w-4 h-4 text-stone-400" />
              <span>Questions regarding your order? Email support@modularhome.com</span>
            </div>
            <Link
              href="/floor-plans"
              className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1"
            >
              Browse More Floor Plans
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
