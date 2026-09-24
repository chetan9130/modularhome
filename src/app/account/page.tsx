"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  RefreshCw,
  HelpCircle,
} from "lucide-react";

export default function CustomerDashboardPage() {
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
  const [resendMsg, setResendMsg] = useState<string | null>(null);

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
        setProfileMessage("Profile updated successfully.");
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
    setIsResending(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/customer/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      setResendMsg(data.message || "Verification link sent to your email.");
    } catch {
      setResendMsg("Could not send email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
          Loading Customer Portal...
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#101114] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#fcb907]">
                Customer Account
              </span>
              {profile?.email_verified ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  <AlertCircle className="w-3 h-3" />
                  Unverified Email
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {profile?.name || "Homeowner"}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Access your licensed CAD &amp; PDF blueprints, track previous quotation requests, download invoices, and connect with engineering advisors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/floor-plans"
              className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
            <Link
              href="/quote"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all border border-white/20"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#fcb907]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Unverified Email Alert */}
      {!profile?.email_verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Email Verification Required</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Please verify your email address to ensure full lifetime access to future blueprint updates and engineering revisions.
              </p>
              {resendMsg && (
                <p className="text-xs font-bold text-emerald-700 mt-1">{resendMsg}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</div>
          <div className="text-2xl font-black text-[#101114]">{orders.length}</div>
          <div className="text-[11px] text-gray-400">Architectural blueprint purchases</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Licensed Blueprints</div>
          <div className="text-2xl font-black text-[#d97706]">{downloads.length}</div>
          <div className="text-[11px] text-gray-400">Ready for instant CAD/PDF download</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Investment</div>
          <div className="text-2xl font-black text-[#101114]">${totalSpent.toLocaleString()} USD</div>
          <div className="text-[11px] text-gray-400">Paid engineering &amp; plan packages</div>
        </div>
      </div>

      {/* Purchased Blueprints & Downloads */}
      <section id="downloads" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#fcb907]" />
            <h2 className="text-lg font-black text-[#101114] tracking-tight">
              Purchased Architectural Plans &amp; CAD Kits
            </h2>
          </div>
        </div>

        {downloads.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center space-y-3">
            <Download className="w-8 h-8 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-[#101114]">No blueprint downloads yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              When you purchase a downloadable construction floor plan, your secure license and CAD files will appear here with unlimited 7-day direct downloads.
            </p>
            <Link
              href="/floor-plans"
              className="inline-block bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              Explore Floor Plans Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.map((dl) => {
              const isExpired = new Date(dl.expires_at) < new Date();
              const remaining = Math.max(0, (dl.max_downloads || 5) - (dl.download_count || 0));
              const title = dl.orderItems[0]?.title || "Architectural Blueprint Construction Set";

              return (
                <div
                  key={dl.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#fcb907] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black text-[#101114] leading-snug">{title}</h4>
                      <span className="bg-amber-50 text-[#b45309] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                        {dl.orderNumber}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        Purchased on {new Date(dl.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                      <span>Download Attempts:</span>
                      <span className="font-bold text-[#101114]">
                        {dl.download_count || 0} / {dl.max_downloads || 5} used
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-400">
                      {isExpired ? (
                        <span className="text-red-500 font-bold">Link Expired</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Active License</span>
                      )}
                    </div>
                    <a
                      href={`/api/downloads/${dl.download_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all ${
                        isExpired
                          ? "bg-gray-100 text-gray-400 pointer-events-none"
                          : "bg-[#fcb907] hover:bg-[#e5a706] text-[#101114]"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Blueprint PDF/CAD</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Order History */}
      <section id="orders" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#fcb907]" />
            <h2 className="text-lg font-black text-[#101114] tracking-tight">Order History &amp; Receipts</h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-xs text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3">Order Number</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Blueprint Package</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#101114]">
                        {ord.order_number}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[#101114]">
                        {ord.order_items?.[0]?.title || "Blueprint Set"}
                        {ord.order_items?.length > 1 ? ` (+${ord.order_items.length - 1} more)` : ""}
                      </td>
                      <td className="px-5 py-3.5 font-black text-[#101114]">
                        ${Number(ord.total_amount).toLocaleString()} USD
                      </td>
                      <td className="px-5 py-3.5">
                        {ord.payment_status === "PAID" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : ord.payment_status === "REFUNDED" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/account/orders/${ord.id}`}
                          className="inline-flex items-center gap-1 font-bold text-[#d97706] hover:underline"
                        >
                          View Order →
                        </Link>
                        <Link
                          href={`/account/invoices/${ord.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-gray-500 hover:text-[#101114]"
                          title="View Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Profile & Settings */}
      <section id="profile" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#fcb907]" />
            <h2 className="text-lg font-black text-[#101114] tracking-tight">Account Details</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Update your contact preferences used for blueprint licensing stamps and project coordination.
          </p>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          {profileMessage && (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#101114]">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] focus:bg-white focus:outline-none focus:border-[#fcb907]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] focus:bg-white focus:outline-none focus:border-[#fcb907]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address (Authentication)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                To update your security email address, contact support at support@modularhome.com.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Customer Support Helper */}
      <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#fcb907] shadow-xs">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#101114]">Need Engineering Assistance?</h4>
            <p className="text-xs text-gray-500">
              Our architectural specialists can assist with foundation engineering stamps and builder customization.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="bg-white hover:bg-gray-50 text-[#101114] font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-300 transition-colors shrink-0 text-center"
        >
          Contact Architectural Support
        </Link>
      </div>
    </div>
  );
}
