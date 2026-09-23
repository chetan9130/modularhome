import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Check, 
  Maximize2, 
  Layers, 
  Wind, 
  Compass, 
  Play, 
  FileDown, 
  Calculator,
  Bed,
  Bath,
  Home
} from "lucide-react";
import { BUILDING_MODELS, BuildingModel } from "@/data/models";
import BuildingCard from "@/components/BuildingCard";
import ModelDetailClient from "./ModelDetailClient";
import { getPublicProductBySlug, getPublicProducts } from "@/lib/publicData";
import { getPublicGlobalSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getPublicProductBySlug(slug);
  if (!model) return { title: "Model Not Found | ModularHome.com" };

  return {
    title: `${model.name} (${model.sqft} SQ FT) | ModularHome.com`,
    description: model.description,
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getPublicProductBySlug(slug);

  if (!model) {
    notFound();
  }

  const [allProducts, settings] = await Promise.all([
    getPublicProducts(),
    getPublicGlobalSettings(),
  ]);

  const relatedModels = allProducts
    .filter(
      (m) => m.id !== model.id && (m.category === model.category || m.series === model.series)
    )
    .slice(0, 3);

  return (
    <ModelDetailClient
      model={model}
      relatedModels={relatedModels}
      phone={settings.phone}
      companyName={settings.companyName}
    />
  );
}

