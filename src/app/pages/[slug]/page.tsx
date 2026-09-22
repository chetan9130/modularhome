import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPublicPageBySlug } from "@/lib/publicData";
import DynamicPageRenderer from "@/components/DynamicPageRenderer";

export const dynamic = "force-dynamic";

interface PagesSlugProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PagesSlugProps): Promise<Metadata> {
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

export default async function PagesSlugPage({ params }: PagesSlugProps) {
  const { slug } = await params;
  const page = await getPublicPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.metaDescription || page.subtitle,
    url: `https://modularhome.com/pages/${page.slug}`,
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
