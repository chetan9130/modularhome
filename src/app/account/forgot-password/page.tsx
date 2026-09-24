"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/customer/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to process password reset.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not dispatch reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 space-y-6 text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/finallogo.avif"
            alt="ModularHome"
            width={140}
            height={32}
            className="h-7 w-auto mx-auto object-contain"
          />
        </Link>

        {isSuccess ? (
          <div className="py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-[#101114]">Reset Link Sent</h2>
            <p className="text-xs text-gray-600 max-w-xs mx-auto">
              If an account exists for <span className="font-bold text-[#101114]">{email}</span>, a password reset link has been dispatched to your inbox.
            </p>
            <div className="pt-4 border-t border-gray-100">
              <Link
                href="/account/login"
                className="inline-flex items-center gap-2 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#101114] tracking-tight">
                Forgot Password
              </h1>
              <p className="text-xs text-gray-500">
                Enter your registered email address to receive a secure recovery link.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-sm py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center">
              <Link href="/account/login" className="text-xs font-bold text-gray-500 hover:text-[#101114]">
                ← Back to Customer Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
