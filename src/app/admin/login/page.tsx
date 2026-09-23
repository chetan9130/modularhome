"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles, KeyRound } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/admin";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("admin@modularhome.com");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, totpCode: require2FA ? totpCode : undefined }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.require2FA) {
          setRequire2FA(true);
          setIsLoading(false);
          return;
        }
        setError(data.error?.message || "Invalid administrator credentials.");
        setIsLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Network error. Please verify your connection.");
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@modularhome.com");
    setPassword("admin@26");
    setRequire2FA(false);
    setTotpCode("");
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_20px_50px_rgba(16,24,40,0.08)] rounded-[24px] border border-[#e7e9ee] space-y-6 backdrop-blur-md">
      {reason === "session_expired" && !error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs animate-in fade-in font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>Your 1-hour admin session has expired. You have been automatically logged out. Please log in again.</span>
        </div>
      )}

      {reason === "unauthorized" && !error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs animate-in fade-in font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>Unauthorized access detected. Session cleared. Please log in with authorized credentials.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs animate-in fade-in font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {!require2FA ? (
          <>
            <div>
              <label className="block text-xs font-bold text-[#101114] uppercase tracking-wider mb-2 font-mono">
                Administrator Email
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b7280]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@modularhome.com"
                  className="block w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-[#101114] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcb907] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#101114] uppercase tracking-wider font-mono">
                  Master Password
                </label>
                <span className="text-[11px] text-[#6b7280]">1-Hour Secure Session</span>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b7280]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-[#101114] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcb907] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span>Two-Factor Authentication Required</span>
              </span>
              <span>Open your authenticator app (Google Authenticator, Authy, Apple) and enter the 6-digit verification code.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] uppercase tracking-wider mb-2 font-mono">
                6-Digit TOTP / Backup Code
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength={10}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="e.g. 482910"
                className="block w-full px-4 py-3 bg-[#f8f9fa] border border-[#d5d9e0] rounded-xl text-[#101114] text-lg font-mono font-black text-center tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-[#fcb907] focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isLoading || (require2FA && !totpCode)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-black text-[#101114] bg-[#fcb907] hover:bg-[#e5a706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fcb907] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Secure Token...</span>
              </>
            ) : require2FA ? (
              <>
                <span>Verify Code & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Management Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {require2FA && (
            <button
              type="button"
              onClick={() => {
                setRequire2FA(false);
                setTotpCode("");
              }}
              className="w-full py-2 text-xs font-bold text-[#6b7280] hover:text-[#101114] transition-colors"
            >
              ← Back to credentials
            </button>
          )}
        </div>
      </form>

      {/* Developer Demo Quick Fill */}
      <div className="pt-5 border-t border-[#e7e9ee] flex items-center justify-between gap-2">
        <div className="text-[11px] text-[#6b7280] font-mono truncate">
          admin@modularhome.com
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b45309] hover:underline cursor-pointer shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Auto-fill Demo</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0b0d11] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#fcb907] selection:text-[#101114]">
      {/* Background Architectural Blueprint Pattern and Glowing Gradients */}
      <div className="absolute inset-0 drawing-bg opacity-5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#fcb907]/10 via-[#d97706]/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Top Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#fcb907] via-[#d97706] to-[#fcb907]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <div className="bg-white/95 border border-white/20 p-3 rounded-2xl inline-flex items-center gap-3 shadow-2xl backdrop-blur-xs">
            <Image
              src="/finallogo.avif"
              alt="ModularHome Logo"
              width={160}
              height={36}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
          </div>
        </Link>

        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#fcb907] text-[11px] font-mono font-bold uppercase tracking-widest backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#fcb907]" />
            <span>Master Control Portal</span>
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
          Executive Authentication
        </h2>
        <p className="text-xs text-gray-400 font-medium">
          Precision Steel Modular Systems CMS & Engineering Database
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white p-8 rounded-2xl text-[#101114] text-center font-medium">
              Loading security portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
