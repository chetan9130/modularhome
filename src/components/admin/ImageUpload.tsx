"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  helperText?: string;
  aspectRatio?: "16/9" | "16/10" | "4/3" | "1/1" | "banner" | "auto" | "logo";
  accept?: string;
  placeholder?: string;
  className?: string;
  compact?: boolean;
}

export default function ImageUpload({
  value = "",
  onChange,
  folder = "uploads",
  label,
  helperText,
  aspectRatio = "16/10",
  accept = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml",
  placeholder = "Upload image or enter URL...",
  className = "",
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCompact = compact || aspectRatio === "logo" || aspectRatio === "1/1";

  // Aspect ratio and styling for preview container (when image is uploaded)
  const getPreviewContainerClasses = () => {
    switch (aspectRatio) {
      case "logo":
        return "h-24 sm:h-28 w-full bg-[#f8f9fa] border border-[#e7e9ee]";
      case "1/1":
        return "h-28 w-28 sm:h-32 sm:w-32 mx-auto aspect-square bg-[#f8f9fa] border border-[#e7e9ee]";
      case "banner":
        return "aspect-[21/9] w-full bg-stone-900 border border-[#d5d9e0]";
      case "4/3":
        return "aspect-[4/3] w-full bg-stone-900 border border-[#d5d9e0]";
      case "16/9":
        return "aspect-video w-full bg-stone-900 border border-[#d5d9e0]";
      case "auto":
        return "min-h-[140px] max-h-[260px] w-full bg-stone-900 border border-[#d5d9e0]";
      case "16/10":
      default:
        return "aspect-[16/10] w-full bg-stone-900 border border-[#d5d9e0]";
    }
  };

  const getImageClasses = () => {
    if (aspectRatio === "logo") {
      return "object-contain p-3";
    }
    if (aspectRatio === "1/1") {
      return "object-contain p-2";
    }
    if (aspectRatio === "auto") {
      return "object-contain p-2";
    }
    return "object-cover transition-transform duration-500 group-hover:scale-105";
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload file to storage.");
      }

      onChange(data.url);
      setManualUrl(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleManualApply = () => {
    onChange(manualUrl.trim());
    setShowUrlInput(false);
  };

  const handleClear = () => {
    onChange("");
    setManualUrl("");
  };

  const isPdfOrZip = value?.toLowerCase().endsWith(".pdf") || value?.toLowerCase().endsWith(".zip");

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label className="block text-xs font-bold text-[#101114] truncate">{label}</label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-semibold text-[#d97706] hover:text-[#b45309] hover:underline transition-colors shrink-0"
          >
            {showUrlInput ? "Hide URL Field" : "Paste Direct URL"}
          </button>
        </div>
      )}

      {/* Manual URL Input dropdown / toggle */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-[#f6f7f9] rounded-xl border border-[#d5d9e0] animate-in fade-in duration-200">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-[#e7e9ee] text-xs text-[#101114] font-medium focus:outline-none focus:ring-1 focus:ring-[#fcb907]"
          />
          <button
            type="button"
            onClick={handleManualApply}
            className="px-3 py-1.5 bg-[#101114] hover:bg-[#23252a] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      )}

      {/* Error alert if upload failed */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-500 hover:text-red-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        accept={accept}
        className="hidden"
      />

      {value ? (
        /* Image Preview Container */
        <div className={`relative rounded-2xl overflow-hidden group shadow-2xs ${getPreviewContainerClasses()}`}>
          {isPdfOrZip ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-stone-900 text-stone-300 gap-2">
              <FileText className="w-8 h-8 text-[#fcb907]" />
              <span className="text-xs font-bold truncate max-w-full px-4">{value.split("/").pop()}</span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#fcb907] hover:underline flex items-center gap-1"
              >
                <span>Download / View File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <Image
              src={value}
              alt="Uploaded asset preview"
              fill
              unoptimized
              className={getImageClasses()}
            />
          )}

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/95 hover:bg-white text-[#101114] rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 hover:scale-105 cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-[#d97706]" />
              )}
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Upload Indicator */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 text-white">
              <Loader2 className="w-7 h-7 animate-spin text-[#fcb907]" />
              <span className="text-xs font-bold tracking-wide">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 overflow-hidden ${
            isCompact ? "p-3.5 min-h-[105px]" : "p-5 min-h-[125px]"
          } ${
            isDragging
              ? "border-[#fcb907] bg-amber-50/50 scale-[1.01]"
              : "border-[#d5d9e0] hover:border-[#fcb907] bg-[#f9fafb] hover:bg-white"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-[#6b7280]">
              <Loader2 className="w-6 h-6 animate-spin text-[#d97706]" />
              <div className="text-xs font-bold text-[#101114]">Uploading file...</div>
              <div className="text-[10px] text-[#6b7280]">Optimizing and saving to CDN storage</div>
            </div>
          ) : isCompact ? (
            <div className="flex flex-col items-center gap-1 text-[#6b7280]">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#e7e9ee] shadow-2xs flex items-center justify-center text-[#d97706] group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold text-[#101114]">
                <span className="hover:underline">Click to upload</span>
                <span className="text-[#6b7280] font-normal"> or drag</span>
              </div>
              <p className="text-[10px] text-[#9ca3af] font-medium truncate max-w-full">
                SVG, PNG, JPG, WebP
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#6b7280]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e7e9ee] shadow-2xs flex items-center justify-center text-[#d97706] group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#101114] hover:underline">
                  Click to upload
                </span>
                <span className="text-xs text-[#6b7280]"> or drag and drop</span>
              </div>
              <p className="text-[10px] text-[#9ca3af] font-medium max-w-[240px]">
                PNG, JPG, WebP, AVIF, SVG or PDF (up to 30MB)
              </p>
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#6b7280] font-medium leading-tight">{helperText}</p>}
    </div>
  );
}

/**
 * Multi-Image Gallery Uploader Component
 */
export function GalleryUpload({
  values = [],
  onChange,
  folder = "gallery",
  label = "Photo Gallery",
  helperText,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  helperText?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.success ? data.url : null;
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      onChange([...values, ...uploadedUrls]);
    } catch (err) {
      console.error("Gallery upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(values.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-2">
        <label className="text-xs font-bold text-[#101114] uppercase tracking-wider">
          {label} ({values.length})
        </label>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-[#101114] hover:bg-[#23252a] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fcb907]" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-[#fcb907]" />
          )}
          <span>Add Photos</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        multiple
        accept="image/*"
        className="hidden"
      />

      {values.length === 0 ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="p-6 border-2 border-dashed border-[#d5d9e0] hover:border-[#fcb907] bg-[#f9fafb] rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center gap-2"
        >
          <ImageIcon className="w-8 h-8 text-[#d97706]" />
          <span className="text-xs font-bold text-[#101114]">No gallery photos yet</span>
          <span className="text-[11px] text-[#6b7280]">Click to upload multiple high-res angles & interior walkthrough photos</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {values.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#d5d9e0] group shadow-2xs bg-stone-900"
            >
              <Image src={url} alt={`Gallery photo ${idx + 1}`} fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {helperText && <p className="text-[11px] text-[#6b7280] font-medium">{helperText}</p>}
    </div>
  );
}
