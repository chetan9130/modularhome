"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Filter,
  Loader2,
  ExternalLink,
  FileText,
  Download,
  X,
  Plus,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface MediaAsset {
  id: string;
  filename: string;
  file_path: string;
  public_url: string;
  mime_type: string;
  file_size?: number;
  width?: number;
  height?: number;
  alt_text?: string;
  created_at?: string;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customFilename, setCustomFilename] = useState("");
  const [customAltText, setCustomAltText] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/media", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (selectedFilter !== "ALL") url.searchParams.set("mimeType", selectedFilter);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setAssets(json.data || []);
      }
    } catch (e) {
      console.error("Error loading media:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [selectedFilter]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from media library?`)) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        if (selectedAsset?.id === id) setSelectedAsset(null);
      } else {
        alert(json.error?.message || "Failed to delete asset.");
      }
    } catch {
      alert("Failed to delete media asset.");
    }
  };

  const handleRegisterAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;
    setIsRegistering(true);

    try {
      const finalName = customFilename.trim() || customUrl.split("/").pop() || "media-asset.jpg";
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: finalName,
          publicUrl: customUrl,
          altText: customAltText || finalName,
          mimeType: customUrl.endsWith(".pdf") ? "application/pdf" : customUrl.endsWith(".dwg") ? "application/acad" : "image/jpeg",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setUploadModalOpen(false);
        setCustomUrl("");
        setCustomFilename("");
        setCustomAltText("");
        await fetchAssets();
      } else {
        alert(json.error?.message || "Failed to register asset.");
      }
    } catch {
      alert("Failed to register asset.");
    } finally {
      setIsRegistering(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Centralized Media Library
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Manage high-resolution architectural photography, floor plan blueprints, and website assets in one central repository.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[18px] border border-[#e7e9ee] shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search filenames, alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchAssets()}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
          />
        </div>

        {/* MIME Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All Media" },
            { id: "image", label: "Photos & Renders" },
            { id: "pdf", label: "PDF Blueprints" },
            { id: "acad", label: "CAD DWG Files" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-[#0f1218] text-white"
                  : "bg-gray-100 text-[#6b7280] hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span>Loading media assets...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-[0_12px_35px_rgba(16,24,40,0.04)]">
          <ImageIcon className="w-12 h-12 text-[#6b7280]/40 mx-auto mb-3" />
          <p className="font-bold text-sm text-[#101114]">No media assets found</p>
          <p className="mt-1">Click &quot;Upload Asset&quot; to add your first photo, CAD package, or PDF blueprint.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => {
            const isImage = asset.mime_type?.startsWith("image") || asset.public_url.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i);
            const isCopied = copiedId === asset.id;

            return (
              <div
                key={asset.id}
                className="group relative bg-white rounded-[16px] border border-[#e7e9ee] overflow-hidden shadow-xs hover:shadow-md hover:border-[#fcb907] transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Container */}
                <div
                  onClick={() => setSelectedAsset(asset)}
                  className="relative aspect-square w-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {isImage ? (
                    <Image
                      src={asset.public_url}
                      alt={asset.alt_text || asset.filename}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[#6b7280] p-4 text-center">
                      <FileText className="w-10 h-10 text-[#d97706] mb-1" />
                      <span className="text-[10px] font-mono font-bold uppercase truncate max-w-full">
                        {asset.filename.split(".").pop()}
                      </span>
                    </div>
                  )}

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(asset.public_url, asset.id);
                      }}
                      className="p-2 rounded-lg bg-white/90 hover:bg-white text-[#101114] shadow-sm transition-all hover:scale-110"
                      title="Copy Public URL"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id, asset.filename);
                      }}
                      className="p-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm transition-all hover:scale-110"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-3 border-t border-[#e7e9ee] bg-white">
                  <p className="text-xs font-bold text-[#101114] truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#6b7280] font-mono mt-1">
                    <span>{formatFileSize(asset.file_size)}</span>
                    {isCopied && <span className="text-emerald-600 font-bold">Copied!</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Asset Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-5 border border-[#e7e9ee] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-4">
              <h3 className="text-lg font-bold text-[#101114] font-serif flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#d97706]" />
                <span>Upload & Register Media</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6b7280] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-2">
                  Upload via Image Dropper / Cloud File
                </label>
                <ImageUpload
                  value={customUrl}
                  onChange={(url) => {
                    setCustomUrl(url);
                    if (!customFilename && url) {
                      setCustomFilename(url.split("/").pop() || "uploaded-asset.jpg");
                    }
                  }}
                  label="Drop asset or upload file"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Public URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or /media/image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Filename / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. aspen-modular-elevation.jpg"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                  Alt Text & SEO Description
                </label>
                <input
                  type="text"
                  placeholder="Architectural steel frame structure..."
                  value={customAltText}
                  onChange={(e) => setCustomAltText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e7e9ee]">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#e7e9ee] text-xs font-bold text-[#6b7280] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegistering || !customUrl}
                  className="px-5 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isRegistering && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Library</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Detail Preview Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-2xl w-full overflow-hidden border border-[#e7e9ee] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="h-72 sm:h-96 relative bg-[#0b0d11] flex items-center justify-center">
              {selectedAsset.mime_type?.startsWith("image") || selectedAsset.public_url.match(/\.(jpg|jpeg|png|webp|avif)$/i) ? (
                <Image
                  src={selectedAsset.public_url}
                  alt={selectedAsset.alt_text || selectedAsset.filename}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="text-center text-white p-6">
                  <FileText className="w-16 h-16 text-[#fcb907] mx-auto mb-2" />
                  <p className="font-bold text-base">{selectedAsset.filename}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#101114] font-serif">{selectedAsset.filename}</h3>
                  <p className="text-xs text-[#6b7280] mt-0.5">{selectedAsset.alt_text || "No alt text assigned"}</p>
                </div>
                <button
                  onClick={() => handleCopy(selectedAsset.public_url, selectedAsset.id)}
                  className="px-4 py-2 rounded-xl bg-[#0f1218] hover:bg-[#fcb907] text-white hover:text-[#101114] text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedId === selectedAsset.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selectedAsset.id ? "Copied!" : "Copy URL"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#e7e9ee] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[#6b7280]">
                  <span>MIME Type:</span>
                  <span className="text-[#101114] font-bold">{selectedAsset.mime_type}</span>
                </div>
                <div className="flex justify-between text-[#6b7280]">
                  <span>File Size:</span>
                  <span className="text-[#101114] font-bold">{formatFileSize(selectedAsset.file_size)}</span>
                </div>
                <div className="flex justify-between text-[#6b7280] truncate">
                  <span>URL:</span>
                  <a href={selectedAsset.public_url} target="_blank" rel="noreferrer" className="text-[#d97706] hover:underline flex items-center gap-1">
                    <span>{selectedAsset.public_url.slice(0, 35)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
