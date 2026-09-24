"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Shield,
  Loader2,
  RefreshCw,
  Mail,
  Phone,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState("ALL");

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/customers?search=${encodeURIComponent(search)}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      if (verifiedFilter !== "ALL") url += `&verified=${verifiedFilter === "VERIFIED"}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, verifiedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#fcb907]">
            <Users className="w-4 h-4" />
            <span>Ecommerce CRM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101114] tracking-tight">
            Customer Accounts
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage registered homeowners, purchased blueprint licenses, verification states, and account activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/customers/export"
            download
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#101114] border border-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#d97706]" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={fetchCustomers}
            className="p-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-gray-600 transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Accounts</div>
            <div className="text-2xl font-black text-[#101114]">{metrics.total}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Verified Emails</div>
            <div className="text-2xl font-black text-emerald-600">{metrics.verified}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Paying Customers</div>
            <div className="text-2xl font-black text-[#d97706]">{metrics.purchasers}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Status</div>
            <div className="text-2xl font-black text-[#101114]">{metrics.active}</div>
          </div>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907]"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907]"
          >
            <option value="ALL">All Verification States</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNVERIFIED">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#fcb907]" />
          <span className="text-xs font-mono font-bold">Loading Customers...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-2">
          <Users className="w-8 h-8 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#101114]">No Customers Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Customers will automatically be listed here upon registering, verifying their email, or completing checkout.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status &amp; Verification</th>
                  <th className="px-5 py-3.5">Orders &amp; LTV</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-black text-[#101114]">{c.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{c.id}</div>
                    </td>
                    <td className="px-5 py-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {c.status === "ACTIVE" ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                            Disabled
                          </span>
                        )}

                        {c.email_verified ? (
                          <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Unverified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#101114]">
                        {c.orderCount || 0} {c.orderCount === 1 ? "order" : "orders"}
                      </div>
                      <div className="text-[11px] font-black text-[#d97706]">
                        ${Number(c.ltv || 0).toLocaleString()} USD LTV
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1 font-black text-xs text-[#d97706] hover:text-[#b45309] hover:underline"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
  );
}
