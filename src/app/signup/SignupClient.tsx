"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck,
} from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/account";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time strength computations
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Password must be at least 8 characters and contain both letters and numbers.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-type your password.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/customer/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          password,
          confirm_password: confirmPassword,
          agree_terms: agreeTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Registration failed. Please try again.");
      }

      // Seamless redirect to verify-email view
      router.push(
        `/verify-email?email=${encodeURIComponent(email.toLowerCase().trim())}&registered=true`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
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
        <h1 className="text-2xl sm:text-3xl font-black text-[#101114] tracking-tight pt-2">
          Create Customer Account
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
          Access purchased CAD blueprints, construction specifications, and direct project tracking.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Google OAuth Button */}
      <div className="space-y-3">
        <GoogleAuthButton
          mode="signup"
          redirectPath={redirectParam}
          onError={(msg) => setErrorMessage(msg)}
        />
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
            or sign up with email
          </span>
          <div className="border-t border-gray-200 w-full" />
        </div>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              First Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-xs sm:text-sm text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-2 focus:ring-[#fcb907]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Last Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-xs sm:text-sm text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-2 focus:ring-[#fcb907]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Email Address */}
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
              placeholder="jane.doe@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-2 focus:ring-[#fcb907]/20 transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
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
              placeholder="+1 (812) 595-4033"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-2 focus:ring-[#fcb907]/20 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#fcb907] focus:ring-2 focus:ring-[#fcb907]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Checklist */}
          {password.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px]">
              <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
                <FileCheck className="w-3 h-3" /> 8+ chars
              </span>
              <span className={`flex items-center gap-1 ${hasLetter ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
                <FileCheck className="w-3 h-3" /> Letters
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 font-bold" : "text-gray-400"}`}>
                <FileCheck className="w-3 h-3" /> Numbers
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full bg-gray-50 border rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#101114] placeholder-gray-400 focus:bg-white focus:outline-none transition-all ${
                confirmPassword && !passwordsMatch
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : confirmPassword && passwordsMatch
                  ? "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                  : "border-gray-200 focus:border-[#fcb907] focus:ring-2 focus:ring-[#fcb907]/20"
              }`}
            />
            {confirmPassword && passwordsMatch && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>

        {/* Terms of Service Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="terms-signup"
            required
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#fcb907] focus:ring-[#fcb907] cursor-pointer"
          />
          <label htmlFor="terms-signup" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
            I agree to the{" "}
            <Link href="/terms-of-service" target="_blank" className="text-[#d97706] font-bold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank" className="text-[#d97706] font-bold hover:underline">
              Privacy Policy
            </Link>
            . I understand that architectural blueprints are sold under single-build license agreements.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !agreeTerms}
          className="w-full bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black text-sm py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
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

      {/* Switch to Sign In */}
      <div className="pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-600">
          Already have an account?{" "}
          <Link
            href={`/account/login?redirect=${encodeURIComponent(redirectParam)}`}
            className="text-[#d97706] font-black hover:underline"
          >
            Sign in here →
          </Link>
        </p>
      </div>

      {/* Footer Security Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>256-Bit SSL Encrypted & Protected Blueprint Vault</span>
      </div>
    </div>
  );
}

export default function SignupClient() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Suspense fallback={<div className="text-center text-xs text-gray-400">Loading signup portal...</div>}>
        <SignupFormInner />
      </Suspense>
    </div>
  );
}
