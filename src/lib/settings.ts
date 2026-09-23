import fs from "fs";
import path from "path";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

export interface PublicGlobalSettings {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: Record<string, string>;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  navLinks: Array<{ label: string; href: string }>;
  footerText: string;
  footerLinks: Array<{ label: string; href: string }>;
  defaultSeoTitle: string;
  defaultMetaDescription: string;
  ctaLabel: string;
  ctaLink: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SETTINGS_FILE = path.join(DATA_DIR, "custom_settings.json");

export const DEFAULT_SETTINGS: PublicGlobalSettings = {
  companyName: "ModularHome.com",
  logoUrl: "/finallogo.avif",
  faviconUrl: "/favicon.ico",
  phone: "+1 (812) 595-4033",
  email: "support@modularhome.com",
  address: "Factory Headquarters, IN & Nationwide Delivery",
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    tiktok: "https://tiktok.com",
    twitter: "",
    linkedin: "",
  },
  announcementEnabled: true,
  announcementText: "Direct Factory Modular & Prefab Home Builder • 2026 Models Released",
  announcementLink: "/buildings",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Cabins", href: "/buildings?category=Cabins" },
    { label: "Barndominiums", href: "/buildings?category=Barndominiums" },
    { label: "Floor Plans", href: "/upload-floor-plan" },
    { label: "Videos", href: "/videos" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerText: "ModularHome.com leads the American prefabricated housing movement with precision-engineered modular residences, luxury barndominiums, and rapid-deployment cabin kits.",
  footerLinks: [
    { label: "Cabins", href: "/buildings?category=Cabins" },
    { label: "Barndominiums", href: "/buildings?category=Barndominiums" },
    { label: "Floor Plans", href: "/upload-floor-plan" },
    { label: "Video Gallery", href: "/videos" },
    { label: "Quote Wizard", href: "/quote" },
  ],
  defaultSeoTitle: "ModularHome.com | Modern Homes. A Smarter Way to Build.",
  defaultMetaDescription: "Explore modular homes, prefab homes, cabins, ADUs, barndominiums, floor plans and custom home options.",
  ctaLabel: "Get Your Free Quote",
  ctaLink: "/quote",
};

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Error creating data directory:", err);
  }
}

export function readSettingsFromStore(): PublicGlobalSettings {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
      return DEFAULT_SETTINGS;
    }
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...(parsed?.socialLinks || {}) },
    };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettingsToStore(settings: Partial<PublicGlobalSettings>): PublicGlobalSettings {
  try {
    ensureDataDirectory();
    const current = readSettingsFromStore();
    const updated: PublicGlobalSettings = {
      ...current,
      ...settings,
      socialLinks: {
        ...current.socialLinks,
        ...(settings.socialLinks || {}),
      },
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (error) {
    console.error("Error writing to custom_settings.json:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function getPublicGlobalSettings(): Promise<PublicGlobalSettings> {
  const localSettings = readSettingsFromStore();

  try {
    if (!isSupabaseConfigured()) {
      return localSettings;
    }

    const { data: raw, error } = await supabaseAdmin
      .from("global_settings")
      .select("*")
      .eq("key", "default")
      .single();

    if (error || !raw) return localSettings;

    let socialLinks = localSettings.socialLinks;
    try {
      const rawSocial = raw.social_links || raw.socialLinks;
      if (rawSocial) {
        const parsed = typeof rawSocial === "string" ? JSON.parse(rawSocial) : rawSocial;
        socialLinks = { ...localSettings.socialLinks, ...parsed };
      }
    } catch {}

    let navLinks = localSettings.navLinks;
    try {
      const rawNav = raw.nav_links || raw.navLinks;
      if (rawNav) {
        navLinks = typeof rawNav === "string" ? JSON.parse(rawNav) : rawNav;
      }
    } catch {}

    let footerLinks = localSettings.footerLinks;
    try {
      const rawFoot = raw.footer_links || raw.footerLinks;
      if (rawFoot) {
        footerLinks = typeof rawFoot === "string" ? JSON.parse(rawFoot) : rawFoot;
      }
    } catch {}

    const merged: PublicGlobalSettings = {
      companyName: raw.company_name || raw.companyName || localSettings.companyName,
      logoUrl: raw.logo_url || raw.logoUrl || localSettings.logoUrl,
      faviconUrl: raw.favicon_url || raw.faviconUrl || localSettings.faviconUrl,
      phone: raw.phone || localSettings.phone,
      email: raw.email || localSettings.email,
      address: raw.address || localSettings.address,
      socialLinks: socialLinks || localSettings.socialLinks,
      announcementEnabled: raw.announcement_enabled ?? raw.announcementEnabled ?? localSettings.announcementEnabled,
      announcementText: raw.announcement_text || raw.announcementText || localSettings.announcementText,
      announcementLink: raw.announcement_link || raw.announcementLink || localSettings.announcementLink,
      navLinks: navLinks || localSettings.navLinks,
      footerText: raw.footer_text || raw.footerText || localSettings.footerText,
      footerLinks: footerLinks || localSettings.footerLinks,
      defaultSeoTitle: raw.default_seo_title || raw.defaultSeoTitle || localSettings.defaultSeoTitle,
      defaultMetaDescription: raw.default_meta_description || raw.defaultMetaDescription || localSettings.defaultMetaDescription,
      ctaLabel: raw.cta_label || raw.ctaLabel || localSettings.ctaLabel,
      ctaLink: raw.cta_link || raw.ctaLink || localSettings.ctaLink,
    };

    return merged;
  } catch (error) {
    console.warn("Could not fetch global settings from Supabase, using local settings:", error);
    return localSettings;
  }
}
