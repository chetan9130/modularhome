import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/blog",
        destination: "/resources",
      },
      {
        source: "/blogs",
        destination: "/resources",
      },
      {
        source: "/blog/:slug",
        destination: "/resources/:slug",
      },
      {
        source: "/blogs/:slug",
        destination: "/resources/:slug",
      },
    ];
  },
};

export default nextConfig;
