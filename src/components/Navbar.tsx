"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  ChevronRight, 
  ChevronDown, 
  ArrowRight, 
  Search, 
  FileSpreadsheet, 
  Play, 
  BookOpen, 
  Info, 
  PhoneCall, 
  Star, 
  Sparkles,
  Layers,
  HelpCircle,
  Building2,
  CheckCircle2,
  FileText,
  ShieldCheck
} from "lucide-react";
import { PublicGlobalSettings } from "@/lib/settings";
import { CmsPage } from "@/lib/publicData";

interface CategoryNavOption {
  label: string;
  href: string;
  categoryQuery?: string;
  badge?: string;
}

const PRIMARY_MENU_OPTIONS: CategoryNavOption[] = [
  { label: "Modular Homes", href: "/buildings?category=Modular+Homes", categoryQuery: "Modular Homes" },
  { label: "Floor Plans", href: "/floor-plans", categoryQuery: "Floor Plans", badge: "NEW" },
  { label: "Prefab Homes", href: "/buildings?category=Prefab+Homes", categoryQuery: "Prefab Homes" },
  { label: "Barndominiums", href: "/buildings?category=Barndominiums", categoryQuery: "Barndominiums" },
  { label: "House Kits", href: "/buildings?category=House+Kits", categoryQuery: "House Kits" },
  { label: "Tiny Homes", href: "/buildings?category=Tiny+Homes", categoryQuery: "Tiny Homes" },
  { label: "Park Models", href: "/buildings?category=Park+Models", categoryQuery: "Park Models" },
  { label: "Cabins", href: "/buildings?category=Cabins", categoryQuery: "Cabins" },
  { label: "ADU's & Granny Pods", href: "/buildings?category=ADUs+%26+Granny+Pods", categoryQuery: "ADUs & Granny Pods" },
  { label: "A-Frames", href: "/buildings?category=A-Frame+Homes", categoryQuery: "A-Frame Homes" },
  { label: "Commercial", href: "/buildings?category=Commercial+Buildings", categoryQuery: "Commercial Buildings" },
];

const CORE_MORE_OPTIONS = [
  { 
    label: "Floor Plan Store", 
    href: "/floor-plans", 
    desc: "Browse & download construction blueprints",
    icon: Layers 
  },
  { 
    label: "Custom Homes", 
    href: "/buildings?category=Custom+Homes", 
    desc: "Bespoke engineered modular floor plans",
    icon: Sparkles 
  },
  { 
    label: "Upload Floor Plan", 
    href: "/upload-floor-plan", 
    desc: "Submit your sketch or CAD for instant estimate",
    icon: FileSpreadsheet 
  },
  { 
    label: "Factory Video Tours", 
    href: "/videos", 
    desc: "Watch indoor precision build walk-throughs",
    icon: Play 
  },
  { 
    label: "Guides & Cost Calculators", 
    href: "/resources", 
    desc: "Permits, foundation & turnkey cost guides",
    icon: BookOpen 
  },
  { 
    label: "About ModularHome", 
    href: "/about", 
    desc: "Our story, engineering standards & warranty",
    icon: Info 
  },
  { 
    label: "Customer Reviews", 
    href: "/#testimonials", 
    desc: "Verified homeowner ratings & project photos",
    icon: Star 
  },
  { 
    label: "Contact & Consultations", 
    href: "/contact", 
    desc: "Speak with an architectural housing advisor",
    icon: PhoneCall 
  },
];

interface NavbarContentProps {
  initialSettings?: PublicGlobalSettings;
  customPages?: CmsPage[];
}

