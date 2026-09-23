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
  FileText,
  Building,
  Mail,
  MapPin,
  RefreshCw,
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
    socialLinks: { facebook: "", instagram: "", youtube: "", tiktok: "", twitter: "", linkedin: "" },
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
        const rawSocial = typeof d.socialLinks === "string" ? JSON.parse(d.socialLinks || "{}") : (d.socialLinks || {});
        setSettings({
          ...d,
          socialLinks: {
            facebook: "",
            instagram: "",
            youtube: "",
            tiktok: "",
            twitter: "",
            linkedin: "",
            ...rawSocial,
          },
          navLinks: typeof d.navLinks === "string" ? JSON.parse(d.navLinks || "[]") : d.navLinks || [],
          footerLinks: typeof d.footerLinks === "string" ? JSON.parse(d.footerLinks || "[]") : d.footerLinks || [],
        });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load settings from server." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Keyboard shortcut: Ctrl+S or Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const submitBtn = document.getElementById("save-settings-btn");
        if (submitBtn) submitBtn.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        setMessage({ type: "success", text: "Global website settings synchronized and saved successfully!" });
        if (json.data) {
          const d = json.data;
          const rawSocial = typeof d.socialLinks === "string" ? JSON.parse(d.socialLinks || "{}") : (d.socialLinks || {});
          setSettings((prev: any) => ({
            ...prev,
            ...d,
            socialLinks: {
              ...prev.socialLinks,
              ...rawSocial,
            },
          }));
        }
      } else {
        setMessage({ type: "error", text: json.error?.message || "Failed to save settings." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Network error while saving settings." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-[#6b7280] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
          Loading Global Configuration...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Sticky/Fixed Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[#b45309] text-[11px] font-black uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Site-Wide Global Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
            Website Configuration & Brand Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Configure site-wide branding, direct customer channels, top announcement ribbon, social media accounts, and global SEO.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#d5d9e0] bg-white hover:bg-[#f8f9fa] text-[#101114] text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Reload settings from database"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Reload</span>
          </button>

          <button
            id="save-settings-btn"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in ${
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 1. Branding Section */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
            <Building className="w-4 h-4 text-[#d97706]" />
            <span>Company Branding</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Company Name</label>
            <input
              type="text"
              value={settings.companyName || ""}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="e.g. ModularHome.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <ImageUpload
              label="Company Logo"
              value={settings.logoUrl || ""}
              onChange={(url) => setSettings({ ...settings, logoUrl: url })}
              folder="branding"
              aspectRatio="logo"
              helperText="SVG, PNG, or WebP logo for navbar & footer."
            />

            <ImageUpload
              label="Browser Favicon"
              value={settings.faviconUrl || ""}
              onChange={(url) => setSettings({ ...settings, faviconUrl: url })}
              folder="branding"
              aspectRatio="1/1"
              accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
              helperText="32x32 or 64x64 icon for browser tabs & bookmarks."
            />
          </div>
        </div>

        {/* 2. Direct Contact Channels */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
            <Phone className="w-4 h-4 text-[#d97706]" />
            <span>Direct Contact Information</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Direct Phone Number</label>
            <input
              type="text"
              value={settings.phone || ""}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="e.g. +1 (812) 595-4033"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
            <p className="text-[11px] text-[#6b7280] mt-1">Displayed prominently in navbar header, footer, and quote pages.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Public Support Email Address</label>
            <input
              type="email"
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="support@modularhome.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Physical Address / Headquarters</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="e.g. Factory Headquarters, IN & Nationwide Delivery"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>
        </div>

        {/* 3. Top Announcement Banner */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] font-mono">
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
              <span>Banner Active</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Banner Message Text</label>
            <input
              type="text"
              value={settings.announcementText || ""}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              placeholder="Direct Factory Modular & Prefab Home Builder • 2026 Models Released"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Banner Target URL / Destination</label>
            <input
              type="text"
              value={settings.announcementLink || ""}
              onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
              placeholder="/buildings"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
            />
          </div>
        </div>

        {/* 4. Social Media Channels */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
            <LinkIcon className="w-4 h-4 text-[#d97706]" />
            <span>Social Media Channels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">TikTok Profile URL</label>
              <input
                type="text"
                value={settings.socialLinks?.tiktok || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, tiktok: e.target.value },
                  })
                }
                placeholder="https://tiktok.com/@modularhome"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">X / Twitter URL</label>
              <input
                type="text"
                value={settings.socialLinks?.twitter || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="https://x.com/modularhome"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">LinkedIn URL</label>
              <input
                type="text"
                value={settings.socialLinks?.linkedin || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                  })
                }
                placeholder="https://linkedin.com/company/modularhome"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>
          </div>
        </div>

        {/* 5. Footer Narrative / Bio */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
            <FileText className="w-4 h-4 text-[#d97706]" />
            <span>Footer Brand Description</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5">Footer Brand Summary</label>
            <textarea
              rows={3}
              value={settings.footerText || ""}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              placeholder="ModularHome.com leads the American prefabricated housing movement..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium leading-relaxed"
            />
            <p className="text-[11px] text-[#6b7280] mt-1">Appears underneath the brand logo in the website footer.</p>
          </div>
        </div>

        {/* 6. Primary Call To Action Button */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
            <Sparkles className="w-4 h-4 text-[#d97706]" />
            <span>Primary Global CTA Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">Navbar & Global CTA Label</label>
              <input
                type="text"
                value={settings.ctaLabel || ""}
                onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
                placeholder="Get Your Free Quote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1.5">CTA Target Destination URL</label>
              <input
                type="text"
                value={settings.ctaLink || ""}
                onChange={(e) => setSettings({ ...settings, ctaLink: e.target.value })}
                placeholder="/quote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>
          </div>
        </div>

        {/* 7. Default SEO Metadata */}
        <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#101114] border-b border-[#e7e9ee] pb-3 font-mono">
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
                placeholder="ModularHome.com | Modern Homes. A Smarter Way to Build."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
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
                placeholder="Explore modular homes, prefab homes, cabins, ADUs, barndominiums, floor plans and custom home options."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d5d9e0] bg-[#f8f9fa] text-xs text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907] font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
