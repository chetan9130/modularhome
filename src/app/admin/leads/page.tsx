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
  Eye,
  X,
  UserCheck,
  Send,
  Plus
} from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");

  // Selected Lead Drawer
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [drawerStatusMessage, setDrawerStatusMessage] = useState<string | null>(null);

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

  const openLeadDrawer = (lead: any) => {
    setSelectedLead(lead);
    setAssignee(lead.assigned_to || lead.assignedTo || "");
    setFollowUpDate(lead.follow_up_date || lead.followUpDate || "");
    setNewNote("");
    setDrawerStatusMessage(null);
  };

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
        if (selectedLead && (selectedLead.id === id || selectedLead._id === id)) {
          setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    const leadId = selectedLead.id || selectedLead._id;
    setSavingNote(true);

    try {
      let updatedHistory = Array.isArray(selectedLead.lead_history)
        ? [...selectedLead.lead_history]
        : [];

      if (newNote.trim()) {
        updatedHistory.push({
          id: Date.now().toString(),
          text: newNote.trim(),
          author: "Admin Agent",
          created_at: new Date().toISOString(),
        });
      }

      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: assignee,
          followUpDate: followUpDate || null,
          leadHistory: updatedHistory,
          notes: newNote.trim() ? `${selectedLead.notes ? selectedLead.notes + " | " : ""}${newNote.trim()}` : selectedLead.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedLead((prev: any) => ({
          ...prev,
          assigned_to: assignee,
          follow_up_date: followUpDate,
          lead_history: updatedHistory,
        }));
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId || l._id === leadId
              ? { ...l, assigned_to: assignee, follow_up_date: followUpDate, lead_history: updatedHistory }
              : l
          )
        );
        setNewNote("");
        setDrawerStatusMessage("Lead notes & CRM parameters saved.");
        setTimeout(() => setDrawerStatusMessage(null), 3000);
      }
    } catch (e) {
      alert("Failed to save lead updates.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead inquiry from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id && l._id !== id));
        if (selectedLead && (selectedLead.id === id || selectedLead._id === id)) {
          setSelectedLead(null);
        }
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openLeadDrawer(lead)}
                            className="p-2 rounded-xl text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] border border-transparent hover:border-[#d5d9e0] transition-colors cursor-pointer"
                            title="Inspect Lead & Manage CRM"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(leadId, lead.name)}
                            className="p-2 rounded-xl text-[#6b7280] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="Delete Lead"
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

      {/* Lead CRM Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-[#e7e9ee] shadow-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-[#e7e9ee] pb-4">
              <div>
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d97706] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Lead Profile & CRM Workspace</span>
                </div>
                <h2 className="text-xl font-bold text-[#101114] font-serif mt-1">
                  {selectedLead.name || "Customer Lead"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-[#6b7280] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {drawerStatusMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{drawerStatusMessage}</span>
              </div>
            )}

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9fa] p-4 rounded-2xl border border-[#e7e9ee] text-xs">
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Email Address</span>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="font-bold text-[#101114] hover:text-[#d97706] hover:underline"
                >
                  {selectedLead.email || "Not Provided"}
                </a>
              </div>
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Phone Number</span>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="font-bold text-[#101114] hover:text-[#d97706] hover:underline"
                >
                  {selectedLead.phone || "Not Provided"}
                </a>
              </div>
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Location / ZIP Code</span>
                <span className="font-bold text-[#101114]">
                  {selectedLead.location || selectedLead.zip || "Not Provided"}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block font-mono text-[10px] uppercase">Intake Source</span>
                <span className="font-mono font-bold text-[#101114]">{selectedLead.source || "WEBSITE"}</span>
              </div>
            </div>

            {/* Customer Message / Inquiry */}
            {(selectedLead.enquiry_details || selectedLead.enquiryDetails || selectedLead.message) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#101114] uppercase tracking-wider font-mono">
                  Submitted Inquiry Details
                </h3>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-[#101114] leading-relaxed font-serif italic">
                  &ldquo;{selectedLead.enquiry_details || selectedLead.enquiryDetails || selectedLead.message}&rdquo;
                </div>
              </div>
            )}

            {/* Lead CRM Controls (Assignee & Follow-Up Date) */}
            <div className="p-4 rounded-2xl border border-[#e7e9ee] bg-white space-y-3">
              <h3 className="text-xs font-bold text-[#101114] uppercase tracking-wider font-mono">
                Sales Assignment & Next Follow-Up
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#6b7280] font-mono text-[10px] uppercase mb-1">
                    Assigned Agent / Rep
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="e.g. Sales Team / John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                  />
                </div>
                <div>
                  <label className="block text-[#6b7280] font-mono text-[10px] uppercase mb-1">
                    Follow-Up Date Target
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                  />
                </div>
              </div>
            </div>

            {/* Activity / Notes History Thread */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#101114] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Internal Notes & Interaction History</span>
              </h3>

              {Array.isArray(selectedLead.lead_history) && selectedLead.lead_history.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedLead.lead_history.map((h: any, idx: number) => (
                    <div key={idx} className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e7e9ee] text-xs">
                      <div className="flex items-center justify-between text-[10px] text-[#6b7280] font-mono mb-1">
                        <span className="font-bold text-[#101114]">{h.author || "Admin"}</span>
                        <span>{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-[#101114] font-sans">{h.text}</p>
                    </div>
                  ))}
                </div>
              ) : selectedLead.notes ? (
                <div className="p-3 bg-[#f8f9fa] rounded-xl border border-[#e7e9ee] text-xs text-[#101114]">
                  <span className="text-[10px] text-[#6b7280] block font-mono">Existing Note:</span>
                  {selectedLead.notes}
                </div>
              ) : (
                <div className="text-[11px] text-[#6b7280] italic">
                  No internal notes recorded for this lead yet.
                </div>
              )}

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add interaction note (e.g. Called customer, requested CAD floor plan)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
                <button
                  onClick={handleSaveLeadDetails}
                  disabled={savingNote}
                  className="px-4 py-2.5 bg-[#101114] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Send className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="pt-4 border-t border-[#e7e9ee] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6b7280] font-bold uppercase font-mono">Status:</span>
                <select
                  value={selectedLead.status || "NEW"}
                  onChange={(e) =>
                    handleStatusChange(selectedLead.id || selectedLead._id, e.target.value)
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
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2.5 bg-[#101114] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
