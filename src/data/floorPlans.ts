export interface FloorPlan {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string;
  previewImage: string;
  gallery: string[];
  filePath?: string;
  fileFormat: string;
  category: "Cabins" | "ADUs" | "Barndominiums" | "Modern Residential" | "Duplex & Multi-Family";
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  dimensions: string;
  stories: number;
  includedItems: string[];
  features: string[];
  specs: Record<string, string>;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  isFeatured: boolean;
  displayOrder: number;
  seoTitle?: string;
  metaDescription?: string;
}

export const INITIAL_FLOOR_PLANS: FloorPlan[] = [
  {
    id: "fp-alpine-sanctuary-900",
    title: "The Alpine Sanctuary 900",
    slug: "alpine-sanctuary-900",
    tagline: "Scandinavian-Inspired Modern A-Frame Cabin Blueprint Kit",
    description:
      "A high-performance 2-bedroom modern cabin blueprint package optimized for sloped terrain, snowy climates, and rapid steel framing assembly. Includes complete foundation engineering, structural steel framing layouts, electrical blueprints, and plumbing riser diagrams.",
    price: 495,
    salePrice: 395,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "Cabins",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 900,
    dimensions: "26x36 ft",
    stories: 2,
    includedItems: [
      "Architectural CAD Drawings (.DWG)",
      "Print-Ready Vector PDF (24x36 Arch D)",
      "Foundation & Anchor Bolt Engineering Details",
      "Structural Steel Framing & Truss Layouts",
      "Electrical, Mechanical & Plumbing Schematics",
      "Bill of Materials & Takeoff Schedule",
    ],
    features: [
      "Loft master bedroom with glass gable",
      "Open concept double-height great room",
      "Covered front cedar deck (120 sq ft)",
      "Energy Star R-38 thermal envelope design",
      "Engineered for 60 PSF snow load",
    ],
    specs: {
      "Roof Pitch": "12/12 A-Frame",
      "Ceiling Height": "18 ft Vaulted",
      "Foundation Type": "Slab or Pier/Beam",
      "Framing": "Light Gauge Steel (Cold-Formed)",
      "Exterior Siding": "Standing Seam Metal + Wood Slat Accents",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 1,
    seoTitle: "The Alpine Sanctuary 900 Floor Plan Blueprint Kit | ModularHome",
    metaDescription:
      "Download complete architectural construction blueprints for The Alpine Sanctuary 900 cabin kit. PDF + CAD formats included.",
  },
  {
    id: "fp-haven-barndominium-2400",
    title: "The Haven Barndominium 2400",
    slug: "haven-barndominium-2400",
    tagline: "Spacious 4-Bedroom Open Concept Steel Home with Integrated Shop",
    description:
      "Complete builder-ready architectural plans for a 2,400 sqft residential steel barndominium with a 30x40 attached 2-bay garage and workshop. Features cathedral ceilings, wraparound porch, and structural steel load calculations.",
    price: 795,
    salePrice: 595,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "Barndominiums",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    dimensions: "40x60 ft",
    stories: 1,
    includedItems: [
      "Full Architectural Construction Set",
      "Steel Truss & Column Engineered Layouts",
      "Electrical Wiring Diagrams & Panel Schedules",
      "Plumbing Schematics & Riser Plans",
      "HVAC Duct Sizing & Load Calculations",
      "Window & Door Schedules",
    ],
    features: [
      "2-Bay 1,200 sqft attached workshop/garage",
      "Massive 10ft kitchen island with walk-in pantry",
      "Primary suite with dual walk-in closets",
      "Expansive 8ft covered wraparound porch",
      "Clearspan steel structure with no interior load-bearing walls",
    ],
    specs: {
      "Clear Span": "40 ft Column-Free",
      "Eave Height": "16 ft",
      "Roof Pitch": "4/12 Gable",
      "Insulation": "R-30 Closed Cell Spray Foam Ready",
      "Foundation": "Monolithic Engineered Slab",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 2,
    seoTitle: "The Haven Barndominium 2400 Architectural Kit | ModularHome",
    metaDescription:
      "Complete 4-bedroom barndominium floor plan package with shop space. Instant CAD & stamped PDF download.",
  },
  {
    id: "fp-metro-backyard-adu-550",
    title: "The Metro Backyard ADU 550",
    slug: "metro-backyard-adu-550",
    tagline: "Efficient Turnkey 1-Bedroom Secondary Suite & Granny Pod",
    description:
      "Designed specifically to meet nationwide municipal ADU setback and height requirements. Includes full kitchen layout, walk-in shower, dedicated laundry closet, and pre-engineered rooftop solar structural provisions.",
    price: 395,
    salePrice: 295,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "ADUs",
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 550,
    dimensions: "20x28 ft",
    stories: 1,
    includedItems: [
      "Architectural CAD (.DWG) + PDF Set",
      "Permit-Ready Title 24 / Energy Calculation Ready",
      "Foundation Plan (Monolithic Slab or Stem Wall)",
      "Electrical Layout with Subpanel Spec",
      "Plumbing & Mechanical Schematics",
    ],
    features: [
      "Full L-shaped kitchen with full-size appliances",
      "Dedicated stackable washer/dryer closet",
      "Pocket doors for maximum usable floor area",
      "Zero-step curbless shower for accessibility",
      "Solar-ready roof truss design",
    ],
    specs: {
      "Ceiling Height": "9 ft Flat",
      "Footprint": "20 ft Wide x 27.5 ft Deep",
      "Max Ridge Height": "13.5 ft (Meets strict ADU caps)",
      "Framing": "Panelized Cold-Formed Steel",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 3,
    seoTitle: "The Metro Backyard ADU 550 Plans | ModularHome",
    metaDescription:
      "Builder-grade accessory dwelling unit floor plan blueprints. Rapid permit ready.",
  },
  {
    id: "fp-horizon-vista-villa-1800",
    title: "The Horizon Vista Villa 1800",
    slug: "horizon-vista-villa-1800",
    tagline: "Luxury Contemporary 3-Bedroom Modular Residence with Courtyard",
    description:
      "A luxury modern residential layout with split-bedroom configuration, master retreat with private patio, and 12-foot floor-to-ceiling glass wall framing details.",
    price: 650,
    salePrice: 495,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "Modern Residential",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    dimensions: "36x50 ft",
    stories: 1,
    includedItems: [
      "Complete 24x36 Architectural Drawing Set",
      "Structural Steel Column & Beam Calculations",
      "Window & Door Rough Opening Schedules",
      "Electrical, Lighting & Switching Plans",
      "Plumbing Supply & DWV Diagrams",
    ],
    features: [
      "Central private sheltered courtyard patio",
      "12ft floor-to-ceiling panoramic glass walls",
      "Private master wing with freestanding soaking tub",
      "Dedicated home office / flex studio",
      "Concealed duct mini-split HVAC design",
    ],
    specs: {
      "Ceiling Height": "10 ft to 12 ft",
      "Dimensions": "36 ft x 50 ft",
      "Roof Pitch": "1.5/12 Modern Low-Slope",
      "Framing": "Hybrid Structural Steel + Cold-Formed Infill",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 4,
    seoTitle: "The Horizon Vista Villa 1800 Blueprint Set | ModularHome",
    metaDescription:
      "Contemporary 3-bedroom luxury modular home architectural blueprints and engineering diagrams.",
  },
  {
    id: "fp-cascade-view-sip-kit-1200",
    title: "The Cascade View SIP Home Kit 1200",
    slug: "cascade-view-sip-kit-1200",
    tagline: "Ultra-Efficient 3-Bedroom Panelized SIP House Kit Blueprint",
    description:
      "Engineered specifically for panelized SIP (Structural Insulated Panel) assembly. Features rapid bolt-together construction, thermal break insulation, and modern open-concept layout.",
    price: 550,
    salePrice: 425,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "Cabins",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    dimensions: "30x40 ft",
    stories: 1,
    includedItems: [
      "SIP Panel Layout & Assembly Drawings",
      "Foundation & Anchor Details",
      "Electrical Chase Cutout Plans",
      "Plumbing Layout & Rough-in Specs",
      "Full Materials Checklist",
    ],
    features: [
      "Continuous R-32 wall insulation",
      "Pre-cut window and door bucks",
      "Spacious covered porch with metal roof",
      "Split bedroom privacy design",
      "Low operating utility cost profile",
    ],
    specs: {
      "Wall System": "6.5-inch EPS/OSB SIP Panels",
      "Roof System": "8.25-inch R-40 SIP Roof",
      "Foundation": "Slab or Crawlspace",
    },
    status: "PUBLISHED",
    isFeatured: false,
    displayOrder: 5,
    seoTitle: "The Cascade View SIP Home Kit Blueprint | ModularHome",
    metaDescription:
      "Panelized SIP panel home kit blueprints. Rapid assembly, extreme thermal efficiency.",
  },
  {
    id: "fp-duplex-ridge-estate-2800",
    title: "The Duplex Ridge Estate 2800",
    slug: "duplex-ridge-estate-2800",
    tagline: "Modern Dual-Unit Investment & Rental Modular Floor Plan",
    description:
      "Two mirror-image 2-bedroom, 2-bathroom units (1,400 sqft each) under a single modern roofline. Engineered with high STC soundproof party walls, separate utility meters, and private entrances.",
    price: 895,
    salePrice: 695,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "Duplex & Multi-Family",
    bedrooms: 4,
    bathrooms: 4,
    squareFeet: 2800,
    dimensions: "40x70 ft",
    stories: 1,
    includedItems: [
      "Complete 2-Unit Architectural Blueprints",
      "STC 58+ Acoustic Wall & Floor Details",
      "Dual-Meter Electrical & Plumbing Plans",
      "Foundation & Structural Framing Package",
      "Full Materials Schedule",
    ],
    features: [
      "Independent entrances and covered porches",
      "Sound-isolated demising party wall system",
      "Dual private outdoor patios",
      "Identical high-efficiency HVAC zones",
      "High rental yield and Airbnb potential",
    ],
    specs: {
      "Total Sq Ft": "2,800 sq ft (1,400 sq ft per unit)",
      "Bedrooms": "4 Total (2 per unit)",
      "Bathrooms": "4 Total (2 per unit)",
      "Framing": "Cold-Formed Steel",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 6,
    seoTitle: "The Duplex Ridge Estate 2800 Blueprints | ModularHome",
    metaDescription:
      "Dual-unit investment modular home blueprints. Complete separate meters & acoustic isolation.",
  },
  {
    id: "fp-summit-haven-barndo-3200",
    title: "The Summit Haven Barndo 3200",
    slug: "summit-haven-barndo-3200",
    tagline: "Grand 5-Bedroom Luxury Barndominium with 3-Car RV Garage",
    description:
      "Our largest luxury steel barndominium floor plan. Features a 30ft cathedral great room, chef's kitchen, master wing, mezzanine loft, and a 1,600 sqft high-clearance RV/boat garage.",
    price: 995,
    salePrice: 795,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "Barndominiums",
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 3200,
    dimensions: "50x80 ft",
    stories: 2,
    includedItems: [
      "Full Architectural Construction Drawing Set",
      "Heavy-Duty Red-Iron Steel Frame Engineering",
      "Mezzanine & Stairway Structural Details",
      "Complete MEP (Mechanical, Electrical, Plumbing) Plans",
      "Door, Window & Hardware Schedules",
    ],
    features: [
      "14ft RV garage overhead door clearance",
      "Soaring 24ft stone fireplace wall in great room",
      "Second-story loft entertainment lounge",
      "Dedicated mudroom & dog wash station",
      "Wraparound covered outdoor entertaining patio",
    ],
    specs: {
      "Clear Span": "50 ft Width",
      "Length": "80 ft Total (40ft Living + 40ft Garage/Shop)",
      "Ceiling Height": "24 ft Vaulted",
      "Framing": "Rigid Frame Steel",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 7,
    seoTitle: "The Summit Haven Barndo 3200 Architectural Set | ModularHome",
    metaDescription:
      "5-bedroom grand luxury barndominium floor plan package with RV garage.",
  },
  {
    id: "fp-tiny-mod-minimalist-400",
    title: "The Tiny Mod Minimalist 400",
    slug: "tiny-mod-minimalist-400",
    tagline: "Smart Compact Studio & ADU Floor Plan with Loft",
    description:
      "An ultra-compact 400 sqft footprint that lives like a full home. Features clever built-in storage, full galley kitchen, European wet room bath, and sleeping loft.",
    price: 295,
    salePrice: 225,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    ],
    fileFormat: "PDF + CAD (DWG)",
    category: "ADUs",
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 400,
    dimensions: "16x25 ft",
    stories: 1,
    includedItems: [
      "Architectural CAD (.DWG) + PDF",
      "Foundation (Pier/Beam or Slab) Details",
      "Electrical Diagram for 100A Panel",
      "Compact Plumbing Riser Details",
      "Custom Built-in Millwork Details",
    ],
    features: [
      "Vaulted ceiling with skylight provisions",
      "Fold-away dining and workstation nook",
      "Under-stair hidden storage drawers",
      "Full-sized induction cooktop & refrigerator alcove",
      "Permit-ready for quick municipal review",
    ],
    specs: {
      "Footprint": "16 ft x 25 ft",
      "Living Area": "400 sq ft (including loft)",
      "Height": "14 ft Peak",
      "Framing": "Light Gauge Steel",
    },
    status: "PUBLISHED",
    isFeatured: false,
    displayOrder: 8,
    seoTitle: "The Tiny Mod Minimalist 400 Floor Plan | ModularHome",
    metaDescription:
      "Modern tiny home & ADU architectural blueprints. Optimized for rapid permitting and build.",
  },
];
