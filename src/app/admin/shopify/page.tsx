"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  FileText,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function AdminShopifyMigrationPage() {
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/shopify/migrate")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setIsConfigured(json.isConfigured);
          if (json.storeDomain) setStoreDomain(json.storeDomain);
        }
      })
      .catch(() => {});
  }, []);

  const handleRunMigration = async () => {
    setRunning(true);
    setErrorMsg("");
    setSummary(null);

    try {
      const res = await fetch("/api/admin/shopify/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeDomain: storeDomain || undefined,
          accessToken: accessToken || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Migration process encountered an error.");
      }

      setSummary(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error during migration.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="border-b border-[#e7e9ee] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif">
          Shopify Data & SEO Migration Engine
        </h1>
        <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
          Synchronize products, collections, custom pages, blog posts, high-res images, and 301 URL redirects seamlessly into Supabase.
        </p>
      </div>

      {/* Configuration & Action Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[22px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e9ee]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#b45309] border border-amber-200 flex items-center justify-center font-bold shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#101114] font-serif">Shopify Store Pipeline</h2>
              <p className="text-xs text-[#6b7280] font-medium">
                {isConfigured
                  ? "✓ Live credentials detected from environment configuration"
                  : "Using pre-packaged architectural dataset for safe migration dry-runs"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunMigration}
            disabled={running}
            className="px-6 py-3.5 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Migrating Assets...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Full Migration</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Optional Custom Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5 font-mono">
              Shopify Store Domain (Optional Override)
            </label>
            <input
              type="text"
              placeholder="modularhome.myshopify.com"
              value={storeDomain}
              onChange={(e) => setStoreDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101114] mb-1.5 font-mono">
              Shopify Admin Access Token (Optional)
            </label>
            <input
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-xs text-[#101114] font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fcb907]"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#f8f9fa] border border-[#e7e9ee] flex items-center gap-3 text-xs text-[#6b7280]">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Idempotent architecture: Existing records are matched by <code className="text-[#101114] font-bold">shopify_id</code> and <code className="text-[#101114] font-bold">slug</code> to ensure zero data duplication.
          </span>
        </div>
      </div>

      {/* Migration Results Summary */}
      {summary && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#b45309] border border-amber-200 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-[#101114] font-serif">
                {summary.counts.productsImported + summary.counts.productsUpdated}
              </div>
              <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Models Synced</div>
            </div>

            <div className="bg-white p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#101114] border border-slate-200 flex items-center justify-center mx-auto mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-[#101114] font-serif">
                {summary.counts.collectionsImported + summary.counts.collectionsUpdated}
              </div>
              <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Collections Synced</div>
            </div>

            <div className="bg-white p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-[#101114] font-serif">
                {summary.counts.pagesImported + summary.counts.pagesUpdated}
              </div>
              <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Pages Synced</div>
            </div>

            <div className="bg-white p-5 rounded-[20px] border border-[#e7e9ee] shadow-[0_12px_35px_rgba(16,24,40,0.04)] text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black text-[#101114] font-serif">
                {summary.counts.blogsImported + summary.counts.blogsUpdated}
              </div>
              <div className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider">Articles Synced</div>
            </div>
          </div>

          {/* Execution Log Console */}
          <div className="bg-[#0b0d11] text-gray-200 rounded-[22px] p-6 shadow-2xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-gray-300">
                <Terminal className="w-4 h-4 text-[#fcb907]" />
                <span className="font-bold text-white">Migration Execution Log</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                {summary.status}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 pr-2">
              {summary.logs.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-gray-500 text-[10px] shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                      log.level === "SUCCESS"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : log.level === "WARN"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : log.level === "ERROR"
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {log.category}
                  </span>
                  <span
                    className={
                      log.level === "SUCCESS"
                        ? "text-emerald-300"
                        : log.level === "ERROR"
                        ? "text-red-400"
                        : "text-gray-300"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
