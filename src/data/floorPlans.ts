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
    id: "fp-1",
    title: "The Alpine Sanctuary 900",
    slug: "alpine-sanctuary-900",
    tagline: "Modern Scandinavian A-Frame Cabin with Loft & Glass Gable",
    description:
      "A high-performance 2-bedroom modern cabin blueprint package optimized for sloped terrain, snowy climates, and rapid steel framing assembly. Includes complete foundation engineering, framing layouts, electrical blueprints, and plumbing riser diagrams.",
    price: 495,
    salePrice: 395,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200&auto=format&fit=crop",
    ],
    filePath: "downloads/blueprints/alpine-sanctuary-900-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    category: "Cabins",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 900,
    dimensions: "26x36 ft",
    stories: 2,
    includedItems: [
      "Architectural Floor Plans & Dimensions",
      "Structural Steel Framing & Truss Layouts",
      "Electrical & Lighting Schematics",
      "Plumbing & HVAC Routing Blueprints",
      "Foundation & Anchor Bolt Engineering Details",
      "Complete Bill of Materials (BOM) & Cut List",
    ],
    features: [
      "Vaulted 22-ft cathedral ceiling in main living area",
      "Upper mezzanine loft suitable for primary bedroom or studio",
      "Expansive front glass gable maximizing natural light",
      "Covered 8-ft outdoor porch with steel column details",
      "Engineered for 60 PSF snow load and 130 MPH wind rating",
    ],
    specs: {
      "Building Type": "A-Frame Modular Cabin",
      "Estimated Build Time": "6 - 8 Weeks",
      "Roof Pitch": "12:12 High Pitch",
      "Foundation Type": "Pier & Beam or Monolithic Slab",
      "Insulation Rating": "R-30 Roof / R-21 Walls",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 1,
    seoTitle: "The Alpine Sanctuary 900 Floor Plan Blueprint | ModularHome",
    metaDescription:
      "Download complete architectural construction blueprints for The Alpine Sanctuary 900 cabin kit. PDF + CAD formats included.",
  },
  {
    id: "fp-2",
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
    ],
    filePath: "downloads/blueprints/haven-barndominium-2400-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    category: "Barndominiums",
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    dimensions: "40x60 ft",
    stories: 1,
    includedItems: [
      "Full Construction Blueprints (1/4” Scale)",
      "Clear-Span Steel Truss Framing Plans",
      "Workshop & Garage Electrical Layouts (200A)",
      "Foundation & Slab Structural Detail Sheets",
      "Plumbing Isometrics & Drain Line Schematics",
      "Comprehensive Material Takeoff Specification",
    ],
    features: [
      "Massive open-concept great room with 16-ft vaulted ceilings",
      "Dedicated 1,200 sqft attached workshop with dual 12x12 roll-up doors",
      "Master suite with walk-in closet and spa bath layout",
      "Pantry & utility room with outdoor mudroom access",
      "Wraparound 10-ft covered porch around living areas",
    ],
    specs: {
      "Building Type": "Steel Barndominium",
      "Clear Span": "40 Feet (No Interior Load Bearing Walls)",
      "Roof Pitch": "4:12 Pitch",
      "Foundation Type": "Engineered Post-Tension Slab",
      "Wind Rating": "150 MPH Hurricane Rated",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 2,
    seoTitle: "The Haven Barndominium 2400 Architectural Plans | ModularHome",
    metaDescription:
      "Complete 4-bedroom barndominium floor plan package with shop space. Instant CAD & stamped PDF download.",
  },
  {
    id: "fp-3",
    title: "The Metro Backyard ADU 550",
    slug: "metro-backyard-adu-550",
    tagline: "Efficient 1-Bedroom Turnkey Accessory Dwelling Unit",
    description:
      "Designed specifically to meet nationwide municipal ADU setback and height requirements. Includes full kitchen layout, walk-in shower, dedicated laundry closet, and pre-engineered rooftop solar structural provisions.",
    price: 350,
    salePrice: 275,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    ],
    filePath: "downloads/blueprints/metro-backyard-adu-550-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    category: "ADUs",
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 550,
    dimensions: "20x28 ft",
    stories: 1,
    includedItems: [
      "Code-Compliant Architectural Plan Set",
      "Light-Gauge Steel Stud Framing Blueprint",
      "Title 24 / IECC Energy Compliance Notes",
      "Compact Mechanical & Electrical Schedule",
      "Foundation Pier or Slab Engineering Details",
    ],
    features: [
      "Permit-ready layout optimized for urban & suburban lots",
      "Open kitchen with full-size appliances and quartz island",
      "Separate private bedroom with closet and pocket doors",
      "Rooftop solar mounting points pre-engineered",
      "High thermal efficiency envelope",
    ],
    specs: {
      "Building Type": "Accessory Dwelling Unit (ADU)",
      "Permit Status": "Permit-Ready Nationwide Standards",
      "Ceiling Height": "9-ft Flat Ceilings",
      "Plumbing": "Centralized Wet Wall Configuration",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 3,
    seoTitle: "The Metro Backyard ADU 550 Plans | ModularHome",
    metaDescription:
      "Builder-grade accessory dwelling unit floor plan blueprints. Rapid permit ready.",
  },
  {
    id: "fp-4",
    title: "The Horizon Vista Villa 1800",
    slug: "horizon-vista-villa-1800",
    tagline: "Modern 3-Bedroom Steel Frame Residence with Courtyard",
    description:
      "A luxury modern residential layout with split-bedroom configuration, master retreat with private patio, and 12-foot floor-to-ceiling glass wall framing details.",
    price: 650,
    salePrice: 495,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    ],
    filePath: "downloads/blueprints/horizon-vista-villa-1800-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    category: "Modern Residential",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    dimensions: "36x50 ft",
    stories: 1,
    includedItems: [
      "Full Architectural Blueprints (Elevations, Plans, Sections)",
      "Structural Cold-Formed Steel Framing Calculations",
      "Courtyard Glass Door System Specs",
      "Plumbing, HVAC & Electrical System Details",
      "Interior Cabinetry & Millwork Dimensions",
    ],
    features: [
      "Central protected outdoor courtyard for entertaining",
      "Separated master wing with luxury bath and dressing room",
      "Chefs kitchen with hidden scullery pantry",
      "Floor-to-ceiling sliding glass wall integration",
    ],
    specs: {
      "Building Type": "Modern Single-Story Luxury Villa",
      "Roof Pitch": "Low-Slope Modern Parapet",
      "Glazing Spec": "Double-Glazed Low-E Architectural Glass",
      "Structural Steel": "Light Gauge C-Channels & Heavy Box Columns",
    },
    status: "PUBLISHED",
    isFeatured: false,
    displayOrder: 4,
    seoTitle: "The Horizon Vista Villa 1800 Blueprint Set | ModularHome",
    metaDescription:
      "Contemporary 3-bedroom luxury modular home architectural blueprints and engineering diagrams.",
  },
  {
    id: "fp-5",
    title: "The Timberline Loft 1200",
    slug: "timberline-loft-1200",
    tagline: "2-Story Alpine Modern Chalet with Wrap-Around Deck",
    description:
      "An elevated mountain residence plan featuring a double-height great room, exposed steel and timber trusses, 3 bedrooms, and dual outdoor viewing decks.",
    price: 550,
    salePrice: 440,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    ],
    filePath: "downloads/blueprints/timberline-loft-1200-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    category: "Cabins",
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    dimensions: "28x34 ft",
    stories: 2,
    includedItems: [
      "Complete 2-Story Architectural Construction Set",
      "Deck & Balcony Cantilever Engineering Details",
      "Structural Wind & Seismic Calculations",
      "Full Mechanical & Electrical Layout",
    ],
    features: [
      "Dramatic 20-ft wall of windows oriented for panoramic views",
      "Upper primary suite with private Juliet balcony",
      "Main floor guest bedrooms and shared bath",
      "Mudroom with exterior side entrance for ski/gear storage",
    ],
    specs: {
      "Building Type": "Two-Story Mountain Chalet",
      "Roof Pitch": "8:12 Steep Gable",
      "Snow Rating": "70 PSF Extreme Snow Load",
    },
    status: "PUBLISHED",
    isFeatured: true,
    displayOrder: 5,
    seoTitle: "The Timberline Loft 1200 Blueprint Package | ModularHome",
    metaDescription:
      "2-story mountain chalet and cabin blueprints with wrap-around deck. Complete construction drawing set.",
  },
  {
    id: "fp-6",
    title: "The Dualis Modern Duplex 2000",
    slug: "dualis-modern-duplex-2000",
    tagline: "High-Yield Income Generating Dual-Living Modular Blueprint",
    description:
      "Smart multi-family modular blueprints with two identical 2-bedroom, 1-bath mirrored units sharing a sound-attenuated party wall. Perfect for investment properties, long-term rentals, or co-living.",
    price: 850,
    salePrice: 650,
    currency: "USD",
    previewImage:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop",
    ],
    filePath: "downloads/blueprints/dualis-modern-duplex-2000-complete-kit.zip",
    fileFormat: "PDF + CAD (DWG)",
    category: "Duplex & Multi-Family",
    bedrooms: 4,
    bathrooms: 2,
    squareFeet: 2000,
    dimensions: "40x50 ft",
    stories: 1,
    includedItems: [
      "Complete Duplex Architectural Drawings (2 Units)",
      "Party Wall Sound & Fire Separation Details (STC 55 / 1-Hr Fire)",
      "Dual Electrical Meters & Subpanel Diagrams",
      "Dual Water & HVAC Distribution Layouts",
    ],
    features: [
      "Two completely independent living units (1,000 sqft each)",
      "Separate private front porches and rear entries",
      "Sound-damped common wall for maximum tenant privacy",
      "Efficient rectangular footprint for low-cost construction",
    ],
    specs: {
      "Building Type": "Side-by-Side Duplex",
      "Units": "2 Separate 2-Bed / 1-Bath Residences",
      "Foundation Type": "Slab or Crawlspace",
    },
    status: "PUBLISHED",
    isFeatured: false,
    displayOrder: 6,
    seoTitle: "The Dualis Modern Duplex 2000 Architectural Blueprints | ModularHome",
    metaDescription:
      "High-performance modular duplex blueprints. Two 2-bed units with separate utilities and fire-rated party wall.",
  },
];
