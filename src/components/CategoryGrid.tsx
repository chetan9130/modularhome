import Link from "next/link";
import Image from "next/image";
import { PublicCollection } from "@/lib/publicData";

export interface CategoryItem {
  id: string;
  name: string;
  image: string;
  href: string;
  productCount?: number;
}

interface CategoryGridProps {
  collections?: PublicCollection[];
}

export default function CategoryGrid({ collections }: CategoryGridProps) {
  // Sort collections by relevance: prioritize primary home categories, then by product count
  const sortedCollections = (collections || []).slice().sort((a, b) => {
    const aIsPrimary = /modular|prefab|cabin|barndo|kit|turnkey|affordable|log home|adu|tiny|house plans/i.test(a.name);
    const bIsPrimary = /modular|prefab|cabin|barndo|kit|turnkey|affordable|log home|adu|tiny|house plans/i.test(b.name);
    if (aIsPrimary && !bIsPrimary) return -1;
    if (!aIsPrimary && bIsPrimary) return 1;
    return (b.productCount || 0) - (a.productCount || 0);
  });

  const displayItems: CategoryItem[] = sortedCollections.slice(0, 10).map((col) => {
    let img = col.image || col.bannerImage;
    if (!img || img.includes("placeholder") || img.includes("finallogo")) {
      const lower = col.name.toLowerCase();
      if (lower.includes("barndo")) img = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=75";
      else if (lower.includes("cabin")) img = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=75";
      else if (lower.includes("kit")) img = "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=75";
      else if (lower.includes("turnkey")) img = "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=75";
      else img = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=75";
    }

    return {
      id: col.id,
      name: col.name,
      image: img,
      href: `/buildings?category=${encodeURIComponent(col.slug || col.name)}`,
      productCount: col.productCount,
    };
  });

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-[#f6f7f9]">
      <div className="wrap">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-[-1.3px] text-[#101114] m-0">
              Shop by Home Type
            </h2>
            <p className="text-sm sm:text-base text-[#6b7280] mt-1.5 mb-0">
              Explore our most popular home categories and engineered architectural series.
            </p>
          </div>
          <Link
            href="/buildings"
            className="text-[#d97706] hover:text-[#b45309] font-extrabold text-sm sm:text-base hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            View All Categories ({collections?.length || displayItems.length}) →
          </Link>
        </div>

        {/* 10 Category Cards 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {displayItems.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="card overflow-hidden group hover:-translate-y-1 transition-all block"
            >
              <div className="relative h-[135px] sm:h-[145px] w-full overflow-hidden bg-gray-100">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div className="p-3.5 bg-white flex items-center justify-between">
                <h3 className="text-sm sm:text-[15px] font-extrabold text-[#101114] group-hover:text-[#d97706] transition-colors m-0 line-clamp-1">
                  {cat.name}
                </h3>
                {typeof cat.productCount === "number" && cat.productCount > 0 && (
                  <span className="text-[11px] font-bold text-[#6b7280] ml-1 shrink-0">
                    ({cat.productCount})
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
