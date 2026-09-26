import "dotenv/config";
import { 
  getPublicProducts, 
  getPublicCollections, 
  getPublicBlogs, 
  getPublicFloorPlans, 
  getPublicReviews, 
  getPublicFaqs, 
  getPublicSettings,
  getPublicProductBySlug,
  getPublicBlogBySlug,
  getPublicPageBySlug
} from "../../src/lib/publicData";

async function main() {
  console.log("=== VERIFYING PUBLIC DATA AGAINST LIVE DATABASE ===");
  
  const products = await getPublicProducts();
  console.log("✓ Products count:", products.length);
  if (products.length > 0) {
    console.log("  Sample product:", products[0].name, "| slug:", products[0].slug, "| price: $" + products[0].startingPrice);
    const bySlug = await getPublicProductBySlug(products[0].slug);
    console.log("  Product lookup by slug:", bySlug ? "FOUND (" + bySlug.name + ")" : "NOT FOUND");
  }

  const collections = await getPublicCollections();
  console.log("✓ Collections count:", collections.length);
  if (collections.length > 0) {
    console.log("  Sample collection:", collections[0].name, "| slug:", collections[0].slug, "| productCount:", collections[0].productCount);
  }

  const blogs = await getPublicBlogs();
  console.log("✓ Blog posts count:", blogs.length);
  if (blogs.length > 0) {
    console.log("  Sample blog:", blogs[0].title, "| slug:", blogs[0].slug);
    const bySlug = await getPublicBlogBySlug(blogs[0].slug);
    console.log("  Blog lookup by slug:", bySlug ? "FOUND (" + bySlug.title + ")" : "NOT FOUND");
  }

  const floorPlans = await getPublicFloorPlans();
  console.log("✓ Floor plans count:", floorPlans.length);
  if (floorPlans.length > 0) {
    console.log("  Sample floor plan:", floorPlans[0].title, "| price: $" + floorPlans[0].price);
  }

  const reviews = await getPublicReviews();
  console.log("✓ Reviews count:", reviews.length);
  if (reviews.length > 0) {
    console.log("  Sample review:", reviews[0].customerName, "| rating:", reviews[0].rating + " stars");
  }

  const faqs = await getPublicFaqs();
  console.log("✓ FAQs count:", faqs.length);

  const settings = await getPublicSettings();
  console.log("✓ Global Settings loaded:", !!settings);

  console.log("=== ALL PUBLIC DATA VERIFICATION COMPLETED ===");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error verifying public data:", err);
  process.exit(1);
});
