"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  Users,
  DollarSign,
  Loader2,
  FileText,
  CheckCircle2,
} from "lucide-react";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "orders" | "customers" | "downloads">("sales");
  const [salesData, setSalesData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [salesRes, ordersRes, custRes] = await Promise.all([
        fetch("/api/admin/reports/sales"),
        fetch("/api/admin/reports/orders"),
        fetch("/api/admin/customers"),
      ]);

      if (salesRes.ok) {
        const sJson = await salesRes.json();
        if (sJson.success) setSalesData(sJson.report);
      }

      if (ordersRes.ok) {
        const oJson = await ordersRes.json();
        if (oJson.success) setOrders(oJson.orders || []);
      }

      if (custRes.ok) {
        const cJson = await custRes.json();
        if (cJson.success) setCustomers(cJson.customers || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#fcb907]">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Audit &amp; Management Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101114] tracking-tight">
            Reports &amp; Data Export Hub
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Reconciliation-ready financial sales reports, customer registers, and CSV audit exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#101114] border border-gray-300 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            <span>Print Report</span>
          </button>
          <a
            href={
              activeTab === "orders"
                ? "/api/admin/reports/export?type=orders"
                : activeTab === "customers"
                ? "/api/admin/customers/export"
                : activeTab === "downloads"
                ? "/api/admin/reports/export?type=downloads"
                : "/api/admin/reports/export?type=orders"
            }
            download
            className="inline-flex items-center gap-1.5 bg-[#101114] hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <Download className="w-4 h-4 text-[#fcb907]" />
            <span>Export Active Tab (CSV)</span>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "sales"
              ? "bg-[#fcb907] text-[#101114] shadow-xs"
              : "text-gray-600 hover:text-[#101114] hover:bg-gray-100"
          }`}
        >
          Sales &amp; Revenue Report
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#fcb907] text-[#101114] shadow-xs"
              : "text-gray-600 hover:text-[#101114] hover:bg-gray-100"
          }`}
        >
          Orders Register ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "customers"
              ? "bg-[#fcb907] text-[#101114] shadow-xs"
              : "text-gray-600 hover:text-[#101114] hover:bg-gray-100"
          }`}
        >
          Customer Directory ({customers.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
          <span className="text-xs font-mono font-bold">Generating Report Data...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: SALES REPORT */}
          {activeTab === "sales" && salesData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Gross Paid Sales</div>
                  <div className="text-2xl font-black text-[#101114]">
                    ${Number(salesData.grossRevenue || 0).toLocaleString()} USD
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Total Refunds</div>
                  <div className="text-2xl font-black text-purple-600">
                    ${Number(salesData.totalRefunds || 0).toLocaleString()} USD
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Net Revenue</div>
                  <div className="text-2xl font-black text-emerald-600">
                    ${Number(salesData.netRevenue || 0).toLocaleString()} USD
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-1">
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Average Order Value</div>
                  <div className="text-2xl font-black text-[#d97706]">
                    ${Math.round(salesData.aov || 0).toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Daily Sales Breakdown Table */}
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-gray-200 font-bold text-sm text-[#101114]">
                  Daily Sales Breakdown
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Paid Orders</th>
                      <th className="px-6 py-3 text-right">Gross Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(salesData.dailyBreakdown || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                          No daily transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      salesData.dailyBreakdown.map((row: any) => (
                        <tr key={row.date} className="hover:bg-gray-50">
                          <td className="px-6 py-3.5 font-mono font-bold text-[#101114]">{row.date}</td>
                          <td className="px-6 py-3.5 text-gray-700">{row.count}</td>
                          <td className="px-6 py-3.5 text-right font-black text-[#101114]">
                            ${row.amount.toLocaleString()} USD
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS REGISTER */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">Order Number</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Package Items</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-4 font-mono font-bold text-[#101114]">{ord.order_number}</td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(ord.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#101114]">{ord.customer_name}</div>
                          <div className="text-[11px] text-gray-500">{ord.customer_email}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {ord.order_items?.[0]?.title || "Blueprint Package"}
                          {ord.order_items?.length > 1 ? ` (+${ord.order_items.length - 1})` : ""}
                        </td>
                        <td className="px-5 py-4 font-black text-[#101114]">
                          ${Number(ord.total_amount).toLocaleString()} USD
                        </td>
                        <td className="px-5 py-4">
                          {ord.payment_status === "PAID" ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                              Paid
                            </span>
                          ) : ord.payment_status === "REFUNDED" ? (
                            <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                              Refunded
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/account/invoices/${ord.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[#d97706] font-bold hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER DIRECTORY */}
          {activeTab === "customers" && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">Customer Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Verified</th>
                      <th className="px-5 py-3.5">Orders</th>
                      <th className="px-5 py-3.5">Paid LTV</th>
                      <th className="px-5 py-3.5">Registered Date</th>
                      <th className="px-5 py-3.5 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-4 font-black text-[#101114]">{c.name}</td>
                        <td className="px-5 py-4 text-gray-600">{c.email}</td>
                        <td className="px-5 py-4">
                          {c.email_verified ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Yes
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">No</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-700 font-bold">{c.orderCount || 0}</td>
                        <td className="px-5 py-4 font-black text-[#d97706]">
                          ${Number(c.ltv || 0).toLocaleString()} USD
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="font-bold text-[#d97706] hover:underline"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
