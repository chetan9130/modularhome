"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle2, Loader2, Download } from "lucide-react";
import Link from "next/link";

export default function InvoicePage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/customer/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.order) {
          setOrder(data.order);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold text-gray-500 uppercase">Generating Invoice...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-lg font-bold text-[#101114]">Invoice Not Found</h2>
        <p className="text-xs text-gray-500">The requested invoice could not be located.</p>
        <Link href="/account" className="text-xs font-bold text-[#d97706] hover:underline">
          Return to Customer Portal
        </Link>
      </div>
    );
  }

  const invoiceNumber = `INV-${order.order_number.replace("MH-ORD-", "")}`;
  const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:p-0">
      {/* Printable Control Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#101114]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#101114] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-colors"
        >
          <Printer className="w-4 h-4 text-[#fcb907]" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Official Invoice Sheet */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-12 print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3">
            <Image
              src="/finallogo.avif"
              alt="ModularHome"
              width={160}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <div className="text-xs text-gray-500 leading-relaxed">
              <div className="font-bold text-[#101114]">ModularHome LLC</div>
              <div>100 Industrial Parkway</div>
              <div>Austin, TX 78701</div>
              <div>Phone: +1 (812) 595-4033</div>
              <div>Email: support@modularhome.com</div>
            </div>
          </div>

          <div className="sm:text-right space-y-1">
            <h1 className="text-2xl font-black text-[#101114] tracking-tight">TAX INVOICE</h1>
            <div className="text-xs font-mono font-bold text-[#d97706]">{invoiceNumber}</div>
            <div className="text-xs text-gray-500">Order Ref: {order.order_number}</div>
            <div className="text-xs text-gray-500">Date: {orderDate}</div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID IN FULL
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Billed To</div>
            <div className="text-sm font-black text-[#101114]">{order.customer_name}</div>
            <div className="text-xs text-gray-600">{order.customer_email}</div>
            {order.customer_phone && <div className="text-xs text-gray-600">{order.customer_phone}</div>}
            {order.customer_zip && <div className="text-xs text-gray-600">ZIP: {order.customer_zip}</div>}
          </div>

          <div className="space-y-1 sm:text-right">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</div>
            <div className="text-sm font-bold text-[#101114]">{order.payment_provider || "Stripe Checkout"}</div>
            <div className="text-xs text-gray-500 font-mono truncate max-w-xs sm:ml-auto">
              Ref: {order.payment_id || "N/A"}
            </div>
            <div className="text-xs text-gray-500">License: Single-Build Verified CAD License</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Description</th>
                <th className="p-3.5 text-center">Qty</th>
                <th className="p-3.5 text-right">Unit Price</th>
                <th className="p-3.5 text-right rounded-r-xl">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.order_items || []).map((item: any) => (
                <tr key={item.id}>
                  <td className="p-3.5">
                    <div className="font-black text-[#101114]">{item.title}</div>
                    <div className="text-[11px] text-gray-500">
                      Architectural Blueprints, Structural Framing &amp; CAD Package (DWG + PDF)
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-bold text-gray-700">{item.quantity || 1}</td>
                  <td className="p-3.5 text-right text-gray-700">
                    ${Number(item.price).toLocaleString()} USD
                  </td>
                  <td className="p-3.5 text-right font-black text-[#101114]">
                    ${(Number(item.price) * Number(item.quantity || 1)).toLocaleString()} USD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Breakdown */}
          <div className="max-w-xs ml-auto space-y-2 text-xs pt-4 border-t border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${Number(order.total_amount).toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (0.00%)</span>
              <span>$0.00 USD</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#101114] pt-2 border-t border-gray-200">
              <span>Total Amount</span>
              <span className="text-[#d97706]">${Number(order.total_amount).toLocaleString()} USD</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="pt-8 border-t border-gray-200 text-center space-y-1 text-xs text-gray-400">
          <p className="font-bold text-gray-600">Thank you for choosing ModularHome Precision Engineering.</p>
          <p>This invoice serves as proof of purchase and grants licensing for single-structure construction.</p>
          <p>ModularHome.com • support@modularhome.com • +1 (812) 595-4033</p>
        </div>
      </div>
    </div>
  );
}
