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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#101114] flex flex-col font-sans">
      {/* Sleek Sub-Header & Breadcrumb Bar */}
      <div className="bg-white border-b border-[#e7e9ee]/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Breadcrumbs & Client Portal Title */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#6b7280]">
            <Link href="/" className="hover:text-[#d97706] transition-colors">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-bold text-[#101114] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fcb907] inline-block animate-pulse" />
              Client Portal
            </span>
          </div>

          {/* Right: Customer Info & Logout */}
          {customer && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#fcb907]/20 text-[#d97706] font-black flex items-center justify-center text-xs">
                  {customer.name ? customer.name.charAt(0).toUpperCase() : "H"}
                </div>
                <div>
                  <span className="font-bold text-[#101114]">{customer.name}</span>
                  <span className="text-gray-400 text-[11px] ml-1.5 hidden md:inline">
                    ({customer.email})
                  </span>
                </div>
              </div>

              <div className="h-4 w-px bg-gray-200 hidden sm:block" />

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                title="Sign out of customer portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Account View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
