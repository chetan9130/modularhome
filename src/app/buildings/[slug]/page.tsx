import { notFound } from "next/navigation";
import ModelDetailClient from "@/app/models/[slug]/ModelDetailClient";
import { getPublicProductBySlug, getPublicProducts } from "@/lib/publicData";
import { truncateText } from "@/utils/text";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getPublicProductBySlug(slug);
  if (!model) return { title: "Building Not Found | ModularHome.com" };

  return {
    title: `${model.name} (${model.sqft} SQ FT) | ModularHome.com`,
    description: truncateText(model.description, 160) || `Explore the ${model.name} modular home model on ModularHome.com.`,
  };
}

export default async function BuildingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getPublicProductBySlug(slug);

  if (!model) {
    notFound();
  }

  const allProducts = await getPublicProducts();
  const relatedModels = allProducts
    .filter(
      (m) => m.id !== model.id && (m.category === model.category || m.series === model.series)
    )
    .slice(0, 3);

  return <ModelDetailClient model={model} relatedModels={relatedModels} />;
}
