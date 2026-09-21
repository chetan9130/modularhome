"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Search,
  Trash2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Home,
  RefreshCw,
} from "lucide-react";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const STATUSES = ["PENDING", "REVIEWED", "ESTIMATE_SENT", "ACCEPTED", "DECLINED"];

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/quotations", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setQuotations(json.data || []);
      }
    } catch (e) {
      console.error("Error loading quotations:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setQuotations((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
        );
      }
    } catch (e) {
      alert("Failed to update quotation status.");
    }
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (!confirm(`Delete quotation from "${customerName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setQuotations((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert(json.error?.message || "Failed to delete quotation.");
      }
    } catch (e) {
      alert("Failed to delete quotation.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Quote Wizard Submissions
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Review sizing calculations, customer selections, timeline requirements, and pricing estimates submitted online.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchQuotations}
          className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] text-[#101114] border border-[#d5d9e0] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#fcb907]" : ""}`} />
          <span>Refresh Quotes</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchQuotations();
          }}
          className="relative w-full sm:w-80"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, email, or model..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
          <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#101114] font-bold uppercase tracking-wider font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading quote records...</span>
          </div>
        ) : quotations.length === 0 ? (
          <div className="py-20 text-center text-[#6b7280] text-xs font-medium">
            No quote submissions found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e7e9ee] text-[#6b7280] font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Configured Model</th>
                  <th className="py-4 px-5">Size & Requirements</th>
                  <th className="py-4 px-5">Estimated Cost</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Submitted Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {quotations.map((quote) => {
                  const qId = quote.id || quote._id;
                  return (
                    <tr key={qId} className="hover:bg-[#f8f9fa]/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#101114] text-sm font-sans">{quote.customerName}</div>
                        <div className="text-[11px] text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-[#6b7280]" />
                          <a href={`mailto:${quote.customerEmail}`} className="hover:text-[#d97706] hover:underline">
                            {quote.customerEmail}
                          </a>
                        </div>
                        {quote.customerPhone && (
                          <div className="text-[11px] text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-[#6b7280]" />
                            <a href={`tel:${quote.customerPhone}`} className="hover:text-[#d97706] hover:underline">
                              {quote.customerPhone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#101114] flex items-center gap-1.5 font-sans">
                          <Home className="w-3.5 h-3.5 text-[#d97706]" />
                          <span>{quote.modelName || "Custom Configuration"}</span>
                        </div>
                        <div className="text-[11px] text-[#6b7280] font-mono mt-0.5">
                          {quote.timeline ? `Timeline: ${quote.timeline}` : ""}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-[#101114] text-[11px]">
                        <div className="font-medium">{quote.sqft ? `${quote.sqft.toLocaleString()} sq ft` : "Standard Sizing"}</div>
                        {quote.requirements && (
                          <div className="italic text-[#6b7280] line-clamp-1 mt-0.5 font-serif">
                            &ldquo;{quote.requirements}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-sm text-[#b45309] font-serif">
                        {quote.estimatedAmount ? `$${quote.estimatedAmount.toLocaleString()}` : "Pending Estimate"}
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={quote.status}
                          onChange={(e) => handleStatusChange(qId, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fcb907] ${
                            quote.status === "PENDING"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : quote.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : quote.status === "DECLINED"
                              ? "bg-gray-100 text-gray-600 border-gray-300"
                              : "bg-[#f8f9fa] text-[#101114] border-[#d5d9e0]"
                          }`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-5 text-[#6b7280] text-[11px] whitespace-nowrap font-medium">
                        {quote.createdAt
                          ? new Date(quote.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDelete(qId, quote.customerName)}
                          className="p-2 rounded-xl text-[#6b7280] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
