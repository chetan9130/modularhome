"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Loader2,
} from "lucide-react";
import { BUILDING_MODELS, CATEGORIES, BuildingModel } from "@/data/models";
import { formatPrice } from "@/utils/currency";

const AVAILABLE_OPTIONS = [
  { id: "opt-porch", name: "Wraparound Covered Timber Porch", price: 14500, desc: "Solid 8x8 posts with black structural brackets" },
  { id: "opt-insul", name: "Extreme Climate R-38 Spray Foam Insulation", price: 9200, desc: "Superior closed-cell thermal break envelope" },
  { id: "opt-garage", name: "Attached 2-Car Insulated Garage Bay", price: 21000, desc: "Includes high-lift 10ft doors and concrete threshold" },
  { id: "opt-glass", name: "16ft Black Aluminum Panoramic Glass Wall", price: 12800, desc: "Multi-slide low-E architectural glass opening" },
  { id: "opt-loft", name: "Second-Story Structural Mezzanine / Loft", price: 16400, desc: "Adds 500+ sq ft floor joists and iron railing" },
  { id: "opt-standing-seam", name: "Concealed Fastener Standing Seam Roof Upgrade", price: 7800, desc: "26-gauge ultra-durability concealed roof fasteners" },
];

export default function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string>("Cabins");
  const [allModels, setAllModels] = useState<BuildingModel[]>(BUILDING_MODELS);
  const [selectedModel, setSelectedModel] = useState<BuildingModel>(BUILDING_MODELS[0]);
  const [sqft, setSqft] = useState<number>(1200);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(["opt-insul", "opt-porch"]);

  useEffect(() => {
    async function loadDynamicModels() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAllModels(json.data);
            setSelectedModel(json.data[0]);
          }
        }
      } catch (e) {}
    }
    loadDynamicModels();
  }, []);

  // Contact Info
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
    timeline: "3-6 months",
    notes: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Available models filtered by chosen category
  const filteredModels = useMemo(() => {
    const matched = allModels.filter((m) => m.category === category);
    return matched.length > 0 ? matched : allModels;
  }, [category, allModels]);

  // Price Calculation Engine
  const calculation = useMemo(() => {
    const standardSqft = selectedModel.sqft || 1000;
    const basePrice = selectedModel.startingPrice;
    const costPerSqFt = basePrice / standardSqft;

    const sizeAdjustedPrice = Math.round(sqft * costPerSqFt);

    const optionsTotal = selectedOptions.reduce((acc, optId) => {
      const opt = AVAILABLE_OPTIONS.find((o) => o.id === optId);
      return acc + (opt ? opt.price : 0);
    }, 0);

    const totalEstimate = sizeAdjustedPrice + optionsTotal;

    return {
      sizeAdjustedPrice,
      optionsTotal,
      totalEstimate,
    };
  }, [selectedModel, sqft, selectedOptions]);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const selectedOptionObjects = AVAILABLE_OPTIONS.filter((o) =>
        selectedOptions.includes(o.id)
      );

      const payload = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerZip: formData.zip,
        modelSlug: selectedModel?.slug || "",
        modelName: selectedModel?.name || "Custom Configuration",
        sqft: sqft,
        options: selectedOptionObjects,
        pricingInputs: calculation,
        estimatedAmount: calculation.totalEstimate,
        timeline: formData.timeline,
        requirements: formData.notes,
        source: "QUOTE_WIZARD",
      };

      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit quote request.");
      }

      setIsSubmitted(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fcb907", "#d97706", "#101114", "#f6f7f9"],
        });
      } catch {
        // Fallback
      }
    } catch (err: any) {
      console.error("Quote submit error:", err);
      setSubmitError(err.message || "Failed to submit quote request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmitError(null);
    setStep(1);
    setSelectedOptions(["opt-insul", "opt-porch"]);
  };

  const formatCurrency = (val: number) => formatPrice(val);

  return (
    <div className="card overflow-hidden bg-white text-[#101114]">
      {/* Wizard Progress Bar */}
      <div className="bg-[#f6f7f9] p-4 sm:p-6 border-b border-[#e7e9ee]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {[
            { num: 1, label: "Building Type" },
            { num: 2, label: "Model" },
            { num: 3, label: "Size" },
            { num: 4, label: "Options" },
            { num: 5, label: "Estimate" },
            { num: 6, label: "Finalize" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center relative group">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                  step === s.num
                    ? "bg-[#fcb907] text-[#101114] shadow-sm"
                    : step > s.num
                    ? "bg-white text-[#d97706] border border-[#fcb907]"
                    : "bg-white text-[#6b7280] border border-[#e7e9ee]"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4 text-[#d97706]" /> : s.num}
              </div>
              <span
                className={`hidden md:block text-[11px] uppercase tracking-wider mt-2 font-bold ${
                  step === s.num ? "text-[#101114]" : "text-[#6b7280]"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Step Container */}
      <div className="p-6 sm:p-8 min-h-[460px] flex flex-col justify-between bg-white">
        {!isSubmitted ? (
          <>
            {/* STEP 1: CHOOSE CATEGORY */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Step 01 of 06
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                    Select Building Type
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
                    Choose the primary category for your planned structure.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          const firstMatching = BUILDING_MODELS.find((m) => m.category === cat.id);
                          if (firstMatching) {
                            setSelectedModel(firstMatching);
                            setSqft(firstMatching.sqft);
                          }
                        }}
                        className={`cursor-pointer relative p-4.5 rounded-[11px] border transition-all duration-300 flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-[#f6f7f9] border-[#fcb907] ring-1 ring-[#fcb907] shadow-xs"
                            : "bg-white border-[#e7e9ee] hover:border-[#fcb907]"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-[#fcb907] bg-[#fcb907] text-[#101114]"
                              : "border-[#6b7280]"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="text-sm font-black text-[#101114]">
                            {cat.title}
                          </div>
                          <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">
                            {cat.tagline}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE MODEL */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Step 02 of 06
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                    Select Base Architectural Model
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
                    Showing available models under <span className="text-[#d97706] font-bold">{category}</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {filteredModels.map((m) => {
                    const isSelected = selectedModel.id === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m);
                          setSqft(m.sqft);
                        }}
                        className={`cursor-pointer rounded-[11px] border overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? "bg-[#f6f7f9] border-[#fcb907] ring-1 ring-[#fcb907] shadow-md"
                            : "bg-white border-[#e7e9ee] hover:border-[#fcb907]"
                        }`}
                      >
                        <div className="relative aspect-[16/10] w-full bg-[#f6f7f9]">
                          <Image
                            src={m.primaryImage}
                            alt={m.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-white/95 text-[#101114] rounded-[6px] shadow-xs">
                            {formatCurrency(m.startingPrice)}
                          </div>
                        </div>

                        <div className="p-3.5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-[#d97706]">
                              {m.series}
                            </span>
                            <span className="text-xs text-[#6b7280] font-semibold">
                              {m.sqft} SQ FT
                            </span>
                          </div>
                          <div className="text-sm font-black text-[#101114]">
                            {m.name}
                          </div>
                          <div className="text-xs text-[#6b7280]">
                            {m.bedrooms > 0 ? `${m.bedrooms} Bed • ${m.bathrooms} Bath` : "1 Bed • 1 Bath"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: ENTER SIZE */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Step 03 of 06
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                    Customize Square Footage
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
                    Scale your footprint. The structural frame price adjusts dynamically.
                  </p>
                </div>

                <div className="bg-[#f6f7f9] border border-[#e7e9ee] p-7 rounded-[14px] text-center space-y-5 shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#6b7280]">
                      Selected Model:
                    </span>
                    <div className="text-xl font-black text-[#101114] mt-0.5">
                      {selectedModel.name}
                    </div>
                  </div>

                  <div className="py-2">
                    <div className="text-5xl sm:text-6xl font-black text-[#101114]">
                      {new Intl.NumberFormat("en-US").format(sqft)}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#d97706] mt-1.5">
                      SQUARE FEET
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={400}
                      max={6000}
                      step={50}
                      value={sqft}
                      onChange={(e) => setSqft(Number(e.target.value))}
                      className="w-full accent-[#fcb907] cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[#6b7280]">
                      <span>400 SQ FT (Compact)</span>
                      <span>1,500 SQ FT (Popular)</span>
                      <span>6,000 SQ FT (Large)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {[650, 1200, 1586, 2012, 2400, 3200].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSqft(preset)}
                        className={`px-3 py-1 text-xs font-bold rounded-[6px] border transition-colors cursor-pointer ${
                          sqft === preset
                            ? "bg-[#fcb907] text-[#101114] border-[#fcb907]"
                            : "bg-white text-[#101114] border-[#dfe2e7] hover:bg-[#fcb907] hover:text-[#101114]"
                        }`}
                      >
                        {preset} SQ FT
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CHOOSE OPTIONS */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Step 04 of 06
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                    Select Upgrades & Packages
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
                    Add factory-engineered porches, insulation, garage bays, or glass walls.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                  {AVAILABLE_OPTIONS.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={`cursor-pointer p-4 rounded-[11px] border transition-all duration-200 flex items-start justify-between gap-3.5 ${
                          isSelected
                            ? "bg-[#f6f7f9] border-[#fcb907] shadow-xs"
                            : "bg-white border-[#e7e9ee] hover:border-[#fcb907]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-[4px] border mt-0.5 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-[#fcb907] bg-[#fcb907] text-[#101114]"
                                : "border-[#6b7280]"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase text-[#101114]">
                              {opt.name}
                            </div>
                            <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">
                              {opt.desc}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs font-bold text-[#d97706] shrink-0">
                          +{formatCurrency(opt.price)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: ESTIMATED PRICE REVIEW */}
            {step === 5 && (
              <div className="space-y-5 animate-in fade-in duration-200 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Step 05 of 06
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                    Your Modular Estimate
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
                    Based on your selected model footprint, square footage, and chosen upgrades.
                  </p>
                </div>

                <div className="bg-[#f6f7f9] border border-[#e7e9ee] p-6 sm:p-7 rounded-[14px] space-y-5 shadow-xs">
                  {/* Big Price Display */}
                  <div className="text-center py-3 border-b border-[#e7e9ee]">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">
                      Estimated Home Cost
                    </span>
                    <div className="text-4xl sm:text-6xl font-black text-[#d97706] mt-1">
                      {formatCurrency(calculation.totalEstimate)}
                    </div>
                    <div className="text-xs text-[#101114] font-bold mt-1">
                      Approx. {formatCurrency(Math.round(calculation.totalEstimate / sqft))} / SQ FT
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-[#101114]">
                      <span>
                        {selectedModel.name} ({new Intl.NumberFormat("en-US").format(sqft)} SQ FT Modular Shell)
                      </span>
                      <span className="font-bold">{formatCurrency(calculation.sizeAdjustedPrice)}</span>
                    </div>

                    {selectedOptions.map((optId) => {
                      const opt = AVAILABLE_OPTIONS.find((o) => o.id === optId);
                      if (!opt) return null;
                      return (
                        <div key={optId} className="flex justify-between text-xs text-[#6b7280]">
                          <span>+ {opt.name}</span>
                          <span className="text-[#d97706] font-bold">+{formatCurrency(opt.price)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Disclaimer */}
                  <div className="p-3.5 bg-white border border-[#e7e9ee] rounded-[9px] text-[11px] text-[#6b7280] leading-relaxed flex items-start gap-2.5 shadow-xs">
                    <ShieldAlert className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                    <span>
                      This is an estimated price. Final pricing may vary based on delivery distance, site soil conditions, regional snow/wind engineering calculations, and interior finish selections.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: CONTACT INFORMATION */}
            {step === 6 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Step 06 of 06
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                    Finalize & Lock Your Estimate
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6b7280] mt-1">
                    Provide your delivery location and contact information to receive the full itemized spec packet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#101114] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Anderson"
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      placeholder="e.g. 78701"
                      className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1">
                    Target Build Timeline
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px] cursor-pointer"
                  >
                    <option value="Ready Immediately">Ready Immediately (Have Land & Permits)</option>
                    <option value="3-6 months">3 to 6 months</option>
                    <option value="6-12 months">6 to 12 months</option>
                    <option value="Planning & Research">Early Planning / Budgeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101114] mb-1">
                    Special Requests or Site Conditions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tell us about your property, crane access or desired custom modifications..."
                    className="w-full bg-[#f6f7f9] border border-[#dfe2e7] px-3.5 py-2.5 text-xs text-[#101114] focus:outline-none focus:border-[#fcb907] rounded-[9px]"
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
                    {submitError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 text-sm font-extrabold rounded-[11px] shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#101114]" />
                        <span>Submitting Estimate Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Request My Official Estimate Packet</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Navigation Buttons (Back / Next) */}
            <div className="pt-6 mt-6 border-t border-[#e7e9ee] flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-outline py-2 px-4 text-xs font-bold rounded-[9px] flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 6 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary py-2.5 px-6 text-xs font-extrabold rounded-[9px] flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center py-10 px-4 max-w-xl mx-auto space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#fcb907]/15 text-[#d97706] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                Quote Request Received
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                Estimate Successfully Generated
              </h3>
              <p className="text-xs sm:text-sm text-[#6b7280] mt-1 leading-relaxed">
                Thank you, <span className="text-[#101114] font-bold">{formData.name || "friend"}</span>. We have generated an initial structural estimate for your <span className="text-[#d97706] font-bold">{sqft} SQ FT {selectedModel.name}</span>.
              </p>
            </div>

            <div className="bg-[#f6f7f9] border border-[#e7e9ee] p-5 rounded-[11px] text-left space-y-2">
              <div className="flex justify-between text-xs text-[#6b7280]">
                <span>Reference ID:</span>
                <span className="font-mono text-[#101114] font-bold">MOD-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6b7280]">
                <span>Estimated Shell Cost:</span>
                <span className="font-bold text-[#d97706] text-sm">{formatCurrency(calculation.totalEstimate)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6b7280]">
                <span>Recipient:</span>
                <span className="text-[#101114] font-medium">{formData.email || "Email pending"}</span>
              </div>
            </div>

            <p className="text-xs text-[#6b7280]">
              A structural specialist will review your specifications and reach out within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="btn-outline py-2.5 px-5 text-xs font-bold rounded-[9px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Build Another Quote
              </button>
              <Link
                href="/buildings"
                className="btn-primary py-2.5 px-6 text-xs font-bold rounded-[9px] flex items-center justify-center gap-2"
              >
                Explore More Homes
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
