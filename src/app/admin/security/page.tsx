"use client";

import { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Copy,
  Check,
  Loader2,
  Lock,
  LogOut,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function AdminSecurityPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2FA Setup Flow State
  const [setupStep, setSetupStep] = useState<"idle" | "setup" | "verify">("idle");
  const [totpData, setTotpData] = useState<{
    secret: string;
    otpAuthUrl: string;
    recoveryCodes: string[];
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth/me");
      const json = await res.json();
      if (json.success && json.user) {
        setCurrentUser(json.user);
      }
    } catch (e) {
      console.error("Error loading security profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleStart2FASetup = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup_2fa" }),
      });
      const json = await res.json();
      if (json.success) {
        setTotpData(json.data);
        setSetupStep("setup");
      } else {
        setStatusMessage({ type: "error", text: json.error?.message || "Failed to initialize 2FA setup." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpData || !verifyCode) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_and_enable_2fa",
          secret: totpData.secret,
          code: verifyCode,
          recoveryCodes: totpData.recoveryCodes,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setStatusMessage({ type: "success", text: "Two-factor authentication has been successfully enabled on your account!" });
        setSetupStep("idle");
        setVerifyCode("");
        await fetchUser();
      } else {
        setStatusMessage({ type: "error", text: json.error?.message || "Invalid verification code." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "disable_2fa",
          password: disablePassword,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setStatusMessage({ type: "success", text: "Two-factor authentication disabled." });
        setDisablePassword("");
        await fetchUser();
      } else {
        setStatusMessage({ type: "error", text: json.error?.message || "Failed to disable 2FA. Check password." });
      }
    } catch (e: any) {
      setStatusMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!confirm("Are you sure you want to terminate all active sessions across all devices? You will be logged out.")) return;
    try {
      await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout_all_sessions" }),
      });
      window.location.href = "/admin/login?reason=session_reset";
    } catch {
      alert("Failed to reset sessions.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#e7e9ee] pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101114] font-serif flex items-center gap-2.5">
          <KeyRound className="w-7 h-7 text-[#fcb907]" />
          <span>Security & Two-Factor Authentication</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#6b7280] mt-1 font-medium">
          Protect your administrative credentials with standard RFC 6238 TOTP authenticator app verification and session controls.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2FA Status Card */}
      <div className="bg-white rounded-[22px] border border-[#e7e9ee] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e7e9ee]">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                currentUser?.twoFactorEnabled ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              {currentUser?.twoFactorEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#101114]">
                Authenticator App (TOTP)
              </h2>
              <p className="text-xs text-[#6b7280] mt-0.5">
                {currentUser?.twoFactorEnabled
                  ? "2FA is active. Verification code required at every login."
                  : "2FA is not yet enabled. Enable to prevent unauthorized account access."}
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
              currentUser?.twoFactorEnabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {currentUser?.twoFactorEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {/* 2FA Actions / Enrollment */}
        {!currentUser?.twoFactorEnabled ? (
          <div>
            {setupStep === "idle" && (
              <div className="space-y-4">
                <p className="text-xs text-[#6b7280] leading-relaxed">
                  Use an authenticator application such as Google Authenticator, Microsoft Authenticator, 1Password, or Apple Keychain to generate time-based one-time codes.
                </p>
                <button
                  onClick={handleStart2FASetup}
                  disabled={isProcessing}
                  className="px-6 py-3 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>Set Up Two-Factor Authentication</span>
                </button>
              </div>
            )}

            {setupStep === "setup" && totpData && (
              <div className="space-y-6 pt-2 animate-in fade-in">
                <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#e7e9ee] space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#101114]">
                    Step 1: Add Account to Authenticator App
                  </h3>
                  <p className="text-xs text-[#6b7280]">
                    Enter the following Base32 secret key manually in your authenticator app:
                  </p>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#e7e9ee] font-mono text-sm font-bold text-[#101114]">
                    <span className="tracking-widest">{totpData.secret}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(totpData.secret);
                        setCopiedSecret(true);
                        setTimeout(() => setCopiedSecret(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#fcb907] hover:text-[#101114] text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecret ? "Copied" : "Copy Secret"}</span>
                    </button>
                  </div>
                </div>

                {/* Backup Recovery Codes */}
                <div className="p-5 rounded-2xl bg-[#fefce8] border border-[#fef08a] space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#854d0e]">
                      Step 2: Save Emergency Recovery Codes
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(totpData.recoveryCodes.join("\n"));
                        setCopiedCodes(true);
                        setTimeout(() => setCopiedCodes(false), 2500);
                      }}
                      className="text-xs font-bold text-[#b45309] hover:underline flex items-center gap-1"
                    >
                      {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodes ? "Codes Copied" : "Copy All Codes"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#713f12]">
                    If you lose access to your authenticator app, each single-use recovery code will grant login access.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs font-bold text-[#101114]">
                    {totpData.recoveryCodes.map((code, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-[#fde047] text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Form */}
                <form onSubmit={handleVerify2FA} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#101114] mb-1">
                      Step 3: Enter 6-Digit Code from App
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full sm:w-64 px-4 py-3 text-lg font-mono font-black text-center tracking-[0.3em] rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-[#fcb907]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSetupStep("idle")}
                      className="px-4 py-2.5 rounded-xl border border-[#e7e9ee] text-xs font-bold text-[#6b7280] hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || verifyCode.length !== 6}
                      className="px-6 py-2.5 rounded-xl bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Verify & Activate 2FA</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#101114]">
              Disable Two-Factor Authentication
            </h3>
            <p className="text-xs text-[#6b7280]">
              To turn off 2FA, enter your current account password to confirm your identity.
            </p>

            <form onSubmit={handleDisable2FA} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full sm:w-72 px-3.5 py-2.5 text-xs rounded-xl border border-[#e7e9ee] bg-[#f8f9fa] focus:bg-white focus:outline-none focus:border-red-500 font-medium"
              />
              <button
                type="submit"
                disabled={isProcessing || !disablePassword}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Disable 2FA</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Session Security Card */}
      <div className="bg-white rounded-[22px] border border-[#e7e9ee] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#101114] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#d97706]" />
          <span>Active Sessions & Device Management</span>
        </h2>
        <p className="text-xs text-[#6b7280] leading-relaxed">
          Admin sessions automatically expire after 1 hour of inactivity. If you suspect unauthorized access from another device or location, you can instantly terminate all active sessions.
        </p>

        <button
          onClick={handleLogoutAllSessions}
          className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Terminate All Active Sessions</span>
        </button>
      </div>
    </div>
  );
}
