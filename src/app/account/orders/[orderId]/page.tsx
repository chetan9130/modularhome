"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShoppingBag,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/customer/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found or unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          throw new Error(data.error?.message || "Could not load order");
        }
      })
      .catch((err) => {
        setErrorMsg(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
          Loading Order Details...
        </span>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-[#101114]">Order Not Available</h3>
        <p className="text-xs text-gray-500">{errorMsg || "Unable to find the requested order record."}</p>
        <Link
          href="/account"
          className="inline-block bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
        >
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const downloads = order.download_access || [];
  const primaryDownload = downloads[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#101114] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>
        <Link
          href={`/account/invoices/${order.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-[#101114] font-bold text-xs px-3.5 py-2 rounded-xl transition-colors border border-gray-300"
        >
          <FileText className="w-4 h-4 text-[#d97706]" />
          <span>View Tax Invoice</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Order Banner */}
        <div className="bg-[#101114] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-[#fcb907] uppercase tracking-wider">
              Official Order Confirmation
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{order.order_number}</h1>
            <div className="text-xs text-gray-400">
              Placed on {new Date(order.created_at).toLocaleDateString()} at{" "}
              {new Date(order.created_at).toLocaleTimeString()}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-gray-400">Payment Status</div>
            <div className="mt-1">
              {order.payment_status === "PAID" ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Paid in Full
                </span>
              ) : order.payment_status === "REFUNDED" ? (
                <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
                  Refunded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                  Pending Payment
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Blueprint Download Box (If Paid) */}
        {order.payment_status === "PAID" && primaryDownload && (
          <div className="p-6 sm:p-8 bg-amber-50/60 border-b border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b45309]">
                <ShieldCheck className="w-4 h-4" />
                <span>Single-Build Construction Blueprint License Active</span>
              </div>
              <h3 className="text-base font-black text-[#101114]">
                Download Complete Architectural &amp; CAD Package
              </h3>
              <p className="text-xs text-gray-600">
                Includes architectural elevations, CAD DWG files, MEP diagrams, and foundation details ready for permit stamping.
              </p>
            </div>
            <a
              href={`/api/downloads/${primaryDownload.download_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-sm px-6 py-3.5 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Blueprint (PDF)</span>
            </a>
          </div>
        )}

        {/* Line Items List */}
        <div className="p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-[#101114] tracking-tight">Purchased Items</h3>

          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {(order.order_items || []).map((item: any) => (
              <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#101114]">{item.title}</h4>
                  <p className="text-xs text-gray-500">
                    Architectural Blueprint Construction Package (DWG + PDF) • Qty: {item.quantity || 1}
                  </p>
                </div>
                <div className="text-sm font-black text-[#101114]">
                  ${(Number(item.price) * Number(item.quantity || 1)).toLocaleString()} USD
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="max-w-xs ml-auto space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${Number(order.total_amount).toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span>$0.00 USD</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#101114] pt-2 border-t border-gray-200">
              <span>Total Paid</span>
              <span className="text-[#d97706] text-base">${Number(order.total_amount).toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Support Context */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#fcb907] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#101114]">Questions Regarding Order {order.order_number}?</h4>
            <p className="text-xs text-gray-500">
              Our engineering support team is available at support@modularhome.com or +1 (812) 595-4033.
            </p>
          </div>
        </div>
        <Link
          href={`/contact?subject=${encodeURIComponent(`Order Inquiry: ${order.order_number}`)}`}
          className="bg-gray-100 hover:bg-gray-200 text-[#101114] font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-300 transition-colors shrink-0 text-center"
        >
          Contact Support About This Order
        </Link>
      </div>
    </div>
  );
}
