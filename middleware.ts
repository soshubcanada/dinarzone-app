import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["fr", "en", "ar"] as const;
const DEFAULT_LOCALE = "fr";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.includes("ar")) return "ar";
  if (acceptLang.includes("en")) return "en";
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect root or unlocalized paths to locale-prefixed version
    const locale = getLocale(request);
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${locale}${pathname === "/" ? "/dashboard" : pathname}`;
    return NextResponse.redirect(newUrl);
  }

  // Extract locale and path within locale
  const segments = pathname.split("/");
  const locale = segments[1];
  const subPath = "/" + segments.slice(2).join("/");

  // Auth protection: check for session cookie
  const hasSession = request.cookies.has("sb-access-token") ||
                     request.cookies.has("supabase-auth-token") ||
                     request.cookies.has("dz-session");

  const isPublicPath = PUBLIC_PATHS.some((p) => subPath.startsWith(p));
  const isAuthPage = subPath.startsWith("/login") || subPath.startsWith("/register");

  // For MVP: allow all routes (no auth redirect yet)
  // Uncomment below when Supabase auth is connected:
  // if (!hasSession && !isPublicPath && subPath !== "/") {
  //   const loginUrl = request.nextUrl.clone();
  //   loginUrl.pathname = `/${locale}/login`;
  //   loginUrl.searchParams.set("redirect", pathname);
  //   return NextResponse.redirect(loginUrl);
  // }
  // if (hasSession && isAuthPage) {
  //   const dashUrl = request.nextUrl.clone();
  //   dashUrl.pathname = `/${locale}/dashboard`;
  //   return NextResponse.redirect(dashUrl);
  // }

  // Set locale header for downstream use
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  // Set RTL direction for Arabic
  if (locale === "ar") {
    response.headers.set("x-direction", "rtl");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
