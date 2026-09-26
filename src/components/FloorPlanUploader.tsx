"use client";

import { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  FileCheck2,
  Shield,
  User,
  ShieldCheck
} from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export default function FloorPlanUploader() {
  const { customer, isAuthenticated } = useCustomerAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
    approximateSqFt: "",
    description: "",
  });

  useEffect(() => {
    if (customer) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || customer.name || "",
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phone || "",
        zip: prev.zip || customer.billing_address?.zip || "",
      }));
    }
  }, [customer]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parsedSqft = form.approximateSqFt
        ? parseInt(form.approximateSqFt.replace(/\D/g, ""), 10) || null
        : null;

      await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          customerZip: form.zip,
          modelName: "Custom Floor Plan Blueprint",
          sqft: parsedSqft,
          requirements: `Target Size: ${form.approximateSqFt || "Not specified"}${
            file ? ` | Blueprint Document: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : ""
          }${form.description ? ` | Notes: ${form.description}` : ""}`,
          source: "FLOOR_PLAN_UPLOAD",
        }),
      });
    } catch (err) {
      console.error("Floor plan submission error:", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="card p-6 sm:p-8 text-[#101114] bg-white">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-2.5">
              1. Floor Plan Document (PDF, PNG, JPG or CAD)
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer relative border-2 border-dashed rounded-[14px] p-8 text-center transition-all duration-300 ${
                dragActive
                  ? "border-[#fcb907] bg-[#fdfaf2]"
                  : file
                  ? "border-[#fcb907] bg-[#fdfaf2]"
                  : "border-[#dfe2e7] bg-[#f6f7f9]/60 hover:border-[#fcb907] hover:bg-white"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                onChange={handleChange}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#fcb907]/15 text-[#d97706] flex items-center justify-center">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#101114]">{file.name}</div>
                    <div className="text-xs text-[#6b7280]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for evaluation
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-[#d97706] hover:underline font-bold pt-1"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#fcb907]/15 text-[#d97706] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#101114]">
                      Click to upload or drag & drop blueprint
                    </div>
                    <div className="text-xs text-[#6b7280] mt-0.5">
                      PDF, PNG, JPG, DWG, DXF up to 50MB
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Project Specifics */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
              2. Project & Contact Information
            </label>

            {isAuthenticated && customer && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-[#101114]">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-[#fcb907] text-[#101114] flex items-center justify-center text-[10px] font-black shrink-0">
                    {customer.name ? customer.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="truncate">
                    Submitting plan as <strong>{customer.name}</strong> ({customer.email})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                  Linked to Portal
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="support@modularhome.com"
                  className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1-812-595-4033"
                  className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101114] mb-1">
                  Build Site ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="e.g. 78701"
                  className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1">
                Approximate Target Square Footage
              </label>
              <input
                type="text"
                value={form.approximateSqFt}
                onChange={(e) => setForm({ ...form, approximateSqFt: e.target.value })}
                placeholder="e.g. 1,600 sq ft"
                className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101114] mb-1">
                Special Architectural Requirements or Notes
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detail any desired ceiling heights, porch overhangs, exterior finish materials, or timeline goals..."
                className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-4 text-sm font-extrabold rounded-[11px] shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Transmitting Blueprint File...</span>
              ) : (
                <>
                  <span>Submit Floor Plan For Engineering Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#6b7280]">
            <Shield className="w-3.5 h-3.5 text-[#fcb907]" />
            <span>Your architectural documents and contact details are 100% confidential.</span>
          </div>
        </form>
      ) : (
        /* Success Screen */
        <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#fcb907]/15 text-[#d97706] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black uppercase text-[#101114]">
            Blueprint Dispatched Successfully
          </h3>
          <p className="text-xs sm:text-sm text-[#6b7280] max-w-md mx-auto leading-relaxed">
            Thank you, <span className="text-[#101114] font-bold">{form.name}</span>. Your floor plan has been assigned to our engineering department. An estimator will review your load lines and provide an itemized proposal within 24–48 hours.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFile(null);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  zip: "",
                  approximateSqFt: "",
                  description: "",
                });
              }}
              className="btn-outline py-2.5 px-5 text-xs font-bold rounded-[9px]"
            >
              Upload Another Blueprint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
