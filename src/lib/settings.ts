import { supabase, isSupabaseConfigured } from "./supabase";

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

const DEFAULT_SETTINGS: PublicGlobalSettings = {
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

export async function getPublicGlobalSettings(): Promise<PublicGlobalSettings> {
  try {
    if (!isSupabaseConfigured()) {
      return DEFAULT_SETTINGS;
    }

    const { data: raw, error } = await supabase
      .from("global_settings")
      .select("*")
      .eq("key", "default")
      .single();

    if (error || !raw) return DEFAULT_SETTINGS;

    let socialLinks = DEFAULT_SETTINGS.socialLinks;
    try {
      if (raw.social_links) {
        socialLinks = typeof raw.social_links === "string" ? JSON.parse(raw.social_links) : raw.social_links;
      }
    } catch {}

    let navLinks = DEFAULT_SETTINGS.navLinks;
    try {
      if (raw.nav_links) {
        navLinks = typeof raw.nav_links === "string" ? JSON.parse(raw.nav_links) : raw.nav_links;
      }
    } catch {}

    let footerLinks = DEFAULT_SETTINGS.footerLinks;
    try {
      if (raw.footer_links) {
        footerLinks = typeof raw.footer_links === "string" ? JSON.parse(raw.footer_links) : raw.footer_links;
      }
    } catch {}

    return {
      companyName: raw.company_name || DEFAULT_SETTINGS.companyName,
      logoUrl: raw.logo_url || DEFAULT_SETTINGS.logoUrl,
      faviconUrl: raw.favicon_url || DEFAULT_SETTINGS.faviconUrl,
      phone: raw.phone || DEFAULT_SETTINGS.phone,
      email: raw.email || DEFAULT_SETTINGS.email,
      address: raw.address || DEFAULT_SETTINGS.address,
      socialLinks,
      announcementEnabled: raw.announcement_enabled ?? true,
      announcementText: raw.announcement_text || DEFAULT_SETTINGS.announcementText,
      announcementLink: raw.announcement_link || DEFAULT_SETTINGS.announcementLink,
      navLinks,
      footerText: raw.footer_text || DEFAULT_SETTINGS.footerText,
      footerLinks,
      defaultSeoTitle: raw.default_seo_title || DEFAULT_SETTINGS.defaultSeoTitle,
      defaultMetaDescription: raw.default_meta_description || DEFAULT_SETTINGS.defaultMetaDescription,
      ctaLabel: raw.cta_label || DEFAULT_SETTINGS.ctaLabel,
      ctaLink: raw.cta_link || DEFAULT_SETTINGS.ctaLink,
    };
  } catch (error) {
    console.warn("Could not fetch global settings from Supabase, using defaults:", error);
    return DEFAULT_SETTINGS;
  }
}
