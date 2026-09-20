"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Blueprint Orders & Downloads</h1>
          <p className="text-xs text-stone-500">
            Monitor floor plan transactions, Stripe payments, and customer download tokens
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by order #, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "PAID", "PENDING", "FAILED"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterStatus === status
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500">
            <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading transactions...
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items Purchased</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                      {ord.order_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-stone-900">{ord.customer_name}</div>
                      <div className="text-stone-400 text-[11px]">{ord.customer_email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      {ord.order_items && ord.order_items.length > 0 ? (
                        ord.order_items.map((it: any, idx: number) => (
                          <div key={idx} className="font-medium text-stone-900">
                            {it.title}
                          </div>
                        ))
                      ) : (
                        <span>Architectural Blueprint Set</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-stone-900">
                      ${ord.total_amount} {ord.currency || "USD"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.payment_status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.payment_status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.payment_status === "PAID" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-400 text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-stone-400">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
