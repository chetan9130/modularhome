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
        throw new Error(json.error?.message || "Migration process failed.");
      }

      setSummary(json.data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-stone-900">Shopify Data & SEO Migration Engine</h1>
        <p className="text-xs text-stone-500">
          Seamlessly sync and migrate products, collections, pages, blogs, images, and 301 URL redirects into Supabase
        </p>
      </div>

      {/* Configuration & Action Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Shopify Store Connection</h2>
              <p className="text-xs text-stone-500">
                {isConfigured
                  ? "✓ Live credentials detected in environment variables"
                  : "Using pre-packaged sandbox dataset for safe migration dry-runs"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunMigration}
            disabled={running}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Migrating Shopify Assets...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Execute Full Migration
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Optional Custom Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Shopify Store Domain (Optional Override)
            </label>
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              value={storeDomain}
              onChange={(e) => setStoreDomain(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Shopify Admin Access Token (Optional)
            </label>
            <input
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3 text-xs text-stone-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Idempotent migration: Existing items are updated by <code>shopify_id</code> and <code>slug</code> without creating duplicates.
          </span>
        </div>
      </div>

      {/* Migration Results Summary */}
      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm text-center">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {summary.counts.productsImported + summary.counts.productsUpdated}
              </div>
              <div className="text-[11px] font-semibold text-stone-400">Products Synced</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm text-center">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {summary.counts.collectionsImported + summary.counts.collectionsUpdated}
              </div>
              <div className="text-[11px] font-semibold text-stone-400">Collections Synced</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {summary.counts.pagesImported + summary.counts.pagesUpdated}
              </div>
              <div className="text-[11px] font-semibold text-stone-400">Pages Synced</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-stone-900">
                {summary.counts.blogsImported + summary.counts.blogsUpdated}
              </div>
              <div className="text-[11px] font-semibold text-stone-400">Articles Synced</div>
            </div>
          </div>

          {/* Logs Console */}
          <div className="bg-stone-950 text-stone-200 rounded-3xl p-6 shadow-2xl border border-stone-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-stone-400">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-white">Migration Execution Log</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                {summary.status}
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 scrollbar-thin">
              {summary.logs.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-stone-500 text-[10px]">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 rounded ${
                      log.level === "SUCCESS"
                        ? "bg-emerald-950 text-emerald-400"
                        : log.level === "WARN"
                        ? "bg-amber-950 text-amber-400"
                        : log.level === "ERROR"
                        ? "bg-red-950 text-red-400"
                        : "bg-stone-800 text-stone-300"
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
                        : "text-stone-300"
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
