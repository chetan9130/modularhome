"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    status: "PUBLISHED",
    seoTitle: "",
    metaDescription: "",
  });
  const [createError, setCreateError] = useState("");

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/pages", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setPages(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching pages:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPages();
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();

      if (json.success) {
        setCreateModalOpen(false);
        setCreateForm({
          title: "",
          slug: "",
          subtitle: "",
          status: "PUBLISHED",
          seoTitle: "",
          metaDescription: "",
        });
        await fetchPages();
      } else {
        setCreateError(json.error?.message || "Failed to create page.");
      }
    } catch (e: any) {
      setCreateError(e.message || "Network error.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the page "${title}"? This will also remove its configured sections.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await fetchPages();
      } else {
        alert(json.error?.message || "Failed to delete page.");
      }
    } catch (e) {
      alert("Failed to delete page.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Page Manager & Route CMS
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Create, edit, and configure site-wide landing pages, dynamic routes, and modular layout sections.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
          <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#101114] font-bold uppercase tracking-wider font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading pages...</span>
          </div>
        ) : pages.length === 0 ? (
          <div className="py-20 text-center text-[#6b7280] text-xs font-medium">
            No pages found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[750px]">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#e7e9ee] text-[#6b7280] font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-4 px-5">Page Title</th>
                  <th className="py-4 px-5">Slug / Route</th>
                  <th className="py-4 px-5">Modular Sections</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Last Updated</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e9ee]">
                {pages.map((page) => {
                  const pageId = page._id || page.id;
                  return (
                    <tr key={pageId} className="hover:bg-[#f8f9fa]/70 transition-colors">
                      <td className="py-4 px-5 font-bold text-[#101114]">
                        <span className="text-sm font-serif">{page.title}</span>
                        {page.subtitle && (
                          <span className="block text-[11px] font-normal text-[#6b7280] truncate max-w-xs font-sans mt-0.5">
                            {page.subtitle}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono text-[#6b7280] text-[11px]">
                        /{page.slug === "home" ? "" : page.slug}
                      </td>
                      <td className="py-4 px-5">
                        <Link
                          href={`/admin/sections?pageId=${pageId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-[#b45309] border border-amber-200 font-bold hover:bg-amber-100 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{page.sectionCount || page._count?.sections || 0} Sections</span>
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            page.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : page.status === "DRAFT"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#6b7280] text-[11px] font-medium whitespace-nowrap">
                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "Recent"}
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Link
                          href={`/admin/pages/${pageId}`}
                          className="p-2 rounded-xl text-[#101114] hover:bg-white hover:border-[#d5d9e0] border border-transparent inline-block transition-all shadow-2xs"
                          title="Edit Page & SEO"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeletePage(pageId, page.title)}
                          className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 border border-transparent hover:border-red-200 inline-block transition-all cursor-pointer"
                          title="Delete Page"
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

      {/* Create Page Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e7e9ee] animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
              <h3 className="text-base font-bold text-[#101114] font-serif">
                Create New Page
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Page Title *</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setCreateForm({ ...createForm, title, slug, seoTitle: `${title} | ModularHome.com` });
                  }}
                  placeholder="e.g. Precision Engineering Guide"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Slug / URL Path *</label>
                <input
                  type="text"
                  required
                  value={createForm.slug}
                  onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  placeholder="e.g. engineering-guide"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-mono text-[11px] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={createForm.subtitle}
                  onChange={(e) => setCreateForm({ ...createForm, subtitle: e.target.value })}
                  placeholder="Brief descriptive subtitle"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Publish Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[#101114] font-bold hover:bg-[#f8f9fa] border border-[#d5d9e0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Page</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
