import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modularhome.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/signup",
          "/login",
          "/verify-email",
          "/auth/callback",
          "/account",
          "/account/*",
          "/api/customer/*",
          "/admin",
          "/admin/*",
          "/api/admin",
          "/api/admin/*",
          "/checkout/*",
          "/api/payments/*",
          "/api/downloads/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
