"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Save,
  ArrowLeft,
  Search,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.id as string;

  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      const json = await res.json();
      if (json.success) {
        setPage(json.data);
      } else {
        setMessage({ type: "error", text: "Page not found." });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Error loading page details." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) fetchPage();
  }, [pageId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Page updated successfully!" });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to update page." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-[#d97706]" />
        <span>Loading page data...</span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-gray-600">Page not found.</p>
        <Link href="/admin/pages" className="text-xs font-bold text-[#d97706] mt-2 inline-block">
          ← Back to Pages
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2.5 rounded-xl border border-[#d5d9e0] bg-white text-[#101114] hover:bg-[#f6f7f9] transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#101114] tracking-tight">
              Edit Page: {page.title}
            </h1>
            <p className="text-xs text-[#6b7280] font-mono mt-0.5">
              Route: /{page.slug === "home" ? "" : page.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={`/${page.slug === "home" ? "" : page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-[#b45309] hover:bg-amber-100 text-xs font-bold transition-all shadow-2xs"
            title="Open live page in a new browser tab"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Live Page</span>
          </a>
          <Link
            href={`/admin/sections?pageId=${page.id || page._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#d5d9e0] bg-white text-[#101114] hover:bg-[#f6f7f9] text-xs font-bold transition-all shadow-2xs"
          >
            <Layers className="w-4 h-4 text-[#d97706]" />
            <span>Manage Sections ({page.sections?.length || 0})</span>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#d97706] shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Page Core Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#101114] border-b border-[#e7e9ee] pb-3">
              Page Content & Identification
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Page Title *</label>
              <input
                type="text"
                required
                value={page.title || ""}
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Slug / URL Path *</label>
              <input
                type="text"
                required
                value={page.slug || ""}
                onChange={(e) => setPage({ ...page, slug: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs font-mono text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Subtitle</label>
              <input
                type="text"
                value={page.subtitle || ""}
                onChange={(e) => setPage({ ...page, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Body Content (HTML / Markdown)</label>
              <textarea
                rows={8}
                value={page.content || ""}
                onChange={(e) => setPage({ ...page, content: e.target.value })}
                placeholder="Enter rich text or narrative content for this page..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs font-mono text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#101114] border-b border-[#e7e9ee] pb-3">
              <Search className="w-4 h-4 text-[#d97706]" />
              <span>Search Engine Optimization (SEO)</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#101114]">SEO Title</label>
                <span className={`text-[10px] ${page.seoTitle?.length > 60 ? "text-amber-600 font-bold" : "text-[#6b7280]"}`}>
                  {page.seoTitle?.length || 0} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={page.seoTitle || ""}
                onChange={(e) => setPage({ ...page, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#101114]">Meta Description</label>
                <span className={`text-[10px] ${page.metaDescription?.length > 160 ? "text-amber-600 font-bold" : "text-[#6b7280]"}`}>
                  {page.metaDescription?.length || 0} / 160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={page.metaDescription || ""}
                onChange={(e) => setPage({ ...page, metaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Canonical URL</label>
              <input
                type="text"
                value={page.canonicalUrl || ""}
                onChange={(e) => setPage({ ...page, canonicalUrl: e.target.value })}
                placeholder="https://modularhome.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Status & Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#101114] border-b border-[#e7e9ee] pb-3">
              Page Status & Visibility
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Status</label>
              <select
                value={page.status || "PUBLISHED"}
                onChange={(e) => setPage({ ...page, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] cursor-pointer"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <ImageUpload
              label="Featured Hero Image"
              value={page.featuredImage || ""}
              onChange={(url) => setPage({ ...page, featuredImage: url })}
              folder="pages"
              aspectRatio="16/10"
              helperText="Banner image for custom page hero header."
            />

            <div className="pt-3 border-t border-[#e7e9ee] text-[11px] text-[#6b7280] space-y-1">
              <div>Created: {page.createdAt ? new Date(page.createdAt).toLocaleString() : "N/A"}</div>
              <div>Last Modified: {page.updatedAt ? new Date(page.updatedAt).toLocaleString() : "N/A"}</div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
