import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ---------- GET: List all partner applications ----------
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // TODO: check admin role via profiles.role or a dedicated admin table

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const { data: applications, error } = await supabase
      .from("pos_agents")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// ---------- PATCH: Approve or reject ----------
const reviewSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().max(500).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation echouee", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { applicationId, action, rejectionReason } = parsed.data;

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { data: updated, error: dbError } = await supabase
      .from("pos_agents")
      .update({
        status: newStatus,
        rejection_reason: action === "reject" ? (rejectionReason || null) : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("status", "pending")
      .select("id, business_name, status")
      .single();

    if (dbError || !updated) {
      return NextResponse.json(
        { error: "Candidature introuvable ou deja traitee" },
        { status: 404 }
      );
    }

    console.log(`[admin/partners] ${action}d application ${applicationId} by ${user.id}`);

    return NextResponse.json({ success: true, application: updated });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
