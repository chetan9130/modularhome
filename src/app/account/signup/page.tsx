"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

function CustomerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!agreeTerms) {
      setErrorMessage("Please agree to the Terms of Service to create an account.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/customer/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to register account.");
      }

      router.push("/account");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 space-y-6">
      {/* Brand & Title */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block">
          <Image
            src="/finallogo.avif"
            alt="ModularHome"
            width={140}
            height={32}
            className="h-7 w-auto mx-auto object-contain"
          />
        </Link>
        <h1 className="text-2xl font-black text-[#101114] tracking-tight pt-2">
          Create Account
        </h1>
        <p className="text-xs text-gray-500">
          Unlock instant blueprint downloads, invoice receipts, and project tracking.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address *
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

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Create Password (Min 6 chars) *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-[#fcb907] focus:ring-[#fcb907]"
          />
          <label htmlFor="terms" className="text-xs text-gray-600 leading-snug">
            I agree to the{" "}
            <Link href="/terms-of-service" target="_blank" className="text-[#d97706] font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank" className="text-[#d97706] font-bold hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-sm py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Customer Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Already have an account?{" "}
          <Link
            href={`/account/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="text-[#d97706] font-black hover:underline"
          >
            Sign in here →
          </Link>
        </p>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Single-Build Blueprints & Secure Licensing</span>
      </div>
    </div>
  );
}

export default function CustomerSignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center text-xs text-gray-400">Loading sign up...</div>}>
        <CustomerSignupForm />
      </Suspense>
    </div>
  );
}
