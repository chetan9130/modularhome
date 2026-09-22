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
  Eye,
  X,
  MapPin,
  Layers,
  Sparkles,
} from "lucide-react";

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

  const STATUSES = ["PENDING", "REVIEWED", "ESTIMATE_SENT", "ACCEPTED", "DECLINED"];

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/quotations", window.location.origin);
      if (search.trim()) url.searchParams.set("search", search.trim());
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
          prev.map((q) => ((q.id === id || q._id === id) ? { ...q, status: newStatus } : q))
        );
        if (selectedQuote && (selectedQuote.id === id || selectedQuote._id === id)) {
          setSelectedQuote((prev: any) => ({ ...prev, status: newStatus }));
        }
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
        setQuotations((prev) => prev.filter((q) => q.id !== id && q._id !== id));
        if (selectedQuote && (selectedQuote.id === id || selectedQuote._id === id)) {
          setSelectedQuote(null);
        }
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
            placeholder="Search customer, email, phone, model..."
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
                  const customerName = quote.customer_name || quote.customerName || "Anonymous";
                  const customerEmail = quote.customer_email || quote.customerEmail || "";
                  const customerPhone = quote.customer_phone || quote.customerPhone || "";
                  const customerZip = quote.customer_zip || quote.customerZip || "";
                  const modelName = quote.model_name || quote.modelName || "Custom Configuration";
                  const sqft = quote.sqft || quote.approximateSqFt || null;
                  const estimatedAmount = quote.estimated_amount ?? quote.estimatedAmount ?? null;
                  const timeline = quote.timeline || "";
                  const requirements = quote.requirements || quote.notes || quote.description || "";
                  const createdAt = quote.created_at || quote.createdAt;
                  const status = quote.status || "PENDING";

                  return (
                    <tr key={qId} className="hover:bg-[#f8f9fa]/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#101114] text-sm font-sans flex items-center gap-2">
                          <span>{customerName}</span>
                          {customerZip && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                              ZIP: {customerZip}
                            </span>
                          )}
                        </div>
                        {customerEmail && (
                          <div className="text-[11px] text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-[#6b7280]" />
                            <a href={`mailto:${customerEmail}`} className="hover:text-[#d97706] hover:underline">
                              {customerEmail}
                            </a>
                          </div>
                        )}
                        {customerPhone && (
                          <div className="text-[11px] text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-[#6b7280]" />
                            <a href={`tel:${customerPhone}`} className="hover:text-[#d97706] hover:underline">
                              {customerPhone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#101114] flex items-center gap-1.5 font-sans">
                          <Home className="w-3.5 h-3.5 text-[#d97706]" />
                          <span>{modelName}</span>
                        </div>
                        <div className="text-[11px] text-[#6b7280] font-mono mt-0.5">
                          {timeline ? `Timeline: ${timeline}` : quote.source ? `Source: ${quote.source}` : ""}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-[#101114] text-[11px]">
                        <div className="font-medium">{sqft ? `${Number(sqft).toLocaleString()} sq ft` : "Standard Sizing"}</div>
                        {requirements && (
                          <div className="italic text-[#6b7280] line-clamp-1 mt-0.5 font-serif max-w-xs">
                            &ldquo;{requirements}&rdquo;
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-sm text-[#b45309] font-serif">
                        {estimatedAmount ? `$${Number(estimatedAmount).toLocaleString()}` : "Pending Estimate"}
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(qId, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fcb907] ${
                            status === "PENDING"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : status === "DECLINED"
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
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedQuote(quote)}
                            className="p-2 rounded-xl text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] border border-transparent hover:border-[#d5d9e0] transition-colors cursor-pointer"
                            title="View Full Calculation Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(qId, customerName)}
                            className="p-2 rounded-xl text-[#6b7280] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete Quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quote Inspection Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-[#e7e9ee] shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-[#e7e9ee] pb-4">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d97706]">
                  Quote Submission Audit
                </div>
                <h2 className="text-xl font-bold text-[#101114] font-serif mt-1">
                  {selectedQuote.customer_name || selectedQuote.customerName || "Customer Quote"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-[#6b7280] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9fa] p-4 rounded-2xl border border-[#e7e9ee] text-xs">
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Email Address</span>
                <a
                  href={`mailto:${selectedQuote.customer_email || selectedQuote.customerEmail}`}
                  className="font-bold text-[#101114] hover:text-[#d97706] hover:underline"
                >
                  {selectedQuote.customer_email || selectedQuote.customerEmail || "N/A"}
                </a>
              </div>
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Phone Number</span>
                <a
                  href={`tel:${selectedQuote.customer_phone || selectedQuote.customerPhone}`}
                  className="font-bold text-[#101114] hover:text-[#d97706] hover:underline"
                >
                  {selectedQuote.customer_phone || selectedQuote.customerPhone || "N/A"}
                </a>
              </div>
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Site ZIP Code</span>
                <span className="font-bold text-[#101114]">
                  {selectedQuote.customer_zip || selectedQuote.customerZip || "Not Provided"}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Desired Timeline</span>
                <span className="font-bold text-[#101114]">{selectedQuote.timeline || "Standard"}</span>
              </div>
            </div>

            {/* Configured Home Model & Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#101114] uppercase tracking-wider font-mono">
                Building Specification & Calculation
              </h3>

              <div className="border border-[#e7e9ee] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6b7280]">Model Name:</span>
                  <span className="font-bold text-[#101114]">
                    {selectedQuote.model_name || selectedQuote.modelName || "Custom Plan"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6b7280]">Target Size:</span>
                  <span className="font-bold text-[#101114]">
                    {selectedQuote.sqft ? `${Number(selectedQuote.sqft).toLocaleString()} sq ft` : "Standard"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6b7280]">Estimated Total:</span>
                  <span className="font-bold text-base text-[#b45309] font-serif">
                    {selectedQuote.estimated_amount ?? selectedQuote.estimatedAmount
                      ? `$${Number(selectedQuote.estimated_amount ?? selectedQuote.estimatedAmount).toLocaleString()}`
                      : "Pending"}
                  </span>
                </div>
                {selectedQuote.source && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7280]">Intake Source:</span>
                    <span className="font-mono px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-800">
                      {selectedQuote.source}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Notes & Options */}
            {(selectedQuote.requirements || selectedQuote.notes || selectedQuote.description) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#101114] uppercase tracking-wider font-mono">
                  Customer Notes & Requirements
                </h3>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-[#101114] leading-relaxed font-serif italic">
                  &ldquo;{selectedQuote.requirements || selectedQuote.notes || selectedQuote.description}&rdquo;
                </div>
              </div>
            )}

            {/* Action Bar in Modal */}
            <div className="pt-4 border-t border-[#e7e9ee] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6b7280] font-bold uppercase font-mono">Status:</span>
                <select
                  value={selectedQuote.status || "PENDING"}
                  onChange={(e) =>
                    handleStatusChange(selectedQuote.id || selectedQuote._id, e.target.value)
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase border bg-white cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedQuote(null)}
                className="px-5 py-2.5 bg-[#101114] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
