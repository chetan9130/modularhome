"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Search,
  Check,
  User,
  MapPin,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Review {
  id: string;
  customer_name: string;
  location?: string;
  rating: number;
  review_text: string;
  project_title?: string;
  image_url?: string;
  status: string;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    location: "",
    rating: 5,
    reviewText: "",
    projectTitle: "",
    imageUrl: "",
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 0,
  });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.success) {
        setReviews(json.data || []);
      }
    } catch (e) {
      console.error("Error loading reviews:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openCreateModal = () => {
    setEditingReview(null);
    setForm({
      customerName: "",
      location: "",
      rating: 5,
      reviewText: "",
      projectTitle: "",
      imageUrl: "",
      status: "PUBLISHED",
      isFeatured: true,
      displayOrder: reviews.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setForm({
      customerName: review.customer_name,
      location: review.location || "",
      rating: review.rating || 5,
      reviewText: review.review_text,
      projectTitle: review.project_title || "",
      imageUrl: review.image_url || "",
      status: review.status || "PUBLISHED",
      isFeatured: Boolean(review.is_featured),
      displayOrder: review.display_order || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingReview
        ? `/api/admin/reviews/${editingReview.id}`
        : "/api/admin/reviews";
      const method = editingReview ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        setModalOpen(false);
        await fetchReviews();
      } else {
        alert(json.error?.message || "Failed to save review.");
      }
    } catch {
      alert("Failed to save review.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(json.error?.message || "Failed to delete review.");
      }
    } catch {
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Reviews & Customer Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage verified homeowner ratings, testimonial quotes, and project build showcases displayed on the homepage and review carousels.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Testimonial</span>
        </button>
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span>Loading testimonials...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-xs">
          No customer reviews found. Click &quot;New Testimonial&quot; to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#fcb907]">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      rev.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <p className="text-xs text-[#101114] mt-3 font-medium leading-relaxed line-clamp-4 italic">
                  &ldquo;{rev.review_text}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#e7e9ee] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#101114]">{rev.customer_name}</h4>
                  <p className="text-[11px] text-[#6b7280] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#d97706]" />
                    <span>{rev.location || "USA"}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-2 rounded-xl text-[#6b7280] hover:text-[#b45309] hover:bg-amber-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id, rev.customer_name)}
                    className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-5 border border-[#e7e9ee] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-4">
              <h3 className="text-lg font-bold text-[#101114] font-serif">
                {editingReview ? "Edit Testimonial" : "Create Testimonial"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David & Sarah Jenkins"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Location / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Austin, Texas"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Project / Model Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Aspen Barndominium (2,400 SQ FT)"
                  value={form.projectTitle}
                  onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 text-[#fcb907] hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= form.rating ? "fill-current" : "stroke-current fill-transparent text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[#101114] ml-2">{form.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the customer's review feedback..."
                  value={form.reviewText}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                  />
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
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
