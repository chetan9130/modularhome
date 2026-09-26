"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Download,
  ShoppingBag,
  Clock,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Loader2,
  Sparkles,
  Layers,
  LayoutDashboard,
  Calendar,
  Lock,
  ChevronRight,
  HeadphonesIcon,
  RefreshCw,
} from "lucide-react";

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"overview" | "downloads" | "orders" | "profile">(
    (urlTab && ["overview", "downloads", "orders", "profile"].includes(urlTab))
      ? (urlTab as "overview" | "downloads" | "orders" | "profile")
      : "overview"
  );

  useEffect(() => {
    if (urlTab && ["overview", "downloads", "orders", "profile"].includes(urlTab)) {
      setActiveTab(urlTab as "overview" | "downloads" | "orders" | "profile");
    }
  }, [urlTab]);

  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Resend Verification State
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch("/api/customer/auth/profile"),
          fetch("/api/customer/orders"),
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.success && pData.profile) {
            setProfile(pData.profile);
            setName(pData.profile.name || "");
            setPhone(pData.profile.phone || "");
          }
        }

        if (ordersRes.ok) {
          const oData = await ordersRes.json();
          if (oData.success && Array.isArray(oData.orders)) {
            setOrders(oData.orders);
          }
        }
      } catch (err) {
        console.error("Failed to load customer data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      const res = await fetch("/api/customer/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMessage("Profile details updated successfully.");
        setProfile((prev: any) => ({ ...prev, name, phone }));
      } else {
        throw new Error(data.error?.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setProfileMessage(err?.message || "Update failed.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldownSeconds > 0 || isResending) return;
    setIsResending(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/customer/auth/resend-verification", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        const cd = data.error?.cooldownSeconds || 60;
        setCooldownSeconds(cd);
        setResendMsg({
          type: "error",
          message: data.error?.message || `Please wait ${cd} seconds before requesting again.`,
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Could not send verification email.");
      }

      setResendMsg({
        type: "success",
        message: data.message || "Fresh verification link sent to your email.",
      });
      setCooldownSeconds(60);
    } catch (err: any) {
      setResendMsg({
        type: "error",
        message: err?.message || "Could not send email. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
          Loading Client Portal...
        </span>
      </div>
    );
  }

  // Extract all download entitlements from orders
  const downloads: any[] = [];
  orders.forEach((ord) => {
    if (ord.payment_status === "PAID" && Array.isArray(ord.download_access)) {
      ord.download_access.forEach((dl: any) => {
        downloads.push({
          ...dl,
          orderNumber: ord.order_number,
          orderId: ord.id,
          orderDate: ord.created_at,
          orderItems: ord.order_items || [],
        });
      });
    }
  });

  const totalSpent = orders
    .filter((o) => o.payment_status === "PAID")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Just Verified Success Alert */}
      {justVerified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 shadow-sm animate-in zoom-in-95">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900">
                Email Address Verified!
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your customer account is now fully active with full blueprint downloading privileges.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
            Active Verified
          </span>
        </div>
      )}

      {/* Luxury Hero Banner */}
      <div className="bg-gradient-to-br from-[#101114] via-[#16181f] to-[#0b0d11] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fcb907]/15 text-[#fcb907] text-[11px] font-mono font-bold tracking-wider uppercase border border-[#fcb907]/30">
                <Sparkles className="w-3 h-3" />
                Customer Account
              </span>
              {profile?.email_verified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Action Required: Verify Email
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight leading-tight">
              Welcome back, <span className="text-[#fcb907]">{profile?.name || "Customer"}</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              Manage your licensed architectural blueprints, instant CAD/PDF downloads, tax invoices, and connect directly with factory building advisors.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap lg:flex-col sm:flex-row items-stretch gap-2.5 shrink-0">
            <Link
              href="/floor-plans"
              className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-center"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Floor Plans</span>
            </Link>
            <Link
              href="/quote"
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all border border-white/20 flex items-center justify-center gap-1.5 text-center"
            >
              <span>Request Turnkey Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Shimmer glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#fcb907]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Unverified Email Alert Box */}
      {!profile?.email_verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900">Your Email Is Not Verified Yet</h4>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Please verify your email address to ensure permanent license recovery, notifications of engineering revisions, and blueprint download access.
              </p>
              {resendMsg && (
                <div
                  className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${
                    resendMsg.type === "success" ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {resendMsg.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span>{resendMsg.message}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/verify-email"
              className="text-xs font-bold text-amber-900 hover:underline px-3 py-2"
            >
              Verify Page →
            </Link>
            <button
              onClick={handleResendVerification}
              disabled={isResending || cooldownSeconds > 0}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resend in {cooldownSeconds}s</span>
                </>
              ) : (
                <span>Resend Verification Email</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modern Navigation Pill Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/60 rounded-2xl w-full sm:w-max overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-[#101114] text-white shadow-md"
              : "text-stone-700 hover:text-[#101114] hover:bg-white/60"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-[#fcb907]" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("downloads")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "downloads"
              ? "bg-[#101114] text-white shadow-md"
              : "text-stone-700 hover:text-[#101114] hover:bg-white/60"
          }`}
        >
          <Download className="w-3.5 h-3.5 text-[#fcb907]" />
          <span>Purchased Blueprints ({downloads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "orders"
              ? "bg-[#101114] text-white shadow-md"
              : "text-stone-700 hover:text-[#101114] hover:bg-white/60"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#fcb907]" />
          <span>Orders &amp; Invoices ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profile"
              ? "bg-[#101114] text-white shadow-md"
              : "text-stone-700 hover:text-[#101114] hover:bg-white/60"
          }`}
        >
          <User className="w-3.5 h-3.5 text-[#fcb907]" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Licensed Blueprints</span>
                <div className="p-2 rounded-xl bg-amber-50 text-[#d97706]">
                  <Download className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-stone-900">{downloads.length}</div>
              <div className="text-xs text-stone-500">Ready for CAD/DWG &amp; stamped PDF download</div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Completed Orders</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-stone-900">{orders.length}</div>
              <div className="text-xs text-stone-500">Verified transactions on file</div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Total Investment</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-stone-900">${totalSpent.toLocaleString()} <span className="text-xs font-normal text-stone-400">USD</span></div>
              <div className="text-xs text-stone-500">Total architectural blueprints purchased</div>
            </div>
          </div>

          {/* Quick Access to Recent Blueprints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-stone-900 font-serif">Recent Blueprint Licenses</h2>
                <p className="text-xs text-stone-500">Instant access to your structural blueprints and engineering sets.</p>
              </div>
              {downloads.length > 0 && (
                <button
                  onClick={() => setActiveTab("downloads")}
                  className="text-xs font-bold text-[#d97706] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View all ({downloads.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {downloads.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#d97706] flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-stone-900">No blueprint sets licensed yet</h3>
                  <p className="text-xs text-stone-500">
                    Explore our engineered catalog of cabins, ADUs, modern modular homes, and barndominiums ready for building permit submittals.
                  </p>
                </div>
                <Link
                  href="/floor-plans"
                  className="inline-flex items-center gap-2 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Available Plans</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloads.slice(0, 4).map((dl) => {
                  const isExpired = new Date(dl.expires_at) < new Date();
                  const title = dl.orderItems[0]?.title || "Architectural Blueprint Construction Set";

                  return (
                    <div
                      key={dl.id}
                      className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#fcb907] transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-black text-stone-900 group-hover:text-[#d97706] transition-colors">
                            {title}
                          </h4>
                          <span className="bg-amber-50 text-[#b45309] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                            {dl.orderNumber}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Purchased {new Date(dl.orderDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Single-Build License
                        </span>
                        <a
                          href={`/api/downloads/${dl.download_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#101114] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-[#fcb907]" />
                          <span>Download ZIP</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Housing Advisor Support Box */}
          <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-stone-800">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#fcb907]">Need Builder Assistance?</div>
              <h3 className="text-base font-bold font-serif">Have questions about local permitting or turn-key fabrication?</h3>
              <p className="text-xs text-stone-300">Our engineering and construction specialists can help coordinate site work, foundation engineering, and modular delivery.</p>
            </div>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all border border-white/20 whitespace-nowrap text-center shrink-0"
            >
              Contact Engineering Team
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: DOWNLOADS */}
      {activeTab === "downloads" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-black text-stone-900 font-serif">Licensed Architectural Blueprints &amp; CAD Sets</h2>
            <p className="text-xs text-stone-500">Every plan includes full architectural sheets, steel framing details, and vector CAD files.</p>
          </div>

          {downloads.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-4">
              <Download className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-900">No blueprint licenses yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Purchased floor plans include lifetime license entitlement and direct instant downloads.
              </p>
              <Link
                href="/floor-plans"
                className="inline-block bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Explore Floor Plans Catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {downloads.map((dl) => {
                const isExpired = new Date(dl.expires_at) < new Date();
                const title = dl.orderItems[0]?.title || "Architectural Construction Blueprint Package";

                return (
                  <div
                    key={dl.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between space-y-5 hover:border-[#fcb907] transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d97706]">
                            Single-Build Licensed Plan
                          </span>
                          <h3 className="text-base font-black text-stone-900 leading-snug mt-0.5">
                            {title}
                          </h3>
                        </div>
                        <span className="bg-stone-100 text-stone-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-stone-200 shrink-0">
                          {dl.orderNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block">Purchased On</span>
                          <span className="font-bold text-stone-800">{new Date(dl.orderDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block">Download Count</span>
                          <span className="font-bold text-stone-800">{dl.download_count || 0} of {dl.max_downloads || 5} used</span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-500 flex items-center justify-between">
                        <span>Includes: Full DWG CAD + Stamped PDF Set</span>
                        <span className={isExpired ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                          {isExpired ? "Expired" : "Active License"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <Link
                        href={`/account/orders/${dl.orderId}`}
                        className="text-xs font-bold text-stone-600 hover:text-[#d97706]"
                      >
                        View Order Details
                      </Link>

                      <a
                        href={`/api/downloads/${dl.download_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all ${
                          isExpired
                            ? "bg-stone-100 text-stone-400 pointer-events-none"
                            : "bg-[#fcb907] hover:bg-[#e5a706] text-[#101114]"
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Blueprint ZIP</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-black text-stone-900 font-serif">Order History &amp; Official Invoices</h2>
            <p className="text-xs text-stone-500">Access full transaction receipts and printable municipal tax invoices.</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center text-xs text-stone-500">
              No orders found in your account history.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase font-mono text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4">Order Number</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Items / Plan Packages</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-stone-900">
                          {ord.order_number}
                        </td>
                        <td className="px-6 py-4 text-stone-500">
                          {new Date(ord.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 font-bold text-stone-900">
                          {ord.order_items?.[0]?.title || "Architectural Blueprint Package"}
                          {ord.order_items?.length > 1 ? ` (+${ord.order_items.length - 1} more)` : ""}
                        </td>
                        <td className="px-6 py-4 font-black text-stone-900 font-serif text-sm">
                          ${Number(ord.total_amount).toLocaleString()} <span className="text-[10px] font-mono text-stone-400">USD</span>
                        </td>
                        <td className="px-6 py-4">
                          {ord.payment_status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : ord.payment_status === "REFUNDED" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                              Refunded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                          <Link
                            href={`/account/orders/${ord.id}`}
                            className="inline-flex items-center gap-1 font-bold text-[#d97706] hover:underline text-xs"
                          >
                            Details →
                          </Link>
                          <Link
                            href={`/account/invoices/${ord.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold"
                            title="Open Official Tax Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-stone-400" />
                            <span>Invoice</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-200">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-stone-900 font-serif">Contact &amp; Account Settings</h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Your registered details are attached to your architectural licensing certificates and municipal permit documents.
            </p>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            {profileMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ""}
                    className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-500 cursor-not-allowed"
                  />
                  {profile?.email_verified ? (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  ) : (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
            Loading Client Portal...
          </span>
        </div>
      }
    >
      <CustomerDashboardContent />
    </Suspense>
  );
}
