"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PublicGlobalSettings } from "@/lib/settings";
import { CmsPage } from "@/lib/publicData";

export interface FooterProps {
  initialSettings?: PublicGlobalSettings;
  customPages?: CmsPage[];
}

export default function Footer({ initialSettings, customPages = [] }: FooterProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const companyName = initialSettings?.companyName || "ModularHome.com";
  const logoUrl = initialSettings?.logoUrl || "/finallogo.avif";
  const phone = initialSettings?.phone || "+1 (812) 595-4033";
  const emailAddress = initialSettings?.email || "support@modularhome.com";
  const address = initialSettings?.address || "Factory Headquarters, IN & Nationwide Delivery";
  const footerText = initialSettings?.footerText || "ModularHome.com leads the American prefabricated housing movement with precision-engineered modular residences, luxury barndominiums, and rapid-deployment cabin kits.";
  const socialLinks = initialSettings?.socialLinks || {};

  // Filter published custom pages
  const publishedPages = (customPages || []).filter(
    (p) => p.status === "PUBLISHED" && p.slug !== "home" && !p.slug.startsWith("/")
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Newsletter Subscriber",
            email: email.trim(),
            enquiryDetails: "Subscribed to modular housing newsletter and updates.",
            source: "NEWSLETTER",
          }),
        });
      } catch (err) {
        console.error("Newsletter subscription error:", err);
      }
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white border-t border-[#e7e9ee] pt-12 sm:pt-14 pb-8">
      <div className="wrap">
        {/* 4 Columns: Brand (1.5fr), Quick Links (1fr), Home Types & Resources (1fr), Contact & Newsletter (1fr) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(3,1fr)] gap-8 sm:gap-10 pb-8 text-center md:text-left">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center justify-center md:justify-start">
              <Image
                src={logoUrl}
                alt={companyName}
                width={200}
                height={46}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            <p className="text-sm text-[#69707d] leading-relaxed max-w-sm mx-auto md:mx-0 font-medium">
              {footerText}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 justify-center md:justify-start pt-2">
              {socialLinks.facebook !== "" && (
                <a
                  href={socialLinks.facebook || "https://www.facebook.com"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-[#0f1218] text-white flex items-center justify-center hover:bg-[#fcb907] hover:text-[#101114] transition-all hover:scale-110 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {socialLinks.instagram !== "" && (
                <a
                  href={socialLinks.instagram || "https://www.instagram.com"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-[#0f1218] text-white flex items-center justify-center hover:bg-[#fcb907] hover:text-[#101114] transition-all hover:scale-110 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {socialLinks.youtube !== "" && (
                <a
                  href={socialLinks.youtube || "https://www.youtube.com"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-[#0f1218] text-white flex items-center justify-center hover:bg-[#fcb907] hover:text-[#101114] transition-all hover:scale-110 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
              {socialLinks.tiktok !== "" && (
                <a
                  href={socialLinks.tiktok || "https://www.tiktok.com"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-full bg-[#0f1218] text-white flex items-center justify-center hover:bg-[#fcb907] hover:text-[#101114] transition-all hover:scale-110 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.3 1.05.21 2.18-.08 2.96-.8.61-.53.97-1.3 1.01-2.11.05-3.87.02-7.74.03-11.61z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base font-black text-[#101114] mt-0 mb-3">
              Quick Links
            </h4>
            <div className="space-y-2 text-sm text-[#555d69] font-medium">
              <div><Link href="/" className="hover:text-[#d97706] transition-colors">Home</Link></div>
              <div><Link href="/buildings" className="hover:text-[#d97706] transition-colors">Homes & Models</Link></div>
              <div><Link href="/floor-plans" className="hover:text-[#d97706] transition-colors">Floor Plan Store</Link></div>
              <div><Link href="/upload-floor-plan" className="hover:text-[#d97706] transition-colors">Custom Upload</Link></div>
              <div><Link href="/videos" className="hover:text-[#d97706] transition-colors">Video Gallery</Link></div>
              <div><Link href="/about" className="hover:text-[#d97706] transition-colors">About Us</Link></div>
              <div><Link href="/contact" className="hover:text-[#d97706] transition-colors">Contact & Quotes</Link></div>
            </div>
          </div>

          {/* Column 3: Home Types & Custom Guides */}
          <div>
            <h4 className="text-base font-black text-[#101114] mt-0 mb-3">
              Guides & Special Pages
            </h4>
            <div className="space-y-2 text-sm text-[#555d69] font-medium">
              {publishedPages.slice(0, 4).map((p) => (
                <div key={p.id}>
                  <Link href={`/${p.slug}`} className="hover:text-[#d97706] transition-colors">
                    {p.title}
                  </Link>
                </div>
              ))}
              <div><Link href="/floor-plans?category=Cabins" className="hover:text-[#d97706] transition-colors">Cabins & A-Frames</Link></div>
              <div><Link href="/floor-plans?category=Barndominiums" className="hover:text-[#d97706] transition-colors">Barndominium Plans</Link></div>
              <div><Link href="/resources" className="hover:text-[#d97706] transition-colors">Buying & Permits Guide</Link></div>
            </div>
          </div>

          {/* Column 4: Contact Us & Newsletter */}
          <div>
            <h4 className="text-base font-black text-[#101114] mt-0 mb-3">
              Direct Contact
            </h4>
            <div className="space-y-2 text-sm text-[#555d69] font-medium">
              <div>
                <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-[#d97706] font-bold text-[#101114]">
                  ☎ {phone}
                </a>
              </div>
              <div>
                <a href={`mailto:${emailAddress}`} className="hover:text-[#d97706] break-all">
                  ✉ {emailAddress}
                </a>
              </div>
              <div className="text-xs text-[#6b7280]">
                <span>{address}</span>
              </div>
            </div>

            <h4 className="text-base font-black text-[#101114] mt-5 mb-2">
              Stay Updated
            </h4>
            {subscribed ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-[9px]">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm mx-auto md:mx-0">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-w-0 flex-1 p-2.5 border border-[#dfe2e7] rounded-[9px] text-xs text-[#101114] focus:outline-none focus:border-[#fcb907]"
                />
                <button
                  type="submit"
                  className="bg-[#fcb907] hover:bg-[#e5a706] text-[#101114] font-black py-2.5 px-4 text-xs rounded-[9px] transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="border-t border-[#e7e9ee] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6b7280]">
          <div>© 2026 {companyName}. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center">
            <Link href="/privacy-policy" className="hover:text-[#d97706] transition-colors font-medium">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-[#d97706] transition-colors font-medium">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/warranty-certifications" className="hover:text-[#d97706] transition-colors font-medium">
              Warranty & Certifications
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#d97706] transition-colors font-medium">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
