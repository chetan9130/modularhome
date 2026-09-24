"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  Percent,
  Calendar,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Loader2,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("30d"); // 'today', '7d', '30d', 'all'

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      let startDate = "";
      const now = new Date();
      if (range === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (range === "7d") {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (range === "30d") {
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const url = startDate ? `/api/admin/analytics?startDate=${encodeURIComponent(startDate)}` : "/api/admin/analytics";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#101114]">
          Aggregating Ecommerce Analytics...
        </span>
      </div>
    );
  }

  const d = data || {
    grossRevenue: 0,
    netRevenue: 0,
    totalRefunds: 0,
    totalPaidOrders: 0,
    totalOrders: 0,
    aov: 0,
    registeredCustomers: 0,
    verifiedCustomers: 0,
    conversionRate: 0,
    downloadsCount: 0,
    topFloorPlans: [],
    dailyRevenue: [],
    funnel: { catalogViews: 0, cartAdds: 0, checkoutsStarted: 0, ordersCompleted: 0 },
    attribution: [],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#fcb907]">
            <TrendingUp className="w-4 h-4" />
            <span>Financial &amp; Funnel Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101114] tracking-tight">
            Ecommerce Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Authoritative revenue analytics, customer conversion funnel, and architectural package sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="bg-white border border-gray-300 rounded-xl p-1 flex items-center shadow-xs">
            <button
              onClick={() => setRange("today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "today" ? "bg-[#101114] text-[#fcb907]" : "text-gray-600 hover:text-[#101114]"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "7d" ? "bg-[#101114] text-[#fcb907]" : "text-gray-600 hover:text-[#101114]"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "30d" ? "bg-[#101114] text-[#fcb907]" : "text-gray-600 hover:text-[#101114]"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setRange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "all" ? "bg-[#101114] text-[#fcb907]" : "text-gray-600 hover:text-[#101114]"
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-gray-600 transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Paid Revenue */}
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:border-[#fcb907] transition-all group block space-y-2"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#d97706] flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#101114]">
            ${d.grossRevenue.toLocaleString()} <span className="text-xs font-normal text-gray-400">USD</span>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
            <span>Net: ${d.netRevenue.toLocaleString()}</span>
            <span className="text-purple-600 font-bold">Refunds: ${d.totalRefunds.toLocaleString()}</span>
          </div>
        </Link>

        {/* Paid Orders */}
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:border-[#fcb907] transition-all group block space-y-2"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Orders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#101114]">{d.totalPaidOrders}</div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
            <span>Total Placed: {d.totalOrders}</span>
            <span className="text-emerald-600 font-bold">
              {d.totalOrders > 0 ? Math.round((d.totalPaidOrders / d.totalOrders) * 100) : 0}% Paid
            </span>
          </div>
        </Link>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Order (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#101114]">
            ${Math.round(d.aov).toLocaleString()} <span className="text-xs font-normal text-gray-400">USD</span>
          </div>
          <div className="text-[11px] text-gray-500 pt-1">
            Per paid construction blueprint license
          </div>
        </div>

        {/* Registered Customers */}
        <Link
          href="/admin/customers"
          className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:border-[#fcb907] transition-all group block space-y-2"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#101114]">{d.registeredCustomers}</div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
            <span>Verified: {d.verifiedCustomers}</span>
            <span className="text-[#d97706] font-bold">Manage Accounts →</span>
          </div>
        </Link>
      </div>

      {/* Conversion Funnel & Daily Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#101114] tracking-tight">
              Ecommerce Conversion Funnel
            </h3>
            <p className="text-xs text-gray-500">
              Customer progression from catalog browsing to verified blueprint purchase.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-600">1. Blueprint Catalog Views</span>
                <span className="font-mono font-bold text-[#101114]">{d.funnel.catalogViews}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-700 h-full w-full" />
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-600">2. Added to Cart</span>
                <span className="font-mono font-bold text-[#101114]">{d.funnel.cartAdds}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full"
                  style={{
                    width: `${d.funnel.catalogViews > 0 ? (d.funnel.cartAdds / d.funnel.catalogViews) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-gray-600">3. Checkout Initiated</span>
                <span className="font-mono font-bold text-[#101114]">{d.funnel.checkoutsStarted}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full"
                  style={{
                    width: `${d.funnel.catalogViews > 0 ? (d.funnel.checkoutsStarted / d.funnel.catalogViews) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-black text-emerald-900">4. Verified Paid Orders</span>
                <span className="font-mono font-black text-emerald-800">{d.funnel.ordersCompleted}</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full"
                  style={{
                    width: `${d.funnel.catalogViews > 0 ? (d.funnel.ordersCompleted / d.funnel.catalogViews) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Funnel Conversion Rate</span>
            <span className="text-lg font-black text-[#d97706]">{d.conversionRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Top-Selling Architectural Blueprint Packages & Daily Revenue (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Floor Plans */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#101114] tracking-tight">
                  Top-Selling Architectural Blueprints
                </h3>
                <p className="text-xs text-gray-500">
                  Performance per construction floor plan package.
                </p>
              </div>
              <Link
                href="/admin/floor-plans"
                className="text-xs font-bold text-[#d97706] hover:underline"
              >
                Manage Plans →
              </Link>
            </div>

            {d.topFloorPlans.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl">
                No blueprint sales recorded in this timeframe.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {d.topFloorPlans.map((plan: any, idx: number) => (
                  <div key={plan.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-black text-xs text-[#101114]">{plan.title}</div>
                        <div className="text-[11px] text-gray-500">{plan.units} licenses purchased</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-[#101114]">
                        ${plan.revenue.toLocaleString()} USD
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acquisition Attribution */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-[#101114] tracking-tight">
              Traffic &amp; Acquisition Attribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {d.attribution.map((attr: any) => (
                <div key={attr.source} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {attr.source.replace(/_/g, " ")}
                  </div>
                  <div className="text-lg font-black text-[#101114]">{attr.count} orders</div>
                  <div className="text-[11px] text-[#d97706] font-bold">
                    ${attr.revenue.toLocaleString()} USD
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
