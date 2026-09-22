"use client";

import { useState } from "react";
import { CheckCircle2, UploadCloud, Loader2 } from "lucide-react";

export default function QuoteAndStepsSection() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Select State");
  const [homeType, setHomeType] = useState("Select Home Type");
  const [budget, setBudget] = useState("Select Budget");
  const [details, setDetails] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          modelName: homeType !== "Select Home Type" ? homeType : "Custom Architecture",
          requirements: `State: ${state} | Home Type: ${homeType} | Budget: ${budget} | Details: ${details}${fileName ? ` | Attached File: ${fileName}` : ""}`,
          source: "HOMEPAGE_QUOTE",
        }),
      });
    } catch (err) {
      console.error("Quote submit error:", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setDetails("");
      setFileName("");
    }
  };

  const steps = [
    { num: 1, title: "Browse", desc: "Explore homes" },
    { num: 2, title: "Quote", desc: "Get pricing" },
    { num: 3, title: "Customize", desc: "Make it yours" },
    { num: 4, title: "Build", desc: "Factory build" },
    { num: 5, title: "Deliver", desc: "Set up onsite" },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#f6f7f9]" id="quote">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
          {/* Left Card: Custom Quote Form */}
          <div className="card p-6 sm:p-7 bg-white">
            <h2 className="text-2xl sm:text-3xl font-black tracking-[-1px] text-[#101114] mb-1">
              Get Your Custom Quote
            </h2>
            <p className="text-xs sm:text-sm text-[#6b7280] mb-5">
              Tell us about your project and we&apos;ll get back to you with custom pricing.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-black text-[#101114]">
                  Quote Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-[#3f4650] leading-relaxed max-w-sm mx-auto">
                  Thank you! One of our modular building specialists will review your specifications and follow up within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="btn-primary py-2 px-4 text-xs font-bold rounded-lg mt-2"
                >
                  Submit Another Project
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
                />

                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
                />

                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all"
                />

                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all cursor-pointer"
                >
                  <option value="Select State">Select State</option>
                  <option value="Texas">Texas</option>
                  <option value="Florida">Florida</option>
                  <option value="California">California</option>
                  <option value="North Carolina">North Carolina</option>
                  <option value="Tennessee">Tennessee</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Ohio">Ohio</option>
                  <option value="Michigan">Michigan</option>
                  <option value="Other">Other (All 50 States)</option>
                </select>

                <select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                  className="w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all cursor-pointer"
                >
                  <option value="Select Home Type">Select Home Type</option>
                  <option value="Modular Home">Modular Home</option>
                  <option value="Prefab Home">Prefab Home</option>
                  <option value="Barndominium">Barndominium</option>
                  <option value="Cabin">Modular Cabin</option>
                  <option value="ADU">ADU / Granny Pod</option>
                  <option value="Tiny Home">Tiny Home</option>
                  <option value="A-Frame">A-Frame</option>
                </select>

                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all cursor-pointer"
                >
                  <option value="Select Budget">Select Budget</option>
                  <option value="Under $75K">Under $75K</option>
                  <option value="$75K–$150K">$75K–$150K</option>
                  <option value="$150K–$250K">$150K–$250K</option>
                  <option value="$250K+">$250K+</option>
                </select>

                <textarea
                  placeholder="Project details, preferred size, timeline, etc."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="sm:col-span-2 w-full p-3.5 border border-[#d8dce3] rounded-[9px] bg-white text-[#101114] min-h-[95px] focus:outline-none focus:border-[#fcb907] focus:ring-1 focus:ring-[#fcb907] transition-all resize-y"
                />

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 w-full p-3 border border-dashed border-[#d8dce3] hover:border-[#fcb907] rounded-[9px] cursor-pointer text-xs text-[#6b7280] transition-colors bg-[#f8f9fa]">
                    <UploadCloud className="w-4 h-4 text-[#d97706] shrink-0" />
                    <span className="truncate">
                      {fileName ? `Attached: ${fileName}` : "Attach Blueprint or Sketches (PDF, JPG, PNG)"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sm:col-span-2 bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] w-full py-3.5 text-sm font-black rounded-[11px] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Quote →</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Card: How It Works */}
          <div className="card p-6 sm:p-7 bg-white flex flex-col justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-[-1px] text-[#101114] mb-1">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm text-[#6b7280] mb-6">
                A simple, transparent process from start to finish.
              </p>

              {/* 5 Steps Numbered Process Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-2 mt-4">
                {steps.map((st) => (
                  <div key={st.num} className="text-center p-3 sm:p-2 bg-[#f8f9fa] rounded-xl border border-[#e7e9ee] hover:border-[#fcb907]/50 transition-colors">
                    <div className="w-[38px] h-[38px] rounded-full bg-[#fcb907] text-[#101114] flex items-center justify-center font-black text-sm mx-auto mb-2 shadow-xs">
                      {st.num}
                    </div>
                    <h3 className="block text-sm font-black text-[#101114] m-0">
                      {st.title}
                    </h3>
                    <p className="text-[11px] text-[#6b7280] mt-0.5 mb-0 font-medium">
                      {st.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supporting Trust Note */}
            <div className="p-4 bg-[#f6f7f9] border border-[#e7e9ee] rounded-xl mt-6 space-y-1">
              <div className="text-xs font-black text-[#101114] uppercase tracking-wider">
                Turnkey Project Delivery
              </div>
              <p className="text-xs text-[#6b7280] leading-relaxed m-0">
                From initial site evaluation and architectural permitting to modular factory production and crane assembly on your foundation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
