"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, CheckCircle2, Clock, XCircle, RefreshCw, Loader2, DollarSign } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((ord) => {
    if (filterStatus !== "ALL" && ord.payment_status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ord.order_number?.toLowerCase().includes(q) ||
        ord.customer_name?.toLowerCase().includes(q) ||
        ord.customer_email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Blueprint Orders & Licenses
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Monitor floor plan transactions, Stripe payments, customer licenses, and digital download tokens.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] text-[#101114] border border-[#d5d9e0] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#fcb907]" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by order #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PAID", "PENDING", "FAILED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-[#101114] text-white shadow-xs"
                  : "bg-[#f8f9fa] text-[#6b7280] hover:text-[#101114] hover:bg-[#e7e9ee] border border-[#d5d9e0]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#6b7280] flex flex-col items-center gap-2 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading transactions...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead className="bg-[#f8f9fa] text-[#6b7280] uppercase text-[10px] font-bold border-b border-[#e7e9ee] tracking-wider font-mono">
                <tr>
                  <th className="px-5 py-4">Order Number</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Blueprint Items</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Payment Status</th>
                  <th className="px-5 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#f8f9fa]/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#101114]">
                      <span className="px-2 py-1 rounded-md bg-[#f8f9fa] border border-[#d5d9e0]">
                        {ord.order_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#101114] font-sans">{ord.customer_name}</div>
                      <div className="text-[#6b7280] text-[11px] font-medium">{ord.customer_email}</div>
                    </td>
                    <td className="px-5 py-4 text-[#101114]">
                      {ord.order_items && ord.order_items.length > 0 ? (
                        ord.order_items.map((it: any, idx: number) => (
                          <div key={idx} className="font-medium">
                            • {it.title}
                          </div>
                        ))
                      ) : (
                        <span className="italic text-[#6b7280]">Architectural Blueprint Package</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-black text-[#101114] text-sm font-serif">
                      ${ord.total_amount} <span className="text-[10px] font-mono text-[#6b7280] font-normal">{ord.currency || "USD"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ord.payment_status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : ord.payment_status === "FAILED"
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {ord.payment_status === "PAID" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : ord.payment_status === "FAILED" ? (
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span>{ord.payment_status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6b7280] text-[11px] whitespace-nowrap">
                      {new Date(ord.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-[#6b7280] font-medium">
            No orders found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
