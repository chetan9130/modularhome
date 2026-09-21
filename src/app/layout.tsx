import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIBuildAssistant from "@/components/AIBuildAssistant";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair-next",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope-next",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://modularhome.com"),
  title: "ModularHome.com | Modern Homes. A Smarter Way to Build.",
  description: "Explore modular homes, prefab homes, cabins, ADUs, barndominiums, floor plans and custom home options.",
  keywords: [
    "ModularHome.com",
    "Modular Homes",
    "Prefab Homes",
    "Barndominiums",
    "Cabins",
    "Tiny Homes",
    "ADUs",
    "A-Frame Homes",
    "Floor Plans",
    "Factory Built Homes"
  ],
  icons: {
    icon: [
      { url: "/favicon.png?v=4", type: "image/png" },
      { url: "/favicon-32x32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=4", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=4" },
    ],
    shortcut: "/favicon.png?v=4",
    apple: [
      { url: "/apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "ModularHome.com | Modern Homes. A Smarter Way to Build.",
    description: "Explore modular homes, prefab homes, cabins, ADUs, barndominiums, floor plans and custom home options.",
    type: "website",
    images: [
      {
        url: "/finallogo.avif",
        width: 1200,
        height: 630,
        alt: "ModularHome.com Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${manrope.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4" />
        <link rel="shortcut icon" href="/favicon.png?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4" />
      </head>
      <body className={`min-h-screen flex flex-col bg-white text-[#101114] antialiased selection:bg-[#fcb907] selection:text-[#101114] ${manrope.className}`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <AIBuildAssistant />
      </body>
    </html>
  );
}
