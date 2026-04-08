import { NextResponse, type NextRequest } from "next/server";
import { addRecipientSchema } from "@/lib/schemas/recipient";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("recipients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ recipients: data });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addRecipientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("recipients")
      .insert({
        user_id: user.id,
        full_name: parsed.data.fullName,
        country: parsed.data.country,
        phone: parsed.data.phone,
        delivery_method: parsed.data.deliveryMethod,
        ccp_number: parsed.data.ccpNumber,
        bank_name: parsed.data.bankName,
        iban: parsed.data.iban,
        preferred_agent: parsed.data.preferredAgent,
        city: parsed.data.city,
        nickname: parsed.data.nickname,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
    }

    return NextResponse.json({ success: true, recipient: data });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
