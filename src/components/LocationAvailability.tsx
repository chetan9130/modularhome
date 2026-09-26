"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Truck, ArrowRight, CheckCircle2, Search, Building2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { BuildingModel } from "@/data/models";
import { formatPrice } from "@/utils/currency";

const STATES_DATA = [
  { state: "Indiana", code: "IN", leadTime: "3–4 Weeks", permitRating: "Fast Approval", shippingMultiplier: 1.0 },
  { state: "Kentucky", code: "KY", leadTime: "4–5 Weeks", permitRating: "Standard", shippingMultiplier: 1.02 },
  { state: "Ohio", code: "OH", leadTime: "4–5 Weeks", permitRating: "Fast Approval", shippingMultiplier: 1.03 },
  { state: "Tennessee", code: "TN", leadTime: "4–6 Weeks", permitRating: "Standard", shippingMultiplier: 1.05 },
  { state: "Texas", code: "TX", leadTime: "5–6 Weeks", permitRating: "Fast Approval", shippingMultiplier: 1.08 },
  { state: "North Carolina", code: "NC", leadTime: "5–6 Weeks", permitRating: "Standard", shippingMultiplier: 1.06 },
  { state: "Georgia", code: "GA", leadTime: "4–6 Weeks", permitRating: "Standard", shippingMultiplier: 1.05 },
  { state: "Missouri", code: "MO", leadTime: "4–5 Weeks", permitRating: "Fast Approval", shippingMultiplier: 1.04 },
  { state: "Michigan", code: "MI", leadTime: "4–6 Weeks", permitRating: "Standard", shippingMultiplier: 1.05 },
  { state: "Florida", code: "FL", leadTime: "5–7 Weeks", permitRating: "Hurricane Certified", shippingMultiplier: 1.1 },
];

export default function LocationAvailability() {
  const [selectedState, setSelectedState] = useState<string>("IN");
  const [cityInput, setCityInput] = useState<string>("");
  const [zipInput, setZipInput] = useState<string>("");
  const [searched, setSearched] = useState<boolean>(false);
  const [allModels, setAllModels] = useState<BuildingModel[]>([]);

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setAllModels(json.data);
          }
        }
      } catch (e) {}
    }
    loadModels();
  }, []);

  const activeStateObj = STATES_DATA.find((s) => s.code === selectedState) || STATES_DATA[0];

  const availableHomes = allModels.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <section id="location" className="py-20 bg-white border-b border-[var(--line)] text-[var(--ink)]">
      <div className="wrap">
        <SectionHeading
          eyebrow="Nationwide Delivery & Permits"
          title="FIND HOMES AVAILABLE IN YOUR LOCATION"
          subtitle="Explore factory modular home availability, estimated local delivery lead times, and regional building code compliance for your state."
          align="center"
        />

        {/* Location Selector Bar */}
        <form onSubmit={handleSearch} className="mt-10 max-w-4xl mx-auto bg-[var(--soft)] border border-[var(--line)] p-5 sm:p-7 rounded-[20px] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[var(--ink)] mb-1.5">
                Select State *
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-white border border-[var(--line)] px-4 py-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--r)] rounded-[12px] font-semibold cursor-pointer"
              >
                {STATES_DATA.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.state} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[var(--ink)] mb-1.5">
                City Name (Optional)
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Indianapolis"
                className="w-full bg-white border border-[var(--line)] px-4 py-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--r)] rounded-[12px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[var(--ink)] mb-1.5">
                ZIP Code (Optional)
              </label>
              <input
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                placeholder="e.g. 47170"
                className="w-full bg-white border border-[var(--line)] px-4 py-3 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--r)] rounded-[12px]"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--r)] hover:bg-[var(--r-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-[12px] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Check Local Delivery & Availability</span>
            </button>
          </div>
        </form>

        {/* Location Status Results Box */}
        <div className="mt-8 max-w-4xl mx-auto bg-white border border-[var(--line)] rounded-[20px] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[var(--line)]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[var(--r)] text-white flex items-center justify-center shrink-0 font-bold shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-[var(--muted)] uppercase font-bold">Active Region:</div>
                <div className="text-xl font-extrabold text-[var(--ink)] font-display">
                  {activeStateObj.state} {cityInput ? `• ${cityInput}` : ""} {zipInput ? `(${zipInput})` : ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[var(--r)] bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Factory Delivery Available to {activeStateObj.state}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[var(--soft)] rounded-[14px] border border-[var(--line)]">
              <span className="text-[var(--muted)] uppercase font-bold block mb-1">Estimated Lead Time</span>
              <span className="text-sm font-extrabold text-[var(--ink)]">{activeStateObj.leadTime}</span>
            </div>

            <div className="p-4 bg-[var(--soft)] rounded-[14px] border border-[var(--line)]">
              <span className="text-[var(--muted)] uppercase font-bold block mb-1">Building Code Status</span>
              <span className="text-sm font-extrabold text-[var(--ink)]">{activeStateObj.permitRating} Compliant</span>
            </div>

            <div className="p-4 bg-[var(--soft)] rounded-[14px] border border-[var(--line)]">
              <span className="text-[var(--muted)] uppercase font-bold block mb-1">Engineering Packet</span>
              <span className="text-sm font-extrabold text-[var(--r)]">Wet-Stamped Included</span>
            </div>
          </div>

          {/* Sample Available Homes in this Region */}
          <div className="pt-2">
            <div className="text-xs font-bold uppercase text-[var(--ink)] tracking-wider mb-4">
              Factory Delivery Available to {activeStateObj.state}:
            </div>

            {availableHomes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {availableHomes.map((home) => {
                  const adjustedPrice = Math.round(home.startingPrice * activeStateObj.shippingMultiplier);
                  return (
                    <div key={home.id} className="bg-[var(--soft)] border border-[var(--line)] rounded-[16px] overflow-hidden flex flex-col justify-between hover:border-[var(--r)] transition-all">
                      <div className="relative aspect-[16/10] w-full">
                        <Image src={home.primaryImage || "/finallogo.avif"} alt={home.name} fill className="object-cover" />
                      </div>
                      <div className="p-4 space-y-1">
                        <div className="text-xs font-bold text-[var(--ink)]">{home.name}</div>
                        <div className="text-[11px] text-[var(--muted)]">{home.sqft} SQ FT • {home.bedrooms} Bed • {home.bathrooms} Bath</div>
                        <div className="text-xs font-extrabold text-[var(--r)] pt-1">Starting at {formatPrice(adjustedPrice)}</div>
                      </div>
                      <div className="p-4 pt-0">
                        <Link href={`/buildings/${home.slug}`} className="block w-full text-center text-[11px] font-bold uppercase py-2 bg-white border border-[var(--line)] hover:bg-[var(--r)] hover:text-white rounded-[10px] transition-colors">
                          View Details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-[var(--soft)] border border-[var(--line)] rounded-[16px] text-center space-y-2">
                <p className="text-xs text-[var(--ink)] font-bold">Custom engineering and direct delivery active for {activeStateObj.state}.</p>
                <p className="text-[11px] text-[var(--muted)]">Reach out to our logistics and design team to plan your build and verify regional snow &amp; wind ratings.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
