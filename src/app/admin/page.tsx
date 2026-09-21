"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  FolderOpen,
  FileText,
  BookOpen,
  Users,
  FileSpreadsheet,
  ArrowUpRight,
  Plus,
  Globe,
  Layers,
  Video,
  CheckCircle2,
  Loader2,
  Download,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-[#6b7280] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
          Loading Management Console...
        </span>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalProducts: 0,
    totalCollections: 0,
    totalPages: 0,
    publishedBlogs: 0,
    totalLeads: 0,
    newLeads: 0,
    totalQuotations: 0,
    pendingQuotations: 0,
  };

  const statCards = [
    {
      label: "Home Models",
      value: metrics.totalProducts,
      subtext: "Precision steel catalog models",
      href: "/admin/products",
      icon: Home,
      accentBorder: "hover:border-[#fcb907]",
      iconBg: "bg-amber-50 text-[#b45309] border-amber-200",
    },
    {
      label: "Collections & Series",
      value: metrics.totalCollections,
      subtext: "Architectural design groupings",
      href: "/admin/collections",
      icon: FolderOpen,
      accentBorder: "hover:border-[#101114]",
      iconBg: "bg-slate-100 text-[#101114] border-slate-200",
    },
    {
      label: "Floor Plan Kits",
      value: metrics.totalFloorPlans || 6,
      subtext: "Downloadable architectural sets",
      href: "/admin/floor-plans",
      icon: Download,
      accentBorder: "hover:border-[#fcb907]",
      iconBg: "bg-amber-50 text-[#b45309] border-amber-200",
    },
    {
      label: "Inbound Leads",
      value: metrics.totalLeads,
      subtext: `${metrics.newLeads || 0} unread customer inquiries`,
      href: "/admin/leads",
      icon: Users,
      accentBorder: "hover:border-emerald-500",
      iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Quote Submissions",
      value: metrics.totalQuotations,
      subtext: `${metrics.pendingQuotations || 0} pending cost review`,
      href: "/admin/quotations",
      icon: FileSpreadsheet,
      accentBorder: "hover:border-blue-500",
      iconBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Articles & Guides",
      value: metrics.publishedBlogs,
      subtext: "Published construction blogs",
      href: "/admin/blogs",
      icon: BookOpen,
      accentBorder: "hover:border-indigo-500",
      iconBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
  ];

  const quickActions = [
    {
      title: "New Home Model",
      desc: "Add 3D model & specs to catalog",
      href: "/admin/products/new",
      icon: Home,
      highlight: true,
    },
    {
      title: "New Floor Plan Kit",
      desc: "Upload blueprint CAD/PDF package",
      href: "/admin/floor-plans",
      icon: Download,
      highlight: false,
    },
    {
      title: "Sync YouTube Videos",
      desc: "Sync channel videos & tours",
      href: "/admin/videos",
      icon: Video,
      highlight: false,
    },
    {
      title: "Shopify Sync Hub",
      desc: "Execute data & SEO migration",
      href: "/admin/shopify",
      icon: RefreshCw,
      highlight: false,
    },
    {
      title: "Page Blocks CMS",
      desc: "Customize homepage & sections",
      href: "/admin/sections",
      icon: Layers,
      highlight: false,
    },
    {
      title: "Global Site Settings",
      desc: "Branding, phone, SEO & banner",
      href: "/admin/settings",
      icon: Globe,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero Command Banner */}
      <div className="bg-[#0b0d11] rounded-[22px] p-6 sm:p-8 lg:p-10 text-white shadow-[0_20px_45px_rgba(11,13,17,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        {/* Subtle radial golden glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#fcb907]/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-[#d97706]/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="space-y-2.5 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#fcb907] text-[11px] font-mono font-bold uppercase tracking-widest backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#fcb907]" />
            <span>ModularHome CMS • Online & Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-serif">
            Executive Control Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
            Manage your catalogue of precision steel modular homes, digital architectural blueprints, customer quotation calculations, and live content syndication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Model</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider border border-white/15 transition-all backdrop-blur-xs"
          >
            <Globe className="w-4 h-4 text-[#fcb907]" />
            <span>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-white p-6 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] hover:shadow-[0_18px_45px_rgba(16,24,40,0.08)] transition-all duration-200 group relative overflow-hidden ${card.accentBorder}`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-3.5 rounded-2xl border ${card.iconBg} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="p-1 text-[#6b7280] group-hover:text-[#d97706] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-5">
                <div className="text-3xl sm:text-4xl font-black text-[#101114] tracking-tight font-serif">
                  {card.value}
                </div>
                <div className="text-xs font-bold text-[#101114] mt-1.5 uppercase tracking-wider font-sans">
                  {card.label}
                </div>
                <div className="text-[11px] text-[#6b7280] mt-0.5 font-medium">
                  {card.subtext}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Quick Action Launchpad */}
      <div className="bg-white p-6 sm:p-7 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3.5">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#101114] font-serif">
              Quick Management Shortcuts
            </h2>
            <p className="text-xs text-[#6b7280] font-medium">Direct launchpad for common administrative operations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.title}
                href={act.href}
                className="p-4 rounded-2xl bg-[#f8f9fa] hover:bg-[#fffcf2] border border-[#e7e9ee] hover:border-[#fcb907] transition-all flex items-start gap-3.5 group shadow-2xs"
              >
                <div className="p-2.5 rounded-xl bg-white border border-[#e7e9ee] text-[#101114] group-hover:bg-[#fcb907] group-hover:text-[#101114] transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#101114] group-hover:text-[#b45309] transition-colors flex items-center justify-between">
                    <span>{act.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-[#6b7280] mt-0.5 line-clamp-1 font-medium">
                    {act.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Activity: Inbound Leads & Quotation Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inbound Leads */}
        <div className="bg-white p-6 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3.5">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#101114] font-serif">
                Recent Inbound Inquiries
              </h3>
              <p className="text-xs text-[#6b7280] font-medium">Direct leads from contact forms & consultation modal</p>
            </div>
            <Link
              href="/admin/leads"
              className="text-xs font-bold text-[#d97706] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentLeads?.length > 0 ? (
              data.recentLeads.slice(0, 4).map((lead: any) => (
                <div
                  key={lead._id || lead.id}
                  className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e7e9ee] hover:border-[#d5d9e0] flex items-start justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-[#b45309] font-bold flex items-center justify-center shrink-0 text-xs">
                      {lead.name ? lead.name.charAt(0).toUpperCase() : "L"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#101114] truncate font-sans">{lead.name}</div>
                      <div className="text-[#6b7280] text-[11px] font-medium truncate flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-[#6b7280]" />
                        <span>{lead.email}</span>
                        {lead.phone && <span>• {lead.phone}</span>}
                      </div>
                      {lead.enquiryDetails && (
                        <div className="text-[#101114] text-[11px] mt-1.5 line-clamp-1 italic font-serif">
                          &ldquo;{lead.enquiryDetails}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-mono">
                    {lead.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#6b7280] text-center py-8 font-medium">No leads recorded yet.</div>
            )}
          </div>
        </div>

        {/* Recent Quote Wizard Submissions */}
        <div className="bg-white p-6 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#e7e9ee] pb-3.5">
            <div>
              <h3 className="text-base font-bold tracking-tight text-[#101114] font-serif">
                Recent Quote Wizard Submissions
              </h3>
              <p className="text-xs text-[#6b7280] font-medium">Real-time estimations from Instant Cost Calculator</p>
            </div>
            <Link
              href="/admin/quotations"
              className="text-xs font-bold text-[#d97706] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentQuotations?.length > 0 ? (
              data.recentQuotations.slice(0, 4).map((quote: any) => (
                <div
                  key={quote._id || quote.id}
                  className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e7e9ee] hover:border-[#d5d9e0] flex items-start justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[#101114] truncate font-sans">{quote.customerName}</div>
                    <div className="text-[#6b7280] text-[11px] font-medium truncate mt-0.5">
                      {quote.modelName || "Custom Configuration"} • {quote.sqft ? `${quote.sqft} sq ft` : "Standard Model"}
                    </div>
                    {quote.estimatedAmount && (
                      <div className="text-[#b45309] font-bold text-xs mt-1.5 font-mono">
                        Est: ${quote.estimatedAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 shrink-0 font-mono">
                    {quote.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#6b7280] text-center py-8 font-medium">No quote requests recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
