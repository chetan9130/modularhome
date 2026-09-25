export interface BuildingModel {
  id: string;
  slug: string;
  name: string;
  series: string;
  category: string;
  architecturalStyle?: string;
  tagline: string;
  description: string;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  startingPrice: number;
  dimensions: string;
  frameType: string;
  roofPitch: string;
  windRating: string;
  snowLoad: string;
  warranty: string;
  primaryImage: string;
  image?: string;
  gallery: string[];
  floorPlanImage: string;
  floorPlan?: string;
  videoDuration?: string;
  videoTitle?: string;
  video?: string;
  videoUrl?: string;
  features: string[];
  specs: {
    label: string;
    value: string;
  }[];
  customizableOptions: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

export const CATEGORIES = [
  {
    id: "Modular Homes",
    title: "Modular Homes",
    tagline: "Factory-built homes designed for permanent installation.",
    description: "Modern construction, customizable layouts, and efficient building processes.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Modular+Homes",
    cta: "View Modular Homes",
  },
  {
    id: "Prefab Homes",
    title: "Prefab Homes",
    tagline: "Professionally manufactured modern homes.",
    description: "Engineered in climate-controlled facilities for precision quality and rapid site assembly.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Prefab+Homes",
    cta: "View Prefab Homes",
  },
  {
    id: "Barndominiums",
    title: "Barndominiums",
    tagline: "Modern barn-style living with open spaces.",
    description: "Combining residential comfort with massive open floor plans and rigid steel structure options.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Barndominiums",
    cta: "View Barndominiums",
  },
  {
    id: "House Kits",
    title: "House Kits",
    tagline: "Ready-to-build housing packages.",
    description: "Pre-engineered structural components and detailed blueprints for efficient home building.",
    image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=House+Kits",
    cta: "View House Kits",
  },
  {
    id: "Tiny Homes",
    title: "Tiny Homes",
    tagline: "Compact, efficient homes for flexible living.",
    description: "Smart floor plans maximizing space, energy efficiency, and modern comfort.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Tiny+Homes",
    cta: "View Tiny Homes",
  },
  {
    id: "Park Models",
    title: "Park Models",
    tagline: "Resort-grade RV & park model modular homes.",
    description: "Architectural park model homes designed for seasonal, recreational, or resort living communities.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Park+Models",
    cta: "View Park Models",
  },
  {
    id: "Cabins",
    title: "Cabins",
    tagline: "Rustic, modern, and mountain-style log cabins.",
    description: "Handcrafted timber and cabin structures suitable for residential, vacation, or retreat use.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Cabins",
    cta: "View Cabins",
  },
  {
    id: "ADUs & Granny Pods",
    title: "ADUs & Granny Pods",
    tagline: "Additional dwelling units for family or income.",
    description: "Independent living units perfect for guest suites, rental income, offices, or private living.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=ADUs+%26+Granny+Pods",
    cta: "View ADUs",
  },
  {
    id: "A-Frame Homes",
    title: "A-Frame Homes",
    tagline: "Distinctive triangular architectural designs.",
    description: "Iconic steep-pitched roof structures with dramatic glass walls ideal for modern vacation living.",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=A-Frame+Homes",
    cta: "View A-Frames",
  },
  {
    id: "Commercial Buildings",
    title: "Commercial Buildings",
    tagline: "Modular solutions for commercial applications.",
    description: "Durable modular structures for offices, retail, hospitality, community spaces, and business use.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Commercial+Buildings",
    cta: "View Commercial",
  },
  {
    id: "Custom Homes",
    title: "Custom Homes",
    tagline: "Bespoke modular homes tailored to your vision.",
    description: "Custom-designed modular solutions engineered based on customer requirements, land, and budget.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    count: 0,
    href: "/buildings?category=Custom+Homes",
    cta: "Explore Custom Homes",
  },
];

export const BUILDING_MODELS: BuildingModel[] = [];
