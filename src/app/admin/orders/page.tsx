"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
  X,
  Copy,
  Check,
  Download,
  KeyRound,
  FileText,
  Mail,
  User,
  CreditCard,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [regeneratingToken, setRegeneratingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

  const fetchOrderDetail = async (id: string) => {
    setSelectedOrderId(id);
    setLoadingDetail(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrderDetail(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (paymentStatus: string, orderStatus: string) => {
    if (!selectedOrderId) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus, orderStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrderDetail((prev: any) => ({
          ...prev,
          payment_status: paymentStatus,
          order_status: orderStatus,
        }));
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrderId
              ? { ...o, payment_status: paymentStatus, order_status: orderStatus }
              : o
          )
        );
        setStatusMessage("Order status updated successfully!");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!selectedOrderId) return;
    setRegeneratingToken(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_download_token" }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage("New secure 7-day download token generated!");
        // Refresh details
        fetchOrderDetail(selectedOrderId);
      } else {
        alert(json.error?.message || "Failed to generate download token.");
      }
    } catch (e) {
      alert("Failed to generate download token.");
    } finally {
      setRegeneratingToken(false);
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

  const latestDownloadAccess = orderDetail?.download_access?.[0] || null;
  const downloadLink = latestDownloadAccess?.download_token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/blueprints/download?token=${latestDownloadAccess.download_token}`
    : "";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
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
                  <th className="px-5 py-4 text-right">Actions</th>
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
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => fetchOrderDetail(ord.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#d5d9e0] bg-white text-[#101114] hover:bg-[#f8f9fa] hover:border-[#fcb907] transition-all text-xs font-bold cursor-pointer"
                        title="Inspect Order Details & License"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#d97706]" />
                        <span>Inspect</span>
                      </button>
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

      {/* Order Detail Modal / Drawer */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-[#e7e9ee] shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#e7e9ee] pb-4">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d97706] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Blueprint Order License Audit</span>
                </div>
                <h2 className="text-xl font-bold text-[#101114] font-serif mt-1">
                  Order #{orderDetail?.order_number || selectedOrderId}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setOrderDetail(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-[#6b7280] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-16 text-center text-xs text-[#6b7280] flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
                <span>Loading order and digital license records...</span>
              </div>
            ) : orderDetail ? (
              <div className="space-y-6 text-xs">
                {statusMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Customer & Payment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9fa] p-4 rounded-2xl border border-[#e7e9ee]">
                  <div>
                    <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Customer Name</span>
                    <span className="font-bold text-sm text-[#101114]">{orderDetail.customer_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Email Address</span>
                    <a
                      href={`mailto:${orderDetail.customer_email}`}
                      className="font-bold text-[#101114] hover:text-[#d97706] hover:underline"
                    >
                      {orderDetail.customer_email || "N/A"}
                    </a>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Stripe Checkout Session</span>
                    <span className="font-mono text-[11px] text-[#101114] truncate block max-w-xs" title={orderDetail.stripe_session_id}>
                      {orderDetail.stripe_session_id || "Direct Checkout"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Total Charged</span>
                    <span className="font-serif font-black text-base text-[#101114]">
                      ${orderDetail.total_amount} <span className="text-[10px] font-mono text-[#6b7280]">{orderDetail.currency || "USD"}</span>
                    </span>
                  </div>
                </div>

                {/* Status Adjuster */}
                <div className="p-4 rounded-2xl border border-[#e7e9ee] space-y-3 bg-white">
                  <h3 className="font-bold font-mono uppercase text-[11px] text-[#101114]">
                    Update Transaction Status
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#6b7280] font-mono text-[10px] uppercase mb-1">Payment Status</label>
                      <select
                        defaultValue={orderDetail.payment_status}
                        onChange={(e) => handleUpdateStatus(e.target.value, orderDetail.order_status)}
                        disabled={updatingStatus}
                        className="w-full px-3 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] font-bold text-xs"
                      >
                        <option value="PAID">PAID (Successful)</option>
                        <option value="PENDING">PENDING (Awaiting Stripe)</option>
                        <option value="FAILED">FAILED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#6b7280] font-mono text-[10px] uppercase mb-1">Fulfillment Status</label>
                      <select
                        defaultValue={orderDetail.order_status || "COMPLETED"}
                        onChange={(e) => handleUpdateStatus(orderDetail.payment_status, e.target.value)}
                        disabled={updatingStatus}
                        className="w-full px-3 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] font-bold text-xs"
                      >
                        <option value="COMPLETED">COMPLETED (Digital Delivered)</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Purchased Items */}
                <div className="space-y-2">
                  <h3 className="font-bold font-mono uppercase text-[11px] text-[#101114]">
                    Purchased Plan Packages & Licenses
                  </h3>
                  <div className="border border-[#e7e9ee] rounded-2xl divide-y divide-[#e7e9ee] overflow-hidden">
                    {orderDetail.order_items && orderDetail.order_items.length > 0 ? (
                      orderDetail.order_items.map((item: any) => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#101114]">{item.title}</div>
                            <div className="text-[11px] text-[#6b7280] font-mono">
                              Floor Plan ID: {item.floor_plan_id || "N/A"} • License: {item.license_type || "Single-Build License"}
                            </div>
                          </div>
                          <div className="font-bold text-sm font-serif text-[#101114]">
                            ${item.unit_price || item.total_price}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 text-center text-[#6b7280]">
                        Modular Architectural Construction Blueprints (Full CAD + PDF Package)
                      </div>
                    )}
                  </div>
                </div>

                {/* Digital Download Access & Token Section */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#d97706]" />
                      <h3 className="font-bold font-mono uppercase text-[11px] text-[#101114]">
                        Digital Download Token & Access Link
                      </h3>
                    </div>
                    <button
                      onClick={handleRegenerateToken}
                      disabled={regeneratingToken}
                      className="px-3 py-1.5 bg-[#101114] hover:bg-black text-white text-[10px] font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {regeneratingToken && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Regenerate Token</span>
                    </button>
                  </div>

                  {latestDownloadAccess ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#6b7280]">Download Counter:</span>
                        <span className="font-mono font-bold text-[#101114]">
                          {latestDownloadAccess.download_count} / {latestDownloadAccess.max_downloads || 5} downloads used
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#6b7280]">Expires On:</span>
                        <span className="font-mono text-[#101114]">
                          {new Date(latestDownloadAccess.expires_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-amber-200 font-mono text-[11px] flex items-center justify-between gap-2 overflow-hidden">
                        <span className="truncate text-[#101114]">{downloadLink}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(downloadLink);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-[#b45309] rounded-lg font-bold text-[10px] cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#6b7280] flex items-center justify-between">
                      <span>No active download access record. Click &quot;Regenerate Token&quot; to issue a 7-day secure customer download link.</span>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <div className="pt-4 border-t border-[#e7e9ee] flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedOrderId(null);
                      setOrderDetail(null);
                    }}
                    className="px-5 py-2.5 bg-[#101114] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Close Audit
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
