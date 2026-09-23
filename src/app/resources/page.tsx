import { Metadata } from "next";
import { getPublicBlogs } from "@/lib/publicData";
import ResourcesClient from "./ResourcesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modular Home Educational Resources & Guides | ModularHome.com",
  description: "Comprehensive educational guides on modular home construction, pricing, financing, land preparation, delivery, and custom floor plans.",
  openGraph: {
    title: "Modular Home Educational Resources & Guides | ModularHome.com",
    description: "Comprehensive educational guides on modular home construction, pricing, financing, land preparation, delivery, and custom floor plans.",
    images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" }],
  },
};

export default async function ResourcesPage() {
  const articles = await getPublicBlogs();

  return <ResourcesClient initialArticles={articles} />;
}
