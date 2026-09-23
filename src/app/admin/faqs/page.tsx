"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Search,
  Filter,
} from "lucide-react";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  page_slug: string;
  status: string;
  display_order: number;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "General",
    pageSlug: "all",
    status: "PUBLISHED",
    displayOrder: 0,
  });

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/faqs", window.location.origin);
      if (selectedCategory !== "ALL") url.searchParams.set("category", selectedCategory);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data || []);
      }
    } catch (e) {
      console.error("Error loading FAQs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [selectedCategory]);

  const openCreateModal = () => {
    setEditingFaq(null);
    setForm({
      question: "",
      answer: "",
      category: "General",
      pageSlug: "all",
      status: "PUBLISHED",
      displayOrder: faqs.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "General",
      pageSlug: faq.page_slug || "all",
      status: faq.status || "PUBLISHED",
      displayOrder: faq.display_order || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingFaq
        ? `/api/admin/faqs/${editingFaq.id}`
        : "/api/admin/faqs";
      const method = editingFaq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        setModalOpen(false);
        await fetchFaqs();
      } else {
        alert(json.error?.message || "Failed to save FAQ.");
      }
    } catch {
      alert("Failed to save FAQ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, q: string) => {
    if (!confirm(`Delete FAQ: "${q.slice(0, 30)}..."?`)) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert(json.error?.message || "Failed to delete FAQ.");
      }
    } catch {
      alert("Failed to delete FAQ.");
    }
  };

  const categories = ["ALL", "General", "Delivery & Timeline", "Engineering & Materials", "Floor Plans & Store", "Financing & Costs"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage educational buyer questions, construction engineering FAQs, and pricing queries dynamically across the platform.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New FAQ</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#0f1218] text-white shadow-xs"
                : "bg-white border border-[#e7e9ee] text-[#6b7280] hover:border-[#fcb907] hover:text-[#101114]"
            }`}
          >
            {cat === "ALL" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span>Loading FAQs...</span>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-xs">
          No FAQs found for this category. Click &quot;New FAQ&quot; to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-[16px] border border-[#e7e9ee] p-5 shadow-xs hover:border-[#fcb907] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[10px] font-bold font-mono uppercase">
                    {faq.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      faq.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {faq.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#101114]">{faq.question}</h3>
                <p className="text-xs text-[#6b7280] leading-relaxed line-clamp-2 font-medium">
                  {faq.answer}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <button
                  onClick={() => openEditModal(faq)}
                  className="p-2 rounded-xl text-[#6b7280] hover:text-[#b45309] hover:bg-amber-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id, faq.question)}
                  className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-5 border border-[#e7e9ee] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-4">
              <h3 className="text-lg font-bold text-[#101114] font-serif">
                {editingFaq ? "Edit FAQ" : "Create New FAQ"}
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
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How long does factory construction take?"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide the comprehensive answer..."
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
                  >
                    <option value="General">General</option>
                    <option value="Delivery & Timeline">Delivery & Timeline</option>
                    <option value="Engineering & Materials">Engineering & Materials</option>
                    <option value="Floor Plans & Store">Floor Plans & Store</option>
                    <option value="Financing & Costs">Financing & Costs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
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
                  <span>Save FAQ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
