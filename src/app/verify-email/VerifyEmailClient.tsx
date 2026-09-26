"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Send,
  HelpCircle,
} from "lucide-react";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email") || "";
  const registeredParam = searchParams.get("registered") === "true";
  const errorParam = searchParams.get("error");

  const [status, setStatus] = useState<"INITIAL" | "VERIFYING" | "SUCCESS" | "ERROR">(
    tokenParam ? "VERIFYING" : "INITIAL"
  );
  const [manualToken, setManualToken] = useState("");
  const [targetEmail, setTargetEmail] = useState(emailParam);
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Parse error query param on load
  useEffect(() => {
    if (errorParam && !tokenParam) {
      setStatus("ERROR");
      if (errorParam === "expired_token" || errorParam === "expired") {
        setMessage("Your verification link has expired (valid for 24 hours). Please request a new link below.");
      } else if (errorParam === "invalid_token" || errorParam === "invalid") {
        setMessage("Invalid verification link. Please check your email or request a new one.");
      } else if (errorParam === "missing_token") {
        setMessage("Verification token was missing from your request. Please use the link sent to your email.");
      } else {
        setMessage(decodeURIComponent(errorParam));
      }
    }
  }, [errorParam, tokenParam]);

  // Cooldown countdown timer
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

  // Execute verification against API
  const executeVerify = async (tokenToUse: string) => {
    setStatus("VERIFYING");
    setMessage("");
    setResendStatus(null);

    try {
      const res = await fetch("/api/customer/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToUse.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid or expired verification token.");
      }

      setStatus("SUCCESS");
      setMessage(data.message || "Your email address has been verified successfully!");

      // Auto redirect to account after 2 seconds
      setTimeout(() => {
        router.push("/account?verified=true");
      }, 2000);
    } catch (err: any) {
      setStatus("ERROR");
      setMessage(err?.message || "Verification failed. Please try again.");
    }
  };

  // Auto trigger verification if token query param present
  useEffect(() => {
    if (tokenParam) {
      executeVerify(tokenParam);
    }
  }, [tokenParam]);

  // Handle Resend Verification
  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cooldownSeconds > 0 || isResending) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      const res = await fetch("/api/customer/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail ? targetEmail.trim() : undefined }),
      });

      const data = await res.json();

      if (res.status === 429) {
        const cd = data.error?.cooldownSeconds || 60;
        setCooldownSeconds(cd);
        setResendStatus({
          type: "error",
          message: data.error?.message || `Please wait ${cd} seconds before requesting again.`,
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Could not resend email.");
      }

      setResendStatus({
        type: "success",
        message: data.message || "A fresh verification link has been sent to your email.",
      });
      setCooldownSeconds(60); // 60s cooldown
    } catch (err: any) {
      setResendStatus({
        type: "error",
        message: err?.message || "Could not send verification email. Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-10 space-y-6 text-center">
      {/* Brand */}
      <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
        <Image
          src="/finallogo.avif"
          alt="ModularHome"
          width={160}
          height={36}
          className="h-8 w-auto mx-auto object-contain"
          priority
        />
      </Link>

      {/* STATE 1: Verifying in progress */}
      {status === "VERIFYING" && (
        <div className="py-8 space-y-4 animate-in fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-[#fcb907] mx-auto" />
          <h2 className="text-2xl font-black text-[#101114]">Verifying Your Email...</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
            Please wait while we confirm your security verification token.
          </p>
        </div>
      )}

      {/* STATE 2: Verification Success */}
      {status === "SUCCESS" && (
        <div className="py-6 space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#101114]">Email Confirmed!</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-sm mx-auto">{message}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-pulse text-amber-600" />
            <span>Redirecting to your customer dashboard...</span>
          </div>
          <Link
            href="/account?verified=true"
            className="inline-flex items-center gap-2 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all"
          >
            <span>Enter Customer Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* STATE 3: Prompt to Check Inbox / Resend / Manual Entry */}
      {(status === "INITIAL" || status === "ERROR") && (
        <div className="space-y-6">
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-[#d97706] flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#101114]">
              {registeredParam ? "Verify Your Email Address" : "Check Your Inbox"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {targetEmail ? (
                <>
                  We sent a verification link to{" "}
                  <strong className="text-[#101114] font-bold">{targetEmail}</strong>. Click the link in the email to activate your customer account.
                </>
              ) : (
                "Please click the verification link sent to your email address to activate your customer account."
              )}
            </p>
          </div>

          {/* Error Alert */}
          {status === "ERROR" && message && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2.5 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{message}</span>
            </div>
          )}

          {/* Resend Status Message */}
          {resendStatus && (
            <div
              className={`p-4 rounded-2xl text-xs font-medium text-left flex items-start gap-2.5 animate-in fade-in ${
                resendStatus.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {resendStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{resendStatus.message}</span>
            </div>
          )}

          {/* Resend Verification Action with Cooldown */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Didn&apos;t receive the email?
              </span>
              <span className="text-[11px] text-gray-400">Check spam / junk</span>
            </div>

            {!targetEmail && (
              <input
                type="email"
                placeholder="Enter your registered email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907]"
              />
            )}

            <button
              type="button"
              onClick={() => handleResend()}
              disabled={isResending || cooldownSeconds > 0}
              className="w-full bg-[#101114] hover:bg-[#20232a] text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#fcb907]" />
                  <span>Sending fresh link...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resend available in {cooldownSeconds}s</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#fcb907]" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </div>

          {/* Manual Token Fallback Form */}
          <details className="text-left group border border-gray-100 rounded-2xl p-4 transition-all">
            <summary className="text-xs font-bold text-gray-600 cursor-pointer list-none flex items-center justify-between">
              <span>Have a verification token? Enter manually</span>
              <HelpCircle className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualToken.trim()) executeVerify(manualToken.trim());
              }}
              className="mt-3 space-y-2.5"
            >
              <input
                type="text"
                required
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste token here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#101114] focus:outline-none focus:border-[#fcb907]"
              />
              <button
                type="submit"
                className="w-full bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Submit Token
              </button>
            </form>
          </details>

          {/* Nav Links */}
          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <Link href="/account" className="text-gray-500 hover:text-[#101114] font-medium">
              ← Continue to Dashboard (Unverified)
            </Link>
            <Link href="/account/login" className="text-[#d97706] font-bold hover:underline">
              Sign into another account →
            </Link>
          </div>
        </div>
      )}

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>ModularHome Identity Security Protocol</span>
      </div>
    </div>
  );
}

export default function VerifyEmailClient() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Suspense fallback={<div className="text-center text-xs text-gray-400">Loading verification portal...</div>}>
        <VerifyEmailInner />
      </Suspense>
    </div>
  );
}
