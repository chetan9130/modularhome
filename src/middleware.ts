import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Standard 301 SEO redirects mapping (e.g. from Shopify legacy paths)
const LEGACY_REDIRECTS: Record<string, string> = {
  "/collections/all": "/buildings",
  "/collections": "/buildings",
  "/catalog": "/buildings",
  "/floorplans": "/floor-plans",
  "/floor-plan": "/floor-plans",
  "/plans": "/floor-plans",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check exact match 301 SEO Redirects
  if (LEGACY_REDIRECTS[pathname]) {
    const redirectUrl = new URL(LEGACY_REDIRECTS[pathname], request.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 2. Handle Shopify pattern 301 redirects
  if (pathname.startsWith("/products/")) {
    const handle = pathname.replace("/products/", "");
    const redirectUrl = new URL(`/buildings/${handle}`, request.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  if (pathname.startsWith("/blogs/news/")) {
    const handle = pathname.replace("/blogs/news/", "");
    const redirectUrl = new URL(`/resources/${handle}`, request.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  if (pathname.startsWith("/collections/")) {
    const handle = pathname.replace("/collections/", "");
    const redirectUrl = new URL(`/buildings?category=${encodeURIComponent(handle)}`, request.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 3. Protect /admin UI routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Redirect /admin/login to /admin if already authenticated
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session");
    if (sessionCookie && sessionCookie.value) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/products/:path*",
    "/blogs/news/:path*",
    "/collections/:path*",
    "/floorplans",
    "/floor-plan",
    "/plans",
  ],
};
