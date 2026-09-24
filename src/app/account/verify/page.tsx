"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "ERROR" | "MANUAL">(
    token ? "VERIFYING" : "MANUAL"
  );
  const [manualToken, setManualToken] = useState("");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const executeVerify = async (tokenToUse: string) => {
    setStatus("VERIFYING");
    try {
      const res = await fetch("/api/customer/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToUse }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Invalid or expired verification token.");
      }

      setStatus("SUCCESS");
      setMessage(data.message || "Your email address has been verified successfully!");
      setTimeout(() => {
        router.push("/account");
      }, 2500);
    } catch (err: any) {
      setStatus("ERROR");
      setMessage(err?.message || "Verification failed.");
    }
  };

  useEffect(() => {
    if (token) {
      executeVerify(token);
    }
  }, [token]);

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/customer/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      setResendStatus(data.message || "Fresh verification email sent.");
    } catch {
      setResendStatus("Could not resend email. Please sign in or contact support.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 text-center space-y-6">
      <Link href="/" className="inline-block">
        <Image
          src="/finallogo.avif"
          alt="ModularHome"
          width={140}
          height={32}
          className="h-7 w-auto mx-auto object-contain"
        />
      </Link>

      {status === "VERIFYING" && (
        <div className="py-6 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#fcb907] mx-auto" />
          <h2 className="text-xl font-black text-[#101114]">Verifying Your Email...</h2>
          <p className="text-xs text-gray-500">
            Please wait while we confirm your customer verification token.
          </p>
        </div>
      )}

      {status === "SUCCESS" && (
        <div className="py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-[#101114]">Email Verified!</h2>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">{message}</p>
          <p className="text-xs text-amber-600 font-bold">Redirecting to your account dashboard...</p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {(status === "ERROR" || status === "MANUAL") && (
        <div className="space-y-4">
          {status === "ERROR" ? (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-50 text-[#d97706] flex items-center justify-center mx-auto mb-2">
              <Mail className="w-7 h-7" />
            </div>
          )}

          <h2 className="text-xl font-black text-[#101114]">Confirm Email Address</h2>
          <p className="text-xs text-gray-500">
            Paste your verification token from your confirmation email below, or click resend to receive a new link.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualToken.trim()) executeVerify(manualToken.trim());
            }}
            className="space-y-3"
          >
            <input
              type="text"
              required
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste 64-character token here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] font-mono"
            />
            <button
              type="submit"
              className="w-full bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Verify Token
            </button>
          </form>

          {resendStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              {resendStatus}
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-xs font-bold text-[#d97706] hover:underline flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
              <span>Resend Verification Email</span>
            </button>
            <Link href="/account" className="text-xs text-gray-500 hover:text-[#101114]">
              Skip to Customer Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-xs text-gray-400">Loading verification...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
