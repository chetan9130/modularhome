import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicPageBySlug } from "@/lib/publicData";
import DynamicPageRenderer from "@/components/DynamicPageRenderer";

export const dynamic = "force-dynamic";

interface DynamicSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: DynamicSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found | ModularHome.com",
    };
  }

  const title = page.seoTitle || `${page.title} | ModularHome.com`;
  const description = page.metaDescription || page.subtitle || `Explore ${page.title} on ModularHome.com`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: page.featuredImage ? [{ url: page.featuredImage }] : [{ url: "/finallogo.avif" }],
    },
    alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
  };
}

export default async function DynamicSlugPage({ params }: DynamicSlugPageProps) {
  const { slug } = await params;

  // Prevent collision with reserved top-level paths
  const reservedPaths = [
    "api",
    "admin",
    "about",
    "buildings",
    "checkout",
    "contact",
    "floor-plans",
    "models",
    "quote",
    "resources",
    "upload-floor-plan",
    "videos",
    "sitemap.xml",
    "robots.txt",
    "favicon.ico",
  ];

  if (reservedPaths.includes(slug.toLowerCase())) {
    notFound();
  }

  const page = await getPublicPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Schema.org WebPage / Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.metaDescription || page.subtitle,
    url: `https://modularhome.com/${page.slug}`,
    ...(page.featuredImage && { image: page.featuredImage }),
    publisher: {
      "@type": "Organization",
      name: "ModularHome.com",
      logo: {
        "@type": "ImageObject",
        url: "https://modularhome.com/finallogo.avif",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DynamicPageRenderer page={page} />
    </>
  );
}
