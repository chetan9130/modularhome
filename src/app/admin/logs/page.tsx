"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Clock,
  User,
  Shield,
  FileText,
  Layers,
  ShoppingBag,
} from "lucide-react";

interface ActivityLog {
  id: string;
  user_name?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/logs", window.location.origin);
      if (filterAction !== "ALL") url.searchParams.set("action", filterAction);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
      }
    } catch (e) {
      console.error("Error loading activity logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (log.description || "").toLowerCase().includes(q) ||
      (log.user_name || "").toLowerCase().includes(q) ||
      (log.action || "").toLowerCase().includes(q) ||
      (log.entity_type || "").toLowerCase().includes(q)
    );
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("LOCKOUT") || action.includes("FAILED")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (action.includes("CREATE") || action.includes("SUCCESS") || action.includes("ENABLE")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    }
    if (action.includes("UPDATE") || action.includes("EDIT")) {
      return "bg-amber-50 text-amber-800 border-amber-200";
    }
    return "bg-blue-50 text-blue-800 border-blue-200";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e9ee] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-[#fcb907]" />
            <span>Audit Trail & Activity Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
            Immutable administrative event stream recording authentication attempts, catalog updates, price modifications, and security actions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e7e9ee] bg-white hover:bg-gray-50 text-[#101114] text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-[#d97706]" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[18px] border border-[#e7e9ee] shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Filter logs by keyword, user, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6b7280]">Filter Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907] font-bold"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">Login Success</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="PRODUCT_UPDATED">Model Updated</option>
            <option value="2FA_ENABLED">2FA Enabled</option>
            <option value="USER_CREATED">User Created</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      {isLoading ? (
        <div className="py-24 text-center text-[#6b7280] text-xs flex flex-col items-center gap-2 font-medium">
          <Loader2 className="w-8 h-8 animate-spin text-[#fcb907]" />
          <span>Loading activity logs...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-[20px] p-16 text-center text-[#6b7280] text-xs border border-[#e7e9ee] font-medium shadow-xs">
          No activity logs recorded matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-[#e7e9ee] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#e7e9ee]">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-[#fcfcfd] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold font-mono uppercase ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-[#101114]">
                      {log.user_name || "Admin"}
                    </span>
                    {log.user_role && (
                      <span className="text-[10px] font-mono text-[#6b7280] bg-gray-100 px-1.5 py-0.5 rounded">
                        {log.user_role}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#101114] font-medium leading-relaxed">
                    {log.description}
                  </p>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-[11px] font-mono text-[#6b7280] bg-[#f8f9fa] p-2 rounded-lg inline-block">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] font-mono text-[#6b7280] shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#6b7280]" />
                    <span>{log.created_at ? new Date(log.created_at).toLocaleString() : "Just now"}</span>
                  </span>
                  {log.ip_address && (
                    <span className="text-[10px] text-[#6b7280] mt-0.5">IP: {log.ip_address}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
