"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Layers,
  Home,
  FolderOpen,
  BookOpen,
  Video,
  Users,
  FileSpreadsheet,
  ShoppingBag,
  RefreshCw,
  Download,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      fetch("/api/admin/auth/me")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Unauthenticated");
        })
        .then((data) => {
          if (data.success) setUser(data.user);
        })
        .catch(() => {
          router.push(`/admin/login?redirect=${pathname}`);
        });
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      router.push("/admin/login");
    }
  };

  // Compute breadcrumbs from pathname
  const breadcrumbs = useMemo(() => {
    if (!pathname || pathname === "/admin") {
      return [{ label: "Dashboard", href: "/admin" }];
    }
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Admin", href: "/admin" }];

    const routeMap: Record<string, string> = {
      products: "Home Models",
      "floor-plans": "Floor Plans",
      collections: "Collections",
      blogs: "Blogs & News",
      leads: "Leads & Prospects",
      quotations: "Quotations",
      orders: "Blueprint Orders",
      pages: "Pages",
      sections: "Page Sections",
      settings: "Global Settings",
      shopify: "Shopify Sync",
      videos: "YouTube Manager",
      new: "New Entry",
    };

    let accumulatedPath = "";
    parts.forEach((part, index) => {
      accumulatedPath += `/${part}`;
      if (index === 0) return; // skip initial 'admin'
      const label = routeMap[part] || (part.length > 20 ? "Detail View" : part.charAt(0).toUpperCase() + part.slice(1));
      crumbs.push({ label, href: accumulatedPath });
    });

    return crumbs;
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navSections = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      group: "Catalogue & Design",
      items: [
        { label: "Home Models", href: "/admin/products", icon: Home },
        { label: "Collections & Series", href: "/admin/collections", icon: FolderOpen },
        { label: "Floor Plans (Digital Kits)", href: "/admin/floor-plans", icon: Download },
      ],
    },
    {
      group: "Transactions & Pipeline",
      items: [
        { label: "Blueprint Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Inbound Leads", href: "/admin/leads", icon: Users },
        { label: "Quote Wizard Submissions", href: "/admin/quotations", icon: FileSpreadsheet },
      ],
    },
    {
      group: "Website CMS & Pages",
      items: [
        { label: "Page Manager", href: "/admin/pages", icon: FileText },
        { label: "Section Blocks", href: "/admin/sections", icon: Layers },
        { label: "Global Settings", href: "/admin/settings", icon: Globe },
      ],
    },
    {
      group: "Media & Integrations",
      items: [
        { label: "Articles & Resources", href: "/admin/blogs", icon: BookOpen },
        { label: "YouTube Auto-Sync", href: "/admin/videos", icon: Video },
        { label: "Shopify Migration Hub", href: "/admin/shopify", icon: RefreshCw },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex text-[#101114] font-sans selection:bg-[#fcb907] selection:text-[#101114]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b0d11] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-white/10 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-[#08090d]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="bg-white/95 p-2 rounded-xl border border-white/20 shadow-xs group-hover:scale-102 transition-transform">
              <Image
                src="/finallogo.avif"
                alt="ModularHome Logo"
                width={130}
                height={30}
                className="h-6 sm:h-7 w-auto object-contain"
                priority
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-7 scrollbar-thin scrollbar-thumb-white/10">
          {navSections.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-[#fcb907]/70">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? "bg-[#fcb907] text-[#101114] shadow-lg shadow-[#fcb907]/20 font-extrabold"
                          : "text-gray-300 hover:text-white hover:bg-white/6"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? "text-[#101114]" : "text-gray-400 group-hover:text-[#fcb907]"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#101114] opacity-80 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Admin User Card */}
        <div className="p-4 border-t border-white/10 bg-[#08090d]">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fcb907] to-[#d97706] text-[#101114] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate font-sans">
                  {user?.name || "Administrator"}
                </div>
                <div className="text-[10px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                  <span className="uppercase tracking-wider font-semibold text-emerald-300/90 font-mono">
                    {user?.role || "SUPER ADMIN"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out of Admin"
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky App Header */}
        <header className="h-20 bg-white border-b border-[#e7e9ee] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-[0_2px_16px_rgba(16,24,40,0.03)]">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#101114] hover:bg-[#f6f7f9] border border-[#e7e9ee] transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280] truncate">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={crumb.href} className="flex items-center gap-1.5 truncate">
                    {idx > 0 && <span className="text-gray-300">/</span>}
                    {isLast ? (
                      <span className="font-bold text-[#101114] truncate font-sans">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-[#101114] transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Session Expiry Badge */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] font-bold text-[#b45309]">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              <span>1h Session Active</span>
            </div>

            {/* View Live Store */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#101114] hover:bg-black text-white text-xs font-bold transition-all shadow-sm hover:shadow-md"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#fcb907]" />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
