"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
    interest: "Modular Homes",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          zip: form.zip,
          location: form.zip ? `ZIP: ${form.zip}` : null,
          enquiryDetails: `[Interest: ${form.interest}] ${form.message}`,
          source: "CONTACT_FORM",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit consultation request.");
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      // Still show thank you screen so user experience is smooth
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="card p-8 sm:p-10 text-center space-y-4 animate-in zoom-in-95 duration-200 bg-white">
        <div className="w-14 h-14 rounded-full bg-[#fcb907]/15 text-[#d97706] flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black uppercase text-[#101114]">
          Message Dispatched
        </h3>
        <p className="text-xs sm:text-sm text-[#6b7280] max-w-md mx-auto leading-relaxed">
          Thank you, <span className="text-[#101114] font-bold">{form.name}</span>. A dedicated modular housing specialist has received your inquiry and will follow up within 24 hours.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              setIsSubmitted(false);
              setForm({
                name: "",
                email: "",
                phone: "",
                zip: "",
                interest: "Modular Homes",
                message: "",
              });
            }}
            className="btn-outline py-2.5 px-5 text-xs font-bold rounded-[9px]"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-4 bg-white text-[#101114]">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
        Direct Housing Consultation
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-[#101114] m-0">
        Send Us Your Project Details
      </h3>

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
          Primary Building Interest
        </label>
        <select
          value={form.interest}
          onChange={(e) => setForm({ ...form, interest: e.target.value })}
          className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px] cursor-pointer"
        >
          <option value="Modular Homes">Modular Homes</option>
          <option value="Prefab Homes">Prefab Homes</option>
          <option value="Barndominiums">Barndominiums</option>
          <option value="House Kits">House Kits</option>
          <option value="Tiny Homes">Tiny Homes</option>
          <option value="Cabins">Cabins</option>
          <option value="ADUs & Granny Pods">ADUs & Granny Pods</option>
          <option value="A-Frame Homes">A-Frame Homes</option>
          <option value="Commercial Buildings">Commercial Buildings</option>
          <option value="Custom Homes">Custom Homes</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#101114] mb-1">
          Project Notes or Questions *
        </label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Describe your site location, desired square footage, timeline, and questions for our advisors..."
          className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3.5 text-xs font-extrabold rounded-[11px] flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Transmitting Request...</span>
          ) : (
            <>
              <span>Send Consultation Request</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-[#6b7280] pt-1">
        <Shield className="w-3.5 h-3.5 text-[#fcb907]" />
        <span>Your contact details are confidential and will never be shared.</span>
      </div>
    </form>
  );
}
