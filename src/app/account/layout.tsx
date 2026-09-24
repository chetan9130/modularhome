"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  Download,
  LogOut,
  ShieldCheck,
  Home,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Phone,
} from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage =
    pathname === "/account/login" ||
    pathname === "/account/signup" ||
    pathname === "/account/verify" ||
    pathname === "/account/forgot-password" ||
    pathname === "/account/reset-password";

  useEffect(() => {
    let isMounted = true;
    fetch("/api/customer/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.user) {
          setCustomer(data.user);
        } else {
          setCustomer(null);
          if (!isAuthPage && !pathname.includes("/invoices/")) {
            router.push(`/account/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setCustomer(null);
        if (!isAuthPage && !pathname.includes("/invoices/")) {
          router.push(`/account/login?redirect=${encodeURIComponent(pathname)}`);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, isAuthPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/customer/auth/logout", { method: "POST" });
      setCustomer(null);
      router.push("/account/login");
      router.refresh();
    } catch {}
  };

  if (isAuthPage || pathname.includes("/invoices/")) {
    return <>{children}</>;
  }

  const navLinks = [
    { label: "Dashboard", href: "/account", icon: Home },
    { label: "Orders & Blueprints", href: "/account#orders", icon: Download },
    { label: "Profile & Settings", href: "/account#profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#101114] flex flex-col font-sans pt-20">
      {/* Customer Header Bar */}
      <header className="bg-[#101114] text-white border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white/95 p-1.5 rounded-lg border border-white/20">
                <Image
                  src="/finallogo.avif"
                  alt="ModularHome Logo"
                  width={110}
                  height={24}
                  className="h-5 w-auto object-contain"
                />
              </div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#fcb907] uppercase hidden sm:inline">
                / Portal
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#fcb907] text-[#101114]"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 pr-3 border-r border-white/10">
              <Phone className="w-3.5 h-3.5 text-[#fcb907]" />
              <span>(812) 595-4033</span>
            </div>

            {customer ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white truncate max-w-[150px]">
                    {customer.name}
                  </div>
                  <div className="text-[10px] text-[#fcb907] font-mono">
                    {customer.email_verified ? "Verified Customer" : "Unverified Email"}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-gray-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : null}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#181a20] px-4 py-3 border-t border-white/10 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-200 hover:bg-white/10"
              >
                <item.icon className="w-4 h-4 text-[#fcb907]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Account View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
