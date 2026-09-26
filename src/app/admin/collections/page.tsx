"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Search,
  RefreshCw,
  Layers,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    isFeatured: true,
    status: "PUBLISHED",
  });
  const [createError, setCreateError] = useState("");

  // Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDryRun, setIsDryRun] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/collections", window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setCollections(json.data || []);
      }
    } catch (e) {
      console.error("Error loading collections:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();

      if (json.success) {
        setCreateModalOpen(false);
        setCreateForm({
          name: "",
          slug: "",
          tagline: "",
          description: "",
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          isFeatured: true,
          status: "PUBLISHED",
        });
        await fetchCollections();
      } else {
        setCreateError(json.error?.message || "Failed to create collection.");
      }
    } catch (e: any) {
      setCreateError(e.message || "Network error.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportSubmit = async (overrideDryRun?: boolean) => {
    if (!selectedFile) return;

    const dryRunValue = overrideDryRun !== undefined ? overrideDryRun : isDryRun;
    setIsImporting(true);
    setImportError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("isDryRun", String(dryRunValue));
      formData.append("syncRelationships", "true");

      const res = await fetch("/api/admin/collections/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to process Matrixify collections import.");
      }

      setImportResult(json);
      if (!dryRunValue) {
        await fetchCollections();
      }
    } catch (err: any) {
      setImportError(err.message || "Network error during import.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCollections((prev) => prev.filter((c) => (c._id || c.id) !== id));
      } else {
        alert(json.error?.message || "Failed to delete collection.");
      }
    } catch (e) {
      alert("Failed to delete collection.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Collection & Series Management
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Organize steel modular models into curated architectural series, themes, and promotional lines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setImportModalOpen(true);
              setImportResult(null);
              setImportError("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#d5d9e0] hover:bg-[#f8f9fa] text-[#101114] text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#d97706]" />
            <span>Import Matrixify CSV / Excel</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search collections by title or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#d5d9e0] rounded-xl text-xs text-[#101114] placeholder-[#6b7280] font-medium focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
          />
        </div>
        <button
          onClick={fetchCollections}
          className="p-2.5 bg-white border border-[#d5d9e0] rounded-xl text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] transition-colors"
          title="Refresh collections"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
          <span>Loading collections...</span>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-[0_12px_35px_rgba(16,24,40,0.04)]">
          No collections found. Click &quot;New Collection&quot; or &quot;Import Matrixify CSV / Excel&quot; to import your catalogue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((coll) => {
            const collId = coll._id || coll.id;
            return (
              <div
                key={collId}
                className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] overflow-hidden flex flex-col group hover:shadow-[0_18px_45px_rgba(16,24,40,0.08)] hover:border-[#fcb907] transition-all duration-200"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/10] w-full bg-[#f8f9fa] overflow-hidden">
                  {coll.image ? (
                    <Image
                      src={coll.image}
                      alt={coll.name || coll.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6b7280]">
                      <FolderOpen className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold font-mono">
                      {coll.productCount !== undefined ? coll.productCount : (coll.productIds?.length || 0)} Models
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#101114] font-serif line-clamp-1">{coll.name || coll.title}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          coll.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {coll.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#6b7280] mt-0.5">/{coll.slug || coll.handle}</p>
                    {coll.tagline && (
                      <p className="text-xs text-[#6b7280] mt-2 line-clamp-2 font-medium">{coll.tagline}</p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-[#e7e9ee] flex items-center justify-between">
                    <Link
                      href={`/admin/collections/${collId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b45309] hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit & Assign Models</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(collId, coll.name || coll.title)}
                      className="p-2 rounded-xl text-[#6b7280] hover:text-[#d97706] hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#e7e9ee] animate-in zoom-in-95 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#b45309] border border-amber-200 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101114] font-serif">
                    Import Matrixify / Shopify Collections
                  </h3>
                  <p className="text-xs text-[#6b7280] font-medium">
                    Upload your source Matrixify export (.xlsx or .csv) with automatic column classification.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#101114] hover:bg-[#f8f9fa] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {importError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{importError}</span>
              </div>
            )}

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                selectedFile ? "border-emerald-500 bg-emerald-50/30" : "border-[#d5d9e0] hover:border-[#fcb907] bg-[#f8f9fa]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setImportResult(null);
                  }
                }}
              />
              <UploadCloud className="w-10 h-10 mx-auto text-[#6b7280] mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-[#101114]">{selectedFile.name}</p>
                  <p className="text-[11px] text-[#6b7280] mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Click to choose different file</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-[#101114]">Click to upload or drag & drop</p>
                  <p className="text-[11px] text-[#6b7280] mt-1">Matrixify Collections.xlsx or Collections.csv (Supports 45+ source columns)</p>
                </div>
              )}
            </div>

            {/* Mode selection */}
            <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl border border-[#e7e9ee] text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#101114]">Dry Run Validation Mode</span>
                <p className="text-[11px] text-[#6b7280]">Validates headers and mapping without modifying the database.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#fcb907]"></div>
              </label>
            </div>

            {/* Import Summary Results */}
            {importResult && (
              <div className="space-y-4 animate-in fade-in p-5 rounded-2xl bg-[#0b0d11] text-gray-200 border border-white/10 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">
                      {importResult.isDryRun ? "Dry Run Validation Succeeded" : "Live Import Completed"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {((importResult.summary?.durationMs || 0) / 1000).toFixed(2)}s
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xl font-bold text-white">{importResult.summary?.sourceRowCount || 0}</div>
                    <div className="text-[9px] text-gray-400 uppercase">Source Rows</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xl font-bold text-amber-400">{importResult.summary?.uniqueCollectionCount || 0}</div>
                    <div className="text-[9px] text-gray-400 uppercase">Collections</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xl font-bold text-emerald-400">{importResult.summary?.validCollectionCount || 0}</div>
                    <div className="text-[9px] text-gray-400 uppercase">Valid</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <div className="text-xl font-bold text-indigo-400">{importResult.summary?.totalProductLinksFound || 0}</div>
                    <div className="text-[9px] text-gray-400 uppercase">Product Links</div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-300 space-y-1 pt-2 border-t border-white/10">
                  <p>• Header Recognition: <span className="text-emerald-300 font-bold">{importResult.headerAnalysis?.isMatrixifyFormat ? "✓ Matrixify Standard Schema Detected" : "Generic Schema"}</span></p>
                  <p>• Automated Smart Rules Preserved: <span className="text-amber-300 font-bold">{importResult.summary?.totalRulesPreserved || 0}</span></p>
                  <p>• Rejected Rows: <span className="text-white font-bold">{importResult.summary?.rejectedCount || 0}</span></p>
                </div>

                {importResult.isDryRun && (
                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => handleImportSubmit(false)}
                      className="w-full py-3 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      <span>Proceed to Live Supabase Import</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#e7e9ee]">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-[#101114] font-bold hover:bg-[#f8f9fa] border border-[#d5d9e0] cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleImportSubmit()}
                disabled={!selectedFile || isImporting}
                className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs text-xs"
              >
                {isImporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDryRun ? "Execute Dry Run" : "Execute Live Import"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#e7e9ee] animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
              <h3 className="text-base font-bold text-[#101114] font-serif">
                Create New Collection
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

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setCreateForm({ ...createForm, name, slug });
                  }}
                  placeholder="e.g. Modern Minimalist Series"
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
                  placeholder="modern-minimalist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] font-mono text-[11px] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={createForm.tagline}
                  onChange={(e) => setCreateForm({ ...createForm, tagline: e.target.value })}
                  placeholder="e.g. Clean architectural lines with panoramic glass walls."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101114] mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={createForm.image}
                  onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
                />
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
                  <span>Create Collection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
