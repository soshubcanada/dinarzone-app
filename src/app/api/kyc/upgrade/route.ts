import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { KycTier } from "@/lib/types/database";

const TIER_ORDER: KycTier[] = ["tier_0", "tier_1", "tier_2", "tier_3"];

/**
 * Tier upgrade requirements:
 * - tier_1: email + phone verified
 * - tier_2: passport/national_id approved + selfie approved
 * - tier_3: proof_of_address + source_of_funds approved (business_registration for biz)
 */
const TIER_REQUIREMENTS: Record<KycTier, (ctx: UpgradeContext) => boolean> = {
  tier_0: () => true,
  tier_1: (ctx) => ctx.emailVerified && ctx.phoneVerified,
  tier_2: (ctx) => {
    const hasId = ctx.approvedDocs.includes("passport") || ctx.approvedDocs.includes("national_id");
    const hasSelfie = ctx.approvedDocs.includes("selfie");
    return hasId && hasSelfie;
  },
  tier_3: (ctx) => {
    const hasAddress = ctx.approvedDocs.includes("proof_of_address");
    const hasFunds = ctx.approvedDocs.includes("business_registration") || ctx.approvedDocs.includes("source_of_funds");
    return hasAddress && hasFunds;
  },
};

interface UpgradeContext {
  emailVerified: boolean;
  phoneVerified: boolean;
  approvedDocs: string[];
}

/**
 * POST /api/kyc/upgrade
 *
 * Request a tier upgrade. Server validates all requirements are met.
 * Body: { targetTier: "tier_2" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json();
    const targetTier = body.targetTier as KycTier;

    if (!TIER_ORDER.includes(targetTier)) {
      return NextResponse.json(
        { error: "Tier invalide" },
        { status: 400 }
      );
    }

    // Get current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("kyc_tier, email_verified, phone_verified")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Validate target is higher than current
    const currentIdx = TIER_ORDER.indexOf(profile.kyc_tier as KycTier);
    const targetIdx = TIER_ORDER.indexOf(targetTier);

    if (targetIdx <= currentIdx) {
      return NextResponse.json(
        { error: "Vous etes deja a ce niveau ou superieur" },
        { status: 400 }
      );
    }

    // Can only upgrade one tier at a time
    if (targetIdx !== currentIdx + 1) {
      return NextResponse.json(
        { error: "Upgrade un seul niveau a la fois" },
        { status: 400 }
      );
    }

    // Get approved documents
    const { data: documents } = await supabase
      .from("kyc_documents")
      .select("document_type, status")
      .eq("user_id", user.id)
      .eq("status", "approved");

    const ctx: UpgradeContext = {
      emailVerified: profile.email_verified,
      phoneVerified: profile.phone_verified,
      approvedDocs: (documents ?? []).map((d) => d.document_type),
    };

    // Check requirements
    const meetsRequirements = TIER_REQUIREMENTS[targetTier](ctx);
    if (!meetsRequirements) {
      return NextResponse.json(
        { error: "Conditions non remplies pour ce niveau", requirements: getRequirementsList(targetTier, ctx) },
        { status: 422 }
      );
    }

    // Upgrade! (triggers sync_kyc_limit which auto-sets monthly_limit_cad)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        kyc_tier: targetTier,
        kyc_verified_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Erreur lors de la mise a niveau" },
        { status: 500 }
      );
    }

    // Send notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "kyc_update",
      title: "Niveau KYC ameliore",
      body: `Felicitations ! Vous etes maintenant ${targetTier === "tier_1" ? "Basique" : targetTier === "tier_2" ? "Verifie" : "Premium"}.`,
      data: { newTier: targetTier },
    });

    return NextResponse.json({
      success: true,
      newTier: targetTier,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

function getRequirementsList(tier: KycTier, ctx: UpgradeContext) {
  const missing: string[] = [];

  if (tier === "tier_1") {
    if (!ctx.emailVerified) missing.push("email_verification");
    if (!ctx.phoneVerified) missing.push("phone_verification");
  } else if (tier === "tier_2") {
    const hasId = ctx.approvedDocs.includes("passport") || ctx.approvedDocs.includes("national_id");
    if (!hasId) missing.push("identity_document");
    if (!ctx.approvedDocs.includes("selfie")) missing.push("selfie_verification");
  } else if (tier === "tier_3") {
    if (!ctx.approvedDocs.includes("proof_of_address")) missing.push("proof_of_address");
    const hasFunds = ctx.approvedDocs.includes("business_registration") || ctx.approvedDocs.includes("source_of_funds");
    if (!hasFunds) missing.push("source_of_funds");
  }

  return missing;
}
