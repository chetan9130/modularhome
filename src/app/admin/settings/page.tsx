"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Megaphone,
  Search,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    companyName: "",
    logoUrl: "",
    faviconUrl: "",
    phone: "",
    email: "",
    address: "",
    socialLinks: { facebook: "", instagram: "", youtube: "" },
    announcementEnabled: true,
    announcementText: "",
    announcementLink: "",
    navLinks: [],
    footerText: "",
    footerLinks: [],
    defaultSeoTitle: "",
    defaultMetaDescription: "",
    ctaLabel: "",
    ctaLink: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setSettings({
          ...d,
          socialLinks: typeof d.socialLinks === "string" ? JSON.parse(d.socialLinks || "{}") : d.socialLinks || {},
          navLinks: typeof d.navLinks === "string" ? JSON.parse(d.navLinks || "[]") : d.navLinks || [],
          footerLinks: typeof d.footerLinks === "string" ? JSON.parse(d.footerLinks || "[]") : d.footerLinks || [],
        });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load settings." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: "Global website settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to save settings." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#6b7280] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#d97706]" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Global Settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Global Website Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Configure site-wide branding, direct contact info, announcement banner bar, social media links, and SEO defaults.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Settings</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Branding Section */}
        <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
            <Globe className="w-4 h-4 text-[#d97706]" />
            <span>Company Branding</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Company Name</label>
            <input
              type="text"
              value={settings.companyName || ""}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <ImageUpload
            label="Company Logo Image"
            value={settings.logoUrl || ""}
            onChange={(url) => setSettings({ ...settings, logoUrl: url })}
            folder="branding"
            aspectRatio="logo"
            helperText="Vector SVG, PNG, or WebP logo displayed in header and footer."
          />

          <ImageUpload
            label="Browser Favicon Icon"
            value={settings.faviconUrl || ""}
            onChange={(url) => setSettings({ ...settings, faviconUrl: url })}
            folder="branding"
            aspectRatio="1/1"
            accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
            helperText="32x32 or 64x64 icon displayed in browser tab and bookmarks."
          />
        </div>

        {/* 2. Contact Information */}
        <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
            <Phone className="w-4 h-4 text-[#d97706]" />
            <span>Direct Contact Information</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Phone Number</label>
            <input
              type="text"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Public Email Address</label>
            <input
              type="email"
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Physical Address / Headquarters</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>
        </div>

        {/* 3. Top Announcement Banner */}
        <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114]">
              <Megaphone className="w-4 h-4 text-[#d97706]" />
              <span>Announcement Top Bar</span>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-[#101114] cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.announcementEnabled}
                onChange={(e) => setSettings({ ...settings, announcementEnabled: e.target.checked })}
                className="w-4 h-4 text-[#d97706] rounded-sm focus:ring-[#fcb907]"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Banner Announcement Text</label>
            <input
              type="text"
              value={settings.announcementText || ""}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              placeholder="Direct Factory Modular & Prefab Home Builder • 2026 Models Released"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Banner Target Link</label>
            <input
              type="text"
              value={settings.announcementLink || ""}
              onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
              placeholder="/buildings"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
            <LinkIcon className="w-4 h-4 text-[#d97706]" />
            <span>Social Media Channels</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Facebook URL</label>
            <input
              type="text"
              value={settings.socialLinks?.facebook || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                })
              }
              placeholder="https://facebook.com/modularhome"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Instagram URL</label>
            <input
              type="text"
              value={settings.socialLinks?.instagram || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                })
              }
              placeholder="https://instagram.com/modularhome"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">YouTube Channel URL</label>
            <input
              type="text"
              value={settings.socialLinks?.youtube || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                })
              }
              placeholder="https://youtube.com/@modularhome"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>
        </div>

        {/* 5. Default SEO Meta */}
        <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
            <Search className="w-4 h-4 text-[#d97706]" />
            <span>Default Global SEO Metadata</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">
                Default Meta Title ({settings.defaultSeoTitle?.length || 0}/60 chars)
              </label>
              <input
                type="text"
                value={settings.defaultSeoTitle || ""}
                onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">
                Default Meta Description ({settings.defaultMetaDescription?.length || 0}/160 chars)
              </label>
              <textarea
                rows={3}
                value={settings.defaultMetaDescription || ""}
                onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>
          </div>
        </div>

        {/* 6. Main CTA Button */}
        <div className="bg-white p-6 rounded-[18px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3">
            <Sparkles className="w-4 h-4 text-[#d97706]" />
            <span>Primary Global CTA Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">CTA Button Label</label>
              <input
                type="text"
                value={settings.ctaLabel || ""}
                onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
                placeholder="Get Your Free Quote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">CTA Destination URL</label>
              <input
                type="text"
                value={settings.ctaLink || ""}
                onChange={(e) => setSettings({ ...settings, ctaLink: e.target.value })}
                placeholder="/quote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f6f7f9] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
