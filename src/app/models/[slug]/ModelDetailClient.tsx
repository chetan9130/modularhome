"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Check, 
  Maximize2, 
  Play, 
  Bed, 
  Bath, 
  CheckCircle2, 
  X 
} from "lucide-react";
import { BuildingModel } from "@/data/models";
import BuildingCard from "@/components/BuildingCard";
import VideoModal from "@/components/VideoModal";
import { VideoItem } from "@/data/videos";
import { formatPrice } from "@/utils/currency";

interface ModelDetailClientProps {
  model: BuildingModel;
  relatedModels: BuildingModel[];
  phone?: string;
  companyName?: string;
}

export default function ModelDetailClient({
  model,
  relatedModels = [],
  phone = "+1 (812) 595-4033",
}: ModelDetailClientProps) {
  const primaryImg = model?.primaryImage || model?.image || (model?.gallery && model.gallery[0]) || "/finallogo.avif";
  const [activeImage, setActiveImage] = useState<string>(primaryImg);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [floorPlanExpanded, setFloorPlanExpanded] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const galleryList = Array.isArray(model?.gallery) && model.gallery.length > 0 ? model.gallery : [primaryImg];
  const featuresList = Array.isArray(model?.features) ? model.features : [];
  const specsList = Array.isArray(model?.specs) ? model.specs : [];
  const optionsList = Array.isArray(model?.customizableOptions) ? model.customizableOptions : [];
  const floorPlanImg = model?.floorPlanImage || model?.floorPlan || primaryImg;
  const startingPrice = Number(model?.startingPrice) || 89000;

  const formattedBasePrice = formatPrice(startingPrice);

  const optionsTotal = selectedOptions.reduce((acc, optId) => {
    const opt = optionsList.find((o) => o.id === optId);
    return acc + (opt ? opt.price : 0);
  }, 0);

  const totalCalculatedPrice = startingPrice + optionsTotal;

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const handleOpenVideo = () => {
    const vidUrl = model?.videoUrl || "https://www.youtube-nocookie.com/embed/MHWHDE87Pp4";
    setActiveVideo({
      id: `vid-${model?.id || "preview"}`,
      youtubeVideoId: "MHWHDE87Pp4",
      title: model?.videoTitle || `${model?.name || "Model"} Architectural Walkthrough`,
      category: "Building Tours",
      duration: model?.videoDuration || "4:30 min",
      description: `Official walkthrough of the ${model?.name || "Model"}. Discover the rigid frame engineering, high vaulted ceilings, and custom interior finishes.`,
      thumbnail: primaryImg,
      views: "142K views",
      date: "Recent Tour",
      videoUrl: vidUrl,
      embedUrl: vidUrl,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-28 text-[#101114]">
      {/* Top Breadcrumb */}
      <div className="wrap py-4 text-xs text-[#6b7280]">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-[#101114] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/buildings" className="hover:text-[#101114] transition-colors">Buildings</Link>
          <span>/</span>
          <span className="text-[#d97706] font-bold uppercase">{model?.name}</span>
        </div>
      </div>

      <div className="wrap">
        {/* HERO SECTION: Gallery + Core Specs Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Gallery Viewport (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[16/10] w-full rounded-[14px] overflow-hidden bg-[#f6f7f9] border border-[#e7e9ee] shadow-sm">
              <Image
                src={activeImage || primaryImg}
                alt={model?.name || "Building Model"}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Video Tour Quick Trigger Badge */}
              <button
                onClick={handleOpenVideo}
                className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-[9px] bg-[#0f1218]/90 hover:bg-[#fcb907] text-white hover:text-[#101114] border border-[#fcb907]/30 text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#fcb907] group-hover:fill-[#101114]" />
                <span>Watch Video Tour ({model?.videoDuration || "Tour"})</span>
              </button>
            </div>

            {/* Thumbnail Navigation Bar */}
            <div className="grid grid-cols-4 gap-3">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-[16/10] rounded-[9px] overflow-hidden border transition-all cursor-pointer ${
                    activeImage === img
                      ? "border-[#fcb907] ring-2 ring-[#fcb907]/40 scale-[1.02]"
                      : "border-[#e7e9ee] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${model?.name || "Model"} angle ${idx + 1}`}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Model Information & Sticky Pricing Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 bg-[#f6f7f9] border border-[#e7e9ee] rounded-[18px] shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d97706]">
                  {model.series} • {model.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#101114] mt-1">
                  {model.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#6b7280] mt-1.5 leading-relaxed">
                  {model.tagline}
                </p>
              </div>

              {/* Core Specs Grid */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-white border border-[#e7e9ee] rounded-[11px] text-center">
                <div className="flex flex-col items-center">
                  <Maximize2 className="w-4 h-4 text-[#d97706] mb-1" />
                  <span className="text-[10px] uppercase text-[#6b7280] font-bold">Area</span>
                  <span className="font-bold text-xs sm:text-sm text-[#101114]">{model.sqft} SQ FT</span>
                </div>
                <div className="flex flex-col items-center border-x border-[#e7e9ee]">
                  <Bed className="w-4 h-4 text-[#d97706] mb-1" />
                  <span className="text-[10px] uppercase text-[#6b7280] font-bold">Bedrooms</span>
                  <span className="font-bold text-xs sm:text-sm text-[#101114]">{model.bedrooms > 0 ? `${model.bedrooms} Bed` : "Open"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bath className="w-4 h-4 text-[#d97706] mb-1" />
                  <span className="text-[10px] uppercase text-[#6b7280] font-bold">Bathrooms</span>
                  <span className="font-bold text-xs sm:text-sm text-[#101114]">{model.bathrooms > 0 ? `${model.bathrooms} Bath` : "1 Bath"}</span>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="pt-2 border-t border-[#e7e9ee] flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Starting Price</div>
                  <div className="text-3xl font-black text-[#d97706]">
                    {formatPrice(totalCalculatedPrice)}
                  </div>
                </div>
                {selectedOptions.length > 0 && (
                  <div className="text-right">
                    <span className="text-[11px] text-[#d97706] font-bold">
                      +{formatPrice(optionsTotal)} in Options
                    </span>
                  </div>
                )}
              </div>

              {/* Call-to-action buttons */}
              <div className="space-y-2.5 pt-1">
                <Link
                  href="/quote"
                  className="btn-primary w-full py-3.5 text-xs sm:text-sm font-extrabold rounded-[11px] shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Customize & Get Official Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href="tel:+18125954033"
                    className="btn-outline py-2.5 text-xs font-bold rounded-[9px] flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Call Us</span>
                  </a>

                  <Link
                    href="/upload-floor-plan"
                    className="btn-outline py-2.5 text-xs font-bold rounded-[9px] flex items-center justify-center gap-1.5"
                  >
                    <span>Upload Plan</span>
                  </Link>
                </div>
              </div>

              {/* Engineering highlights badge */}
              <div className="p-3 bg-white border border-[#e7e9ee] rounded-[9px] flex items-center gap-2.5 text-xs text-[#6b7280]">
                <ShieldCheck className="w-4 h-4 text-[#fcb907] shrink-0" />
                <span>{model.warranty} • IBC & IRC Engineered</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED CONTENT SECTIONS */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Main Information Columns (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview */}
            <section className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                Design & Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114]">
                Architectural Overview
              </h2>
              <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                {model.description}
              </p>
            </section>

            {/* Floor Plan Section */}
            <section className="space-y-5 pt-8 border-t border-[#e7e9ee]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                    Layout & Dimensions
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114]">
                    Architectural Floor Plan
                  </h2>
                </div>
                <button
                  onClick={() => setFloorPlanExpanded(true)}
                  className="btn-outline py-1.5 px-3 text-xs font-bold rounded-[9px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge Blueprint</span>
                </button>
              </div>

              {/* Floor Plan Viewer Box */}
              <div
                onClick={() => setFloorPlanExpanded(true)}
                className="cursor-pointer relative aspect-[16/9] w-full rounded-[14px] overflow-hidden bg-[#f6f7f9] border border-[#e7e9ee] group shadow-sm"
              >
                <Image
                  src={floorPlanImg}
                  alt={`${model?.name || "Model"} Floor Plan Schematic`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="font-semibold">{model?.dimensions || "Standard Footprint"}</span>
                  <span className="text-[#f6f7f9] font-bold">Click to view full layout →</span>
                </div>
              </div>
            </section>

            {/* Technical Specifications Table */}
            <section className="space-y-5 pt-8 border-t border-[#e7e9ee]">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                  Structural Tolerances
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114]">
                  Technical Specifications
                </h2>
              </div>

              <div className="card overflow-hidden">
                <div className="divide-y divide-[#e7e9ee]">
                  <div className="grid grid-cols-2 p-3.5 text-xs">
                    <span className="text-[#6b7280] uppercase font-bold">Framing System</span>
                    <span className="text-[#101114] font-semibold">{model?.frameType || "Light Gauge Steel"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 text-xs bg-[#f6f7f9]">
                    <span className="text-[#6b7280] uppercase font-bold">Standard Dimensions</span>
                    <span className="text-[#101114] font-semibold">{model?.dimensions || "24' x 36'"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 text-xs">
                    <span className="text-[#6b7280] uppercase font-bold">Roof Pitch & Profile</span>
                    <span className="text-[#101114] font-semibold">{model?.roofPitch || "4:12 Standing Seam"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 text-xs bg-[#f6f7f9]">
                    <span className="text-[#6b7280] uppercase font-bold">Wind Speed Rating</span>
                    <span className="text-[#101114] font-semibold">{model?.windRating || "150 MPH Rated"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 text-xs">
                    <span className="text-[#6b7280] uppercase font-bold">Ground Snow Load</span>
                    <span className="text-[#101114] font-semibold">{model?.snowLoad || "50 PSF Rated"}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3.5 text-xs bg-[#f6f7f9]">
                    <span className="text-[#6b7280] uppercase font-bold">Structural Warranty</span>
                    <span className="text-[#d97706] font-bold">{model?.warranty || "50-Year Structural"}</span>
                  </div>

                  {specsList.map((spec, idx) => (
                    <div key={idx} className={`grid grid-cols-2 p-3.5 text-xs ${idx % 2 === 1 ? "bg-[#f6f7f9]" : ""}`}>
                      <span className="text-[#6b7280] uppercase font-bold">{spec.label}</span>
                      <span className="text-[#101114] font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Included Architectural Features */}
            <section className="space-y-5 pt-8 border-t border-[#e7e9ee]">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                  Standard Package
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114]">
                  Engineered Features
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuresList.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[11px] bg-[#f6f7f9] border border-[#e7e9ee] flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-[#101114] leading-relaxed font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Customization Options & Configurator (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#f6f7f9] border border-[#e7e9ee] rounded-[18px] p-6 space-y-5 sticky top-28 shadow-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                  Factory Add-ons
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#101114] mt-1">
                  Available Upgrades
                </h3>
                <p className="text-xs text-[#6b7280] mt-1">
                  Click to add options directly to your estimated pricing summary.
                </p>
              </div>

              <div className="space-y-2.5">
                {optionsList.map((option) => {
                  const isChecked = selectedOptions.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      onClick={() => toggleOption(option.id)}
                      className={`cursor-pointer p-3.5 rounded-[11px] border transition-all ${
                        isChecked
                          ? "bg-white border-[#fcb907] shadow-xs ring-1 ring-[#fcb907]"
                          : "bg-white/80 border-[#e7e9ee] hover:border-[#fcb907]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-[4px] border mt-0.5 flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "border-[#fcb907] bg-[#fcb907] text-[#101114]"
                                : "border-[#6b7280]"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold uppercase text-[#101114]">
                              {option.name}
                            </div>
                            <div className="text-[11px] text-[#6b7280] mt-0.5">
                              {option.description}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-[#d97706] shrink-0">
                          +{formatPrice(option.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-[#e7e9ee] space-y-2.5">
                <div className="flex justify-between text-xs text-[#6b7280]">
                  <span>Base Model:</span>
                  <span className="text-[#101114] font-semibold">{formattedBasePrice}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6b7280]">
                  <span>Selected Upgrades:</span>
                  <span className="text-[#d97706] font-bold">+{formatPrice(optionsTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#101114] pt-2 border-t border-[#e7e9ee]">
                  <span>Updated Estimate:</span>
                  <span className="text-[#d97706] text-xl font-black">
                    {formatPrice(totalCalculatedPrice)}
                  </span>
                </div>

                {/* Main Action CTAs */}
                <div className="space-y-2 pt-2">
                  <Link
                    href="/quote"
                    className="btn-primary w-full py-3.5 text-xs font-extrabold rounded-[11px] flex items-center justify-center gap-2"
                  >
                    <span>Request a Detailed Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="btn-outline w-full py-2.5 text-xs font-bold rounded-[11px] flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#d97706]" />
                    <span>Call {phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED MODELS SECTION */}
        {relatedModels.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#e7e9ee]">
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#d97706]">
                Similar Footprints
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#101114] mt-1">
                Related Building Models
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedModels.map((m) => (
                <BuildingCard key={m.id} model={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floor Plan Fullscreen Modal */}
      {floorPlanExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full bg-white border border-[#e7e9ee] rounded-[18px] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#e7e9ee]">
              <h3 className="text-base sm:text-lg font-black text-[#101114]">
                {model?.name} — Detailed Floor Plan ({model?.dimensions})
              </h3>
              <button
                onClick={() => setFloorPlanExpanded(false)}
                className="p-1.5 text-[#6b7280] hover:text-[#d97706] rounded-md cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full mt-4 bg-[#f6f7f9] rounded-[11px] overflow-hidden">
              <Image
                src={floorPlanImg}
                alt={`${model?.name || "Model"} Full Blueprint`}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}
