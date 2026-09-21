"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Layers,
  Plus,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  ImageIcon,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

function SectionsManager() {
  const searchParams = useSearchParams();
  const initialPageId = searchParams.get("pageId") || "";

  const [pages, setPages] = useState<any[]>([]);
  const [selectedPageId, setSelectedPageId] = useState(initialPageId);
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add / Edit Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSection, setNewSection] = useState({
    type: "HERO",
    title: "",
    subtitle: "",
    content: "",
    image: "",
    isVisible: true,
  });

  const SECTION_TYPES = [
    { value: "HERO", label: "Hero Banner" },
    { value: "TRUST", label: "Trust & Benefits Bar" },
    { value: "PRODUCT_GRID", label: "Products / Models Showcase" },
    { value: "COLLECTION_GRID", label: "Categories / Collections Grid" },
    { value: "HOW_IT_WORKS", label: "How It Works (Steps)" },
    { value: "FINANCING", label: "Financing & Payment Calculator" },
    { value: "VIDEO", label: "Video Gallery Section" },
    { value: "TESTIMONIALS", label: "Customer Testimonials" },
    { value: "FAQ", label: "Frequently Asked Questions" },
    { value: "GALLERY", label: "Image Gallery Carousel" },
    { value: "CTA", label: "Call To Action Banner" },
    { value: "RICH_CONTENT", label: "Rich Text / Narrative" },
  ];

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const json = await res.json();
      if (json.success && json.data) {
        setPages(json.data);
        if (!selectedPageId && json.data.length > 0) {
          setSelectedPageId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error("Error fetching pages:", e);
    }
  };

  const fetchSections = async (pageId: string) => {
    if (!pageId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sections?pageId=${pageId}`);
      const json = await res.json();
      if (json.success) {
        setSections(json.data || []);
      }
    } catch (e) {
      console.error("Error fetching sections:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      fetchSections(selectedPageId);
    }
  }, [selectedPageId]);

  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleVisibility",
          sectionId: id,
          isVisible: !currentVisible,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSections((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isVisible: !currentVisible } : s))
        );
      }
    } catch (e) {
      alert("Failed to toggle visibility.");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    const reordered = newSections.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }));

    setSections(newSections.map((item, idx) => ({ ...item, order: idx + 1 })));

    try {
      await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          reorderedItems: reordered,
        }),
      });
    } catch (e) {
      alert("Failed to save section order.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      const res = await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setSections((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      alert("Failed to delete section.");
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageId) return;
    setIsAdding(true);

    try {
      let finalContent = newSection.content;
      if (newSection.image) {
        try {
          const parsed = newSection.content ? JSON.parse(newSection.content) : {};
          parsed.image = newSection.image;
          finalContent = JSON.stringify(parsed);
        } catch {
          finalContent = JSON.stringify({ image: newSection.image, rawText: newSection.content });
        }
      }

      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPageId,
          type: newSection.type,
          title: newSection.title,
          subtitle: newSection.subtitle,
          content: finalContent,
          isVisible: newSection.isVisible,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setAddModalOpen(false);
        setNewSection({
          type: "HERO",
          title: "",
          subtitle: "",
          content: "",
          image: "",
          isVisible: true,
        });
        await fetchSections(selectedPageId);
      } else {
        alert(json.error?.message || "Failed to add section.");
      }
    } catch (e: any) {
      alert(e.message || "Network error.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    setIsAdding(true);

    try {
      let finalContent = editingSection.content;
      if (editingSection.image) {
        try {
          const parsed = editingSection.content ? JSON.parse(editingSection.content) : {};
          parsed.image = editingSection.image;
          finalContent = JSON.stringify(parsed);
        } catch {
          finalContent = JSON.stringify({ image: editingSection.image, rawText: editingSection.content });
        }
      }

      const secId = editingSection.id || editingSection._id;
      const res = await fetch(`/api/admin/sections/${secId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editingSection.type,
          title: editingSection.title,
          subtitle: editingSection.subtitle,
          content: finalContent,
          isVisible: editingSection.isVisible ?? editingSection.is_visible,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setEditingSection(null);
        await fetchSections(selectedPageId);
      } else {
        alert(json.error?.message || "Failed to update section.");
      }
    } catch (e: any) {
      alert(e.message || "Network error.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Page Section & Block Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Reorder, toggle visibility, and configure dynamic content modules on your pages.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          disabled={!selectedPageId}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Page Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#101114] uppercase tracking-wider font-mono">Select Page:</span>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] cursor-pointer"
          >
            {pages.map((p) => (
              <option key={p.id || p._id} value={p.id || p._id}>
                {p.title} (/{p.slug === "home" ? "" : p.slug})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#6b7280] font-medium">
          Configured: <span className="font-bold text-[#101114]">{sections.length} sections</span>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
            <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
            <span>Loading sections...</span>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-20 text-center text-[#6b7280] text-xs font-medium">
            No sections configured for this page yet. Click &quot;Add Section&quot; above to create one.
          </div>
        ) : (
          <div className="divide-y divide-[#e7e9ee]">
            {sections.map((sec, idx) => (
              <div
                key={sec.id || sec._id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                  sec.isVisible ? "hover:bg-[#f8f9fa]/70" : "bg-[#f8f9fa]/40 opacity-60"
                }`}
              >
                {/* Left: Reorder arrows + Order badge + Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded-lg text-[#6b7280] hover:text-[#101114] disabled:opacity-20 hover:bg-[#e7e9ee] transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded-lg text-[#6b7280] hover:text-[#101114] disabled:opacity-20 hover:bg-[#e7e9ee] transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#f8f9fa] border border-[#d5d9e0] font-mono text-xs font-bold flex items-center justify-center text-[#101114] shrink-0">
                    {sec.order}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#101114] text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                        {sec.type}
                      </span>
                      <span className="font-bold text-xs text-[#101114] truncate font-sans">
                        {sec.title || "(Untitled Section)"}
                      </span>
                    </div>
                    {sec.subtitle && (
                      <p className="text-[11px] text-[#6b7280] truncate mt-0.5">
                        {sec.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      let img = "";
                      try {
                        const parsed = typeof sec.content === "string" ? JSON.parse(sec.content) : sec.content;
                        img = parsed?.image || "";
                      } catch {}
                      setEditingSection({
                        ...sec,
                        image: img,
                        type: sec.type,
                        title: sec.title || "",
                        subtitle: sec.subtitle || "",
                        content: typeof sec.content === "string" ? sec.content : JSON.stringify(sec.content, null, 2),
                      });
                    }}
                    className="p-2 rounded-xl text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] border border-transparent hover:border-[#d5d9e0] transition-colors cursor-pointer"
                    title="Edit Section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleVisibility(sec.id || sec._id, sec.isVisible)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      sec.isVisible
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-[#f8f9fa] text-[#6b7280] border border-[#d5d9e0] hover:bg-[#e7e9ee]"
                    }`}
                  >
                    {sec.isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-[#6b7280]" />}
                    <span>{sec.isVisible ? "Visible" : "Hidden"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(sec.id || sec._id)}
                    className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e7e9ee] animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
              <h3 className="text-base font-serif font-bold text-[#101114]">
                Add Section to Page
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-xl text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Section Type *</label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] cursor-pointer"
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Heading / Title</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g. Precision Engineered for Unmatched Strength"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={newSection.subtitle}
                  onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                  placeholder="e.g. Factory-built architectural excellence delivered nationwide."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <ImageUpload
                label="Section Visual Asset / Banner Image"
                value={newSection.image}
                onChange={(url) => setNewSection({ ...newSection, image: url })}
                folder="sections"
                aspectRatio="16/10"
                helperText="Upload background banner or feature image for this section."
              />

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Config Content (JSON / Text)</label>
                <textarea
                  rows={3}
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Enter JSON config payload or additional body copy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] font-mono text-[11px] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[#101114] font-bold hover:bg-[#f8f9fa] border border-[#d5d9e0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Section</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e7e9ee] animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
              <h3 className="text-base font-serif font-bold text-[#101114]">
                Edit Section: {editingSection.title || editingSection.type}
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="p-1.5 rounded-xl text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSection} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Section Type *</label>
                <select
                  value={editingSection.type}
                  onChange={(e) => setEditingSection({ ...editingSection, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] cursor-pointer"
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Heading / Title</label>
                <input
                  type="text"
                  value={editingSection.title || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Subtitle</label>
                <input
                  type="text"
                  value={editingSection.subtitle || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <ImageUpload
                label="Section Visual Asset / Banner Image"
                value={editingSection.image || ""}
                onChange={(url) => setEditingSection({ ...editingSection, image: url })}
                folder="sections"
                aspectRatio="16/10"
                helperText="Upload background banner or feature image for this section."
              />

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Config Content (JSON / Text)</label>
                <textarea
                  rows={4}
                  value={editingSection.content || ""}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] font-mono text-[11px] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2.5 rounded-xl text-[#101114] font-bold hover:bg-[#f8f9fa] border border-[#d5d9e0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSectionsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[#6b7280] text-xs">Loading sections manager...</div>}>
      <SectionsManager />
    </Suspense>
  );
}
