import { ShieldCheck, Clock, Award } from "lucide-react";
import QuoteWizard from "@/components/QuoteWizard";
import { getPublicGlobalSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Instant Building Quote Calculator | ModularHome.com",
  description: "Calculate custom estimates for your modular home, prefab, tiny home, barndominium, or cabin. Customize square footage and options for transparent pricing.",
};

export default async function QuotePage() {
  const settings = await getPublicGlobalSettings();
  const phone = settings.phone || "+1 (812) 595-4033";

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 text-[#101114]">
      <div className="wrap">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d97706] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#fcb907]"></span>
            <span>Interactive Estimator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[-1.5px] text-[#101114]">
            Instant Building Quote
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#6b7280] leading-relaxed">
            Configure your home type, fine-tune square footage, and select energy packages. Transparent pricing in under 2 minutes.
          </p>

          {/* Quick trust bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#101114]">
            <span className="flex items-center gap-1.5 bg-[#f6f7f9] border border-[#e7e9ee] px-3.5 py-1.5 rounded-full font-bold">
              <Clock className="w-3.5 h-3.5 text-[#d97706]" />
              Takes 2 Minutes
            </span>
            <span className="flex items-center gap-1.5 bg-[#f6f7f9] border border-[#e7e9ee] px-3.5 py-1.5 rounded-full font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d97706]" />
              No Obligation Estimate
            </span>
            <span className="flex items-center gap-1.5 bg-[#f6f7f9] border border-[#e7e9ee] px-3.5 py-1.5 rounded-full font-bold">
              <Award className="w-3.5 h-3.5 text-[#d97706]" />
              Direct Factory Pricing
            </span>
          </div>
        </div>

        {/* Wizard Container */}
        <div className="max-w-5xl mx-auto">
          <QuoteWizard />
        </div>

        {/* Assistive footer callout */}
        <div className="mt-14 text-center text-xs text-[#6b7280]">
          Prefer to speak directly with an estimator? Call us at{" "}
          <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-[#d97706] font-bold hover:underline">
            {phone}
          </a>{" "}
          (Monday–Friday 7am–6pm EST).
        </div>
      </div>
    </div>
  );
}

