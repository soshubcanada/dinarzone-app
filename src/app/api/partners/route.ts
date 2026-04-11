import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ---------- Validation ----------
const partnerApplicationSchema = z.object({
  businessName: z.string().min(2, "Nom trop court").max(200),
  rcNumber: z.string().min(3, "RC/NIF invalide").max(50),
  address: z.string().min(5, "Adresse trop courte").max(500),
  city: z.string().max(100).optional(),
  country: z.string().length(2).default("DZ"),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Telephone invalide").optional(),
  storePhotoUrl: z.string().url("URL photo invalide").optional(),
  openingHours: z.string().max(200).optional(),
  amlAccepted: z.literal(true, { errorMap: () => ({ message: "Conformite AML requise" }) }),
  commissionAccepted: z.literal(true, { errorMap: () => ({ message: "Acceptation commission requise" }) }),
});

// ---------- POST: Submit application ----------
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = partnerApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation echouee", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check for existing pending application
    const { data: existing } = await supabase
      .from("pos_agents")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .limit(1)
      .single();

    if (existing) {
      const msg = existing.status === "approved"
        ? "Vous etes deja un partenaire approuve"
        : "Vous avez deja une candidature en cours de revision";
      return NextResponse.json({ error: msg, code: "DUPLICATE_APPLICATION" }, { status: 409 });
    }

    const { data: application, error: dbError } = await supabase
      .from("pos_agents")
      .insert({
        user_id: user.id,
        business_name: parsed.data.businessName,
        rc_number: parsed.data.rcNumber,
        address: parsed.data.address,
        city: parsed.data.city || null,
        country: parsed.data.country,
        phone: parsed.data.phone || null,
        store_photo_url: parsed.data.storePhotoUrl || null,
        opening_hours: parsed.data.openingHours || null,
        aml_accepted: true,
        commission_accepted: true,
        status: "pending",
      })
      .select("id, status, created_at")
      .single();

    if (dbError) {
      console.error("[partners] Insert failed:", dbError.message);
      return NextResponse.json({ error: "Erreur lors de la soumission" }, { status: 500 });
    }

    return NextResponse.json({ success: true, application });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// ---------- GET: Check application status ----------
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { data: applications } = await supabase
      .from("pos_agents")
      .select("id, business_name, status, rejection_reason, created_at, reviewed_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ applications: applications || [] });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
