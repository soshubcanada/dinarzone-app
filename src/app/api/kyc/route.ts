import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /api/kyc
 *
 * Returns current user's KYC status, tier, limits, documents, and monthly usage.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("kyc_tier, kyc_verified_at, monthly_limit_cad, email_verified, phone_verified, full_name")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Fetch KYC documents
    const { data: documents } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    // Fetch current month usage
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usage } = await supabase
      .from("kyc_monthly_usage")
      .select("total_sent_cad, transaction_count")
      .eq("user_id", user.id)
      .eq("period", currentPeriod)
      .single();

    const monthlyUsed = usage?.total_sent_cad ?? 0;
    const monthlyLimit = Number(profile.monthly_limit_cad);

    return NextResponse.json({
      tier: profile.kyc_tier,
      verifiedAt: profile.kyc_verified_at,
      emailVerified: profile.email_verified,
      phoneVerified: profile.phone_verified,
      limits: {
        monthlyLimitCAD: monthlyLimit,
        monthlyUsedCAD: Number(monthlyUsed),
        remainingCAD: Math.max(0, monthlyLimit - Number(monthlyUsed)),
        transactionCount: usage?.transaction_count ?? 0,
      },
      documents: documents ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kyc
 *
 * Upload a KYC document for verification.
 * Body: { documentType: "passport", fileUrl: "https://..." }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json();
    const { documentType, fileUrl } = body;

    const validTypes = [
      "passport", "national_id", "drivers_license",
      "selfie", "proof_of_address", "business_registration",
    ];

    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: `Type invalide. Valides: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (!fileUrl || typeof fileUrl !== "string") {
      return NextResponse.json(
        { error: "fileUrl requis" },
        { status: 400 }
      );
    }

    // Insert document
    const { data: doc, error: dbError } = await supabase
      .from("kyc_documents")
      .insert({
        user_id: user.id,
        document_type: documentType,
        file_url: fileUrl,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "Erreur lors de l'upload du document" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: doc,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
