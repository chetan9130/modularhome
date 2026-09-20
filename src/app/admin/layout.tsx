"use client";

import { useState, useEffect } from "react";
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
      group: "Website CMS & Sync",
      items: [
        { label: "Global Settings", href: "/admin/settings", icon: Globe },
        { label: "Pages", href: "/admin/pages", icon: FileText },
        { label: "Page Sections", href: "/admin/sections", icon: Layers },
        { label: "Shopify Migration", href: "/admin/shopify", icon: RefreshCw },
      ],
    },
    {
      group: "Catalogue & E-Commerce",
      items: [
        { label: "Models & Products", href: "/admin/products", icon: Home },
        { label: "Collections", href: "/admin/collections", icon: FolderOpen },
        { label: "Floor Plans (Digital)", href: "/admin/floor-plans", icon: Download },
      ],
    },
    {
      group: "Transactions & CRM",
      items: [
        { label: "Blueprint Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Leads & Prospects", href: "/admin/leads", icon: Users },
        { label: "Quotations", href: "/admin/quotations", icon: FileSpreadsheet },
      ],
    },
    {
      group: "Content & Media",
      items: [
        { label: "Blogs & Articles", href: "/admin/blogs", icon: BookOpen },
        { label: "YouTube Manager", href: "/admin/videos", icon: Video },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex text-[#101114]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#101114] text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-5 border-b border-white/10 bg-[#0c0d10]">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/finallogo.avif"
              alt="ModularHome Logo"
              width={140}
              height={32}
              className="h-7 sm:h-8 w-auto object-contain bg-white/95 px-2 py-1 rounded-md"
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {navSections.map((group) => (
            <div key={group.group}>
              <div className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-orange-600 text-white shadow-md shadow-orange-950/40"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-75" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Admin Info & Logout */}
        <div className="p-3 border-t border-white/10 bg-[#0a0b0d]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="min-w-0 flex-1 pr-2">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || "Administrator"}
              </div>
              <div className="text-[10px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="uppercase tracking-wider font-semibold">{user?.role || "ADMIN"}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Bar */}
        <header className="h-18 bg-white border-b border-[#e7e9ee] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-[#f6f7f9] border border-[#e7e9ee]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-[#d97706] border border-red-200 text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin CMS</span>
              </span>
              <span className="text-xs text-[#6b7280] hidden md:inline font-medium">
                • Precision Steel Modular Management
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#d5d9e0] hover:bg-[#f6f7f9] text-xs font-bold text-[#101114] shadow-2xs transition-all"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#d97706]" />
            </Link>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
