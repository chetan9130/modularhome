"use client";

import { useState, useEffect } from "react";
import {
  CornerDownRight,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Check,
  AlertCircle,
} from "lucide-react";

interface RedirectRule {
  id: string;
  source_path: string;
  target_path: string;
  status_code: number;
  is_active: boolean;
  notes?: string;
  created_at?: string;
}

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RedirectRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    sourcePath: "",
    targetPath: "",
    statusCode: 301,
    isActive: true,
    notes: "",
  });

  const fetchRedirects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/redirects");
      const json = await res.json();
      if (json.success) {
        setRedirects(json.data || []);
      }
    } catch (e) {
      console.error("Error loading redirects:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRedirects();
  }, []);

  const openCreateModal = () => {
    setEditingRedirect(null);
    setForm({
      sourcePath: "",
      targetPath: "",
      statusCode: 301,
      isActive: true,
      notes: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (rule: RedirectRule) => {
    setEditingRedirect(rule);
    setForm({
      sourcePath: rule.source_path,
      targetPath: rule.target_path,
      statusCode: rule.status_code || 301,
      isActive: rule.is_active,
      notes: rule.notes || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingRedirect
        ? `/api/admin/redirects/${editingRedirect.id}`
        : "/api/admin/redirects";
      const method = editingRedirect ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        setModalOpen(false);
        await fetchRedirects();
      } else {
        alert(json.error?.message || "Failed to save redirect rule.");
      }
    } catch {
      alert("Failed to save redirect rule.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, src: string) => {
    if (!confirm(`Delete redirect rule for "${src}"?`)) return;

    try {
      const res = await fetch(`/api/admin/redirects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setRedirects((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(json.error?.message || "Failed to delete redirect.");
      }
    } catch {
      alert("Failed to delete redirect.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            301 SEO URL Redirects
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage permanent 301 and 302 URL redirects from old Shopify URLs to preserve search engine rankings and prevent 404 errors.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Redirect</span>
        </button>
      </div>

      {/* Redirects Table */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span>Loading redirect rules...</span>
        </div>
      ) : redirects.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-xs">
          No redirects configured. Click &quot;New Redirect&quot; to add a 301 rule.
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e7e9ee] text-[#6b7280] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Source Path (Old URL)</th>
                  <th className="py-3.5 px-5">Target Destination</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Active</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-[#fcfcfd] transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-[#101114]">
                      {r.source_path}
                    </td>
                    <td className="py-4 px-5 font-mono text-[#d97706] font-medium">
                      {r.target_path}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px]">
                        {r.status_code || 301}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          r.is_active
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#b45309] hover:bg-amber-50 transition-colors"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.source_path)}
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-5 border border-[#e7e9ee] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-4">
              <h3 className="text-lg font-bold text-[#101114] font-serif">
                {editingRedirect ? "Edit Redirect Rule" : "Create Redirect Rule"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Source Path (From) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /products/the-ridgeview-cabin"
                  value={form.sourcePath}
                  onChange={(e) => setForm({ ...form, sourcePath: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Target Destination (To) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /buildings/the-ridgeview"
                  value={form.targetPath}
                  onChange={(e) => setForm({ ...form, targetPath: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    HTTP Status Code
                  </label>
                  <select
                    value={form.statusCode}
                    onChange={(e) => setForm({ ...form, statusCode: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
                  >
                    <option value={301}>301 (Permanent Redirect)</option>
                    <option value={302}>302 (Temporary Redirect)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Rule State
                  </label>
                  <select
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
                  >
                    <option value="true">Active (Enabled)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Internal Notes / Migration Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. Migrated from Shopify products export"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e7e9ee] text-xs font-bold text-[#6b7280] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Redirect</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