function NavbarContent({ initialSettings, customPages = [] }: NavbarContentProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams ? searchParams.get("category") : null;

  // Published custom pages (excluding home)
  const publishedPages = (customPages || []).filter(
    (p) => p.status === "PUBLISHED" && p.slug !== "home" && !p.slug.startsWith("/")
  );

  const phone = initialSettings?.phone || "+1 (812) 595-4033";
  const email = initialSettings?.email || "support@modularhome.com";
  const logoUrl = initialSettings?.logoUrl || "/finallogo.avif";
  const announcementText = initialSettings?.announcementText || "Direct Factory Modular & Prefab Home Builder • 2026 Models Released";
  const announcementLink = initialSettings?.announcementLink || "/buildings";
  const announcementEnabled = initialSettings?.announcementEnabled !== false;
  const ctaLabel = initialSettings?.ctaLabel || "Get a Free Quote";
  const ctaLink = initialSettings?.ctaLink || "#quote";
  const socialLinks = initialSettings?.socialLinks || {};

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [pathname, searchParams]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Handle outside click for "More" dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buildings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/buildings`);
    }
  };

  const isMoreActive = [
    "/about",
    "/videos",
    "/resources",
    "/contact",
    "/upload-floor-plan",
  ].some((path) => pathname.startsWith(path)) || currentCategory === "Custom Homes" || publishedPages.some((p) => pathname === `/${p.slug}`);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT & UTILITY BAR (DARK SLEEK RIBBON) */}
      {/* ========================================================================= */}
      {announcementEnabled && (
        <div className="bg-[#0f1218] text-white text-[12px] border-b border-[#1c222e] select-none w-full">
          <div className="wrap py-1.5 sm:py-2 flex items-center justify-between gap-2">
            {/* Left: Phone & Support Email */}
            <div className="flex items-center gap-2 sm:gap-4 text-gray-300 overflow-hidden">
              {/* Phone Number - Prominent & High Impact */}
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 hover:text-[#fcb907] transition-all text-xs sm:text-[14px] lg:text-[15px] font-extrabold text-white group shrink-0"
              >
                <span className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-[#fcb907] text-[#101114] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#e5a706] transition-transform shadow-xs shrink-0">
                  <PhoneCall className="w-2.5 sm:w-3 h-2.5 sm:h-3 stroke-[2.5]" />
                </span>
                <span className="tracking-tight text-white group-hover:text-[#fcb907] transition-colors whitespace-nowrap">
                  {phone}
                </span>
              </a>

              <span className="text-[#fcb907]/40 text-[10px] hidden xs:inline">●</span>

              {/* Email Link */}
              <a
                href={`mailto:${email}`}
                className="hidden xs:inline-flex items-center gap-1.5 hover:text-[#fcb907] transition-colors text-[11px] sm:text-[12px] text-gray-300 group truncate"
              >
                <svg className="w-3 h-3 fill-current text-[#fcb907] group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span className="truncate">{email}</span>
              </a>
            </div>

            {/* Middle: Announcement message on larger screens */}
            <div className="hidden xl:flex items-center gap-2 text-[11.5px] text-gray-300 truncate max-w-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fcb907] animate-pulse"></span>
              <Link href={announcementLink} className="hover:text-[#fcb907] hover:underline truncate">
                {announcementText}
              </Link>
            </div>

            {/* Right: Quick Portal Links & Social Media Icons */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden lg:flex items-center gap-3 text-[11.5px] text-gray-400 font-medium">
                <Link href="/upload-floor-plan" className="hover:text-[#fcb907] transition-colors">
                  Upload Plans
                </Link>
                <span className="text-gray-700">|</span>
                <Link href="/resources" className="hover:text-[#fcb907] transition-colors">
                  Cost Calculator
                </Link>
                <span className="text-gray-700">|</span>
                <Link href="/contact" className="hover:text-[#fcb907] transition-colors">
                  Support
                </Link>
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold tracking-wider uppercase text-gray-400 mr-1 hidden md:inline">
                  FOLLOW US:
                </span>

                {/* Facebook */}
                {socialLinks.facebook !== "" && (
                  <a
                    href={socialLinks.facebook || "https://www.facebook.com"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow us on Facebook"
                    className="w-[22px] h-[22px] rounded-full bg-white/10 text-white hover:bg-[#fcb907] hover:text-[#101114] flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}

                {/* Instagram */}
                {socialLinks.instagram !== "" && (
                  <a
                    href={socialLinks.instagram || "https://www.instagram.com"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow us on Instagram"
                    className="w-[22px] h-[22px] rounded-full bg-white/10 text-white hover:bg-[#fcb907] hover:text-[#101114] flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}

                {/* YouTube */}
                {socialLinks.youtube !== "" && (
                  <a
                    href={socialLinks.youtube || "https://www.youtube.com"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow us on YouTube"
                    className="w-[22px] h-[22px] rounded-full bg-white/10 text-white hover:bg-[#fcb907] hover:text-[#101114] flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}

                {/* TikTok */}
                {socialLinks.tiktok !== "" && (
                  <a
                    href={socialLinks.tiktok || "https://www.tiktok.com"}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Follow us on TikTok"
                    className="w-[22px] h-[22px] rounded-full bg-white/10 text-white hover:bg-[#fcb907] hover:text-[#101114] flex items-center justify-center hover:scale-110 transition-all"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.3 1.05.21 2.18-.08 2.96-.8.61-.53.97-1.3 1.01-2.11.05-3.87.02-7.74.03-11.61z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Mobile Contact Quick Action */}
            <Link
              href="/contact"
              className="sm:hidden text-gray-300 hover:text-[#fcb907] text-[11px] font-medium flex items-center gap-1"
            >
              <span>Contact</span>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STICKY TWO-TIER ARCHITECTURAL HEADER */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md shadow-xs transition-shadow w-full">
        
        {/* --- ROW 1: BRAND LOGO + GLOBAL SEARCH + CTAs --- */}
        <div className="border-b border-[#f0f2f5] w-full">
          <div className="wrap h-[58px] sm:h-[68px] md:h-[74px] flex items-center justify-between gap-2 sm:gap-6">
            
            {/* Left: Mobile Hamburger Toggle + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 -ml-1 text-[#101114] hover:text-[#d97706] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Brand Logo */}
              <Link href="/" className="flex items-center group select-none shrink-0">
                <Image
                  src={logoUrl}
                  alt={initialSettings?.companyName || "ModularHome.com"}
                  width={210}
                  height={48}
                  priority
                  className="h-6 sm:h-8 md:h-9 w-auto max-w-[130px] sm:max-w-[180px] md:max-w-none object-contain hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>

            {/* Center: Search / Explore Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 50+ modular models, floor plans, ADUs, cabins..."
                  className="w-full bg-[#f6f7f9] hover:bg-[#f1f3f6] focus:bg-white text-xs sm:text-[13px] text-[#101114] placeholder-gray-400 pl-10 pr-24 py-2 sm:py-2.5 rounded-full border border-gray-200/90 focus:border-[#fcb907] focus:ring-3 focus:ring-[#fcb907]/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1 sm:py-1.5 bg-[#101114] hover:bg-[#fcb907] hover:text-[#101114] text-white text-[11px] font-bold rounded-full transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right: Quick Features & Main CTA Button */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link
                href="/upload-floor-plan"
                className="hidden xl:inline-flex items-center gap-1.5 text-xs font-bold text-[#101114] hover:text-[#d97706] py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#d97706]" />
                <span>Floor Plans</span>
              </Link>

              <Link
                href={ctaLink}
                className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black py-1.5 sm:py-2.5 px-2.5 sm:px-4 text-[11.5px] sm:text-xs md:text-[13px] tracking-tight rounded-lg sm:rounded-xl shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0"
              >
                <span className="hidden xs:inline">{ctaLabel}</span>
                <span className="xs:hidden">Quote</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- ROW 2: DEDICATED CATEGORY NAVIGATION RIBBON --- */}
        <div className="hidden lg:block border-b border-[#e5e7eb] bg-white/98 backdrop-blur-xs relative z-40 overflow-visible">
          <div className="wrap relative overflow-visible">
            <nav className="flex items-center justify-between gap-1 xl:gap-2 py-1.5 overflow-visible relative">
              <div className="flex items-center gap-0.5 xl:gap-1.5 flex-wrap overflow-visible">
                {PRIMARY_MENU_OPTIONS.map((item) => {
                  const active = currentCategory === item.categoryQuery;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`inline-flex items-center px-2.5 xl:px-3 py-1.5 rounded-lg text-[12.5px] xl:text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-150 ${
                        active
                          ? "bg-amber-50 text-[#b45309] ring-1 ring-amber-200/80 shadow-2xs font-extrabold"
                          : "text-[#374151] hover:text-[#101114] hover:bg-[#f6f7f9]"
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* "More" Dropdown Menu */}
                <div 
                  ref={dropdownRef}
                  className="relative inline-block"
                  onMouseEnter={() => setMoreDropdownOpen(true)}
                  onMouseLeave={() => setMoreDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMoreDropdownOpen(!moreDropdownOpen);
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg text-[12.5px] xl:text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-150 cursor-pointer ${
                      isMoreActive || moreDropdownOpen
                        ? "bg-amber-50 text-[#b45309] ring-1 ring-amber-200/80 font-extrabold"
                        : "text-[#374151] hover:text-[#101114] hover:bg-[#f6f7f9]"
                    }`}
                    aria-expanded={moreDropdownOpen}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Floating Card with hover bridge */}
                  {moreDropdownOpen && (
                    <div 
                      className="absolute left-0 top-full pt-1.5 w-88 z-[100] animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto"
                      onMouseEnter={() => setMoreDropdownOpen(true)}
                    >
                      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-2.5 shadow-2xl ring-1 ring-black/5 space-y-2">
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1 border-b border-gray-100 mb-1">
                            Explore Services & Resources
                          </div>
                          <div className="space-y-0.5">
                            {CORE_MORE_OPTIONS.map((option) => (
                              <Link
                                key={option.label}
                                href={option.href}
                                onClick={() => setMoreDropdownOpen(false)}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#f6f7f9] text-[#101114] hover:text-[#d97706] transition-colors group"
                              >
                                <div className="p-2 rounded-lg bg-[#fcb907]/15 text-[#d97706] group-hover:bg-[#fcb907] group-hover:text-[#101114] transition-colors shrink-0 mt-0.5">
                                  <option.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold leading-snug">
                                    {option.label}
                                  </div>
                                  <div className="text-[11px] text-[#6b7280] font-normal leading-tight mt-0.5">
                                    {option.desc}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Dynamic Custom CMS Pages Section */}
                        {publishedPages.length > 0 && (
                          <div className="border-t border-[#f0f2f5] pt-2">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#d97706] px-3 py-1 border-b border-gray-100 mb-1 flex items-center justify-between">
                              <span>Special Guides & Pages</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-[#b45309] text-[9px]">
                                {publishedPages.length}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              {publishedPages.map((page) => (
                                <Link
                                  key={page.id}
                                  href={`/${page.slug}`}
                                  onClick={() => setMoreDropdownOpen(false)}
                                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-amber-50/70 text-[#101114] hover:text-[#d97706] transition-colors group"
                                >
                                  <div className="p-1.5 rounded-lg bg-[#f6f7f9] text-[#6b7280] group-hover:bg-[#fcb907] group-hover:text-[#101114] transition-colors shrink-0">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold truncate">
                                      {page.title}
                                    </div>
                                    {page.subtitle && (
                                      <div className="text-[10px] text-[#6b7280] truncate font-normal">
                                        {page.subtitle}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#d97706] shrink-0" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* End of Category Strip: Quick Link to Catalog */}
              <Link
                href="/buildings"
                className="hidden 2xl:inline-flex items-center gap-1 text-[11.5px] font-bold text-gray-500 hover:text-[#d97706] transition-colors pl-2"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-OUT DRAWER */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div className="w-[88%] max-w-sm bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e7e9ee]">
              <Image
                src={logoUrl}
                alt="ModularHome.com"
                width={160}
                height={36}
                className="h-7 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-500 hover:text-[#101114] rounded-lg hover:bg-gray-100"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="py-4 border-b border-[#e7e9ee]">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search home designs..."
                  className="w-full bg-[#f6f7f9] text-xs text-[#101114] pl-9 pr-3 py-2.5 rounded-xl border border-[#dfe2e7] focus:outline-none focus:border-[#fcb907]"
                />
              </form>
            </div>

            {/* Mobile Categories List */}
            <div className="py-3 flex-1 space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Building Categories
                </div>
                <div className="space-y-1">
                  {PRIMARY_MENU_OPTIONS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#101114] hover:bg-[#f6f7f9] hover:text-[#d97706]"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#fcb907] text-[#101114] text-[9px] font-black">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Dynamic Pages on Mobile */}
              {publishedPages.length > 0 && (
                <div className="pt-2 border-t border-[#e7e9ee]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#d97706] mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Company Pages & Guides</span>
                  </div>
                  <div className="space-y-1">
                    {publishedPages.map((page) => (
                      <Link
                        key={page.id}
                        href={`/${page.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#101114] hover:bg-amber-50 hover:text-[#d97706]"
                      >
                        <span className="truncate">{page.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Quick Links */}
              <div className="pt-2 border-t border-[#e7e9ee]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Quick Access
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#374151]">
                  <Link href="/floor-plans" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#d97706] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Plans Store</span>
                  </Link>
                  <Link href="/videos" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#d97706] flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Videos</span>
                  </Link>
                  <Link href="/resources" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#d97706] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Cost Guide</span>
                  </Link>
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#d97706] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>About Us</span>
                  </Link>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#d97706] flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Contact</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 space-y-2.5 border-t border-[#e7e9ee] mt-4">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#101114] hover:bg-[#222] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>Call {phone}</span>
              </Link>

              <Link
                href={ctaLink}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export interface NavbarProps {
  initialSettings?: PublicGlobalSettings;
  customPages?: CmsPage[];
}

export default function Navbar({ initialSettings, customPages = [] }: NavbarProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#e7e9ee] h-[110px]" />
    }>
      <NavbarContent initialSettings={initialSettings} customPages={customPages} />
    </Suspense>
  );
}
