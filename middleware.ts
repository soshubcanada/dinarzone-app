import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["fr", "en", "ar"] as const;
const DEFAULT_LOCALE = "fr";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/verify"];
const ADMIN_PATHS = ["/admin"];

// ---------- Security headers (OWASP best practices) ----------
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=(self)",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

// ---------- Rate limiting (in-memory, per-instance) ----------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMITS: Record<string, number> = {
  "/api/auth/login": 10,
  "/api/auth/register": 5,
  "/api/kyc/upgrade": 5,
  "/api/transfers": 20,
  "/api/quotes": 30,
  "/api/rates": 60,
};

function isRateLimited(ip: string, path: string): boolean {
  const limit = Object.entries(RATE_LIMITS).find(([p]) => path.startsWith(p))?.[1];
  if (!limit) return false;

  const key = `${ip}:${path}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > limit) return true;
  return false;
}

// Clean up stale entries periodically
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 5 * 60_000;
  let lastCleanup = Date.now();
  // Lazy cleanup on every middleware call instead of setInterval (edge runtime safe)
  (globalThis as Record<string, unknown>).__dz_rl_cleanup = () => {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  };
}

// ---------- Helpers ----------
function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.includes("ar")) return "ar";
  if (acceptLang.includes("en")) return "en";
  return DEFAULT_LOCALE;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

// ---------- Middleware ----------
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- API route handling: rate limiting + security headers ---
  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request);

    // Lazy cleanup
    const cleanup = (globalThis as Record<string, unknown>).__dz_rl_cleanup;
    if (typeof cleanup === "function") cleanup();

    if (isRateLimited(ip, pathname)) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: "Trop de requetes. Reessayez dans 1 minute." },
          { status: 429 }
        )
      );
    }

    // Stripe webhook must not be blocked by CSRF — signature validates authenticity
    if (pathname.startsWith("/api/webhooks")) {
      return applySecurityHeaders(NextResponse.next());
    }

    // CSRF protection for state-changing methods on non-webhook API routes
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return applySecurityHeaders(
              NextResponse.json(
                { error: "Requete cross-origin non autorisee" },
                { status: 403 }
              )
            );
          }
        } catch {
          return applySecurityHeaders(
            NextResponse.json({ error: "Origin invalide" }, { status: 403 })
          );
        }
      }
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // --- Page route handling ---

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${locale}${pathname === "/" ? "/dashboard" : pathname}`;
    return NextResponse.redirect(newUrl);
  }

  // Extract locale and sub-path
  const segments = pathname.split("/");
  const locale = segments[1];
  const subPath = "/" + segments.slice(2).join("/");

  // Auth protection: check Supabase session cookies
  // @supabase/ssr stores the session in `sb-<project-ref>-auth-token`,
  // and chunks it into `.0`, `.1`, ... when the payload exceeds 4KB.
  // We accept any sb-* cookie that contains "auth-token" to handle both shapes,
  // plus the legacy `sb-access-token` / `sb-refresh-token` for older clients.
  const hasSession =
    request.cookies.has("sb-access-token") ||
    request.cookies.has("sb-refresh-token") ||
    Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith("sb-") && c.name.includes("auth-token")
    );

  const isPublicPath = PUBLIC_PATHS.some((p) => subPath.startsWith(p));
  const isAuthPage = subPath.startsWith("/login") || subPath.startsWith("/register");
  const isAdminPath = ADMIN_PATHS.some((p) => subPath.startsWith(p));

  // Redirect unauthenticated users to login
  if (!hasSession && !isPublicPath && subPath !== "/" && subPath !== "") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (hasSession && isAuthPage) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(dashUrl);
  }

  // Admin routes require session (additional role check would go here)
  if (isAdminPath && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Build response with security headers + locale
  const response = applySecurityHeaders(NextResponse.next());
  response.headers.set("x-locale", locale);
  if (locale === "ar") {
    response.headers.set("x-direction", "rtl");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)"],
};
