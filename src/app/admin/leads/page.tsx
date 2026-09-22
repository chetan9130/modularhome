"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Shield,
  RefreshCw,
} from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "QUOTE_SENT", "FOLLOW_UP", "WON", "LOST"];
  const SOURCES = ["CONTACT_FORM", "AI_CHAT", "QUOTE_WIZARD", "FLOOR_PLAN_UPLOAD", "NEWSLETTER", "WEBSITE"];

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/leads", window.location.origin);
      if (search.trim()) url.searchParams.set("search", search.trim());
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (sourceFilter !== "ALL") url.searchParams.set("source", sourceFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
      }
    } catch (e) {
      console.error("Error loading leads:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) =>
          prev.map((l) => ((l.id === id || l._id === id) ? { ...l, status: newStatus } : l))
        );
      }
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead inquiry from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id && l._id !== id));
      } else {
        alert(json.error?.message || "Failed to delete lead.");
      }
    } catch (e) {
      alert("Failed to delete lead.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Lead Inquiries & Customer Intake
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Review incoming architectural consultation requests, Instant Quote interactions, and customer inquiries.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLeads}
          className="px-4 py-2.5 bg-white hover:bg-[#f8f9fa] text-[#101114] border border-[#d5d9e0] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#fcb907]" : ""}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLeads();
          }}
          className="relative w-full sm:w-80"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
          <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#101114] font-bold uppercase tracking-wider font-mono">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center text-[#6b7280] text-xs font-medium">
            No customer inquiries found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[800px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e7e9ee] text-[#6b7280] font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-4 px-5">Prospect Contact</th>
                  <th className="py-4 px-5">Location / ZIP</th>
                  <th className="py-4 px-5">Inquiry Details</th>
                  <th className="py-4 px-5">Intake Source</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Date Received</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {leads.map((lead) => {
                  const leadId = lead.id || lead._id;
                  const enquiryDetails = lead.enquiry_details || lead.enquiryDetails || lead.message || "";
                  const createdAt = lead.created_at || lead.createdAt;

                  return (
                    <tr key={leadId} className="hover:bg-[#f8f9fa]/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#101114] text-sm font-sans">{lead.name}</div>
                        {lead.email && (
                          <div className="text-[11px] text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-[#6b7280]" />
                            <a href={`mailto:${lead.email}`} className="hover:text-[#d97706] hover:underline">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="text-[11px] text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-[#6b7280]" />
                            <a href={`tel:${lead.phone}`} className="hover:text-[#d97706] hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-[#101114] font-medium">
                        {lead.location || (lead.zip ? `ZIP: ${lead.zip}` : "Not specified")}
                      </td>
                      <td className="py-4 px-5 text-[#101114] max-w-xs">
                        {enquiryDetails && (
                          <div className="italic text-[#101114] line-clamp-2 font-serif">
                            &ldquo;{enquiryDetails}&rdquo;
                          </div>
                        )}
                        {lead.notes && (
                          <div className="text-[10px] text-[#6b7280] mt-1 font-mono">Note: {lead.notes}</div>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-[#f8f9fa] border border-[#d5d9e0] text-[#101114] font-mono text-[10px] font-bold">
                          {lead.source || "WEBSITE"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <select
                          value={lead.status || "NEW"}
                          onChange={(e) => handleStatusChange(leadId, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fcb907] ${
                            lead.status === "NEW"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : lead.status === "WON"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : lead.status === "LOST"
                              ? "bg-gray-100 text-gray-600 border-gray-300"
                              : "bg-amber-50 text-amber-800 border-amber-200"
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
                        <button
                          onClick={() => handleDelete(leadId, lead.name)}
                          className="p-2 rounded-xl text-[#6b7280] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          title="Delete Lead"
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
