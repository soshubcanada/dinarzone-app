import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Sign out from Supabase (revokes session + clears cookies)
    await supabase.auth.signOut();

    // Determine redirect locale from referer or default to "fr"
    const referer = request.headers.get("referer") || "";
    const localeMatch = referer.match(/\/(fr|en|ar)(\/|$)/);
    const locale = localeMatch?.[1] || "fr";

    return NextResponse.json({
      success: true,
      redirectTo: `/${locale}/login`,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la deconnexion" },
      { status: 500 }
    );
  }
}
