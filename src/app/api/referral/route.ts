import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ---------- GET: Fetch referral stats for current user ----------
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Fetch profile (referral code)
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code, full_name")
      .eq("id", user.id)
      .single();

    // Fetch wallet balance
    const { data: wallet } = await supabase
      .from("wallet_balances")
      .select("balance, currency")
      .eq("user_id", user.id)
      .eq("currency", "CAD")
      .single();

    // Count friends referred (rewards where current user is the referrer)
    const { count: friendsInvited } = await supabase
      .from("referral_rewards")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", user.id)
      .eq("status", "credited");

    // Total earned from referrals
    const { data: rewards } = await supabase
      .from("referral_rewards")
      .select("referrer_reward")
      .eq("referrer_id", user.id)
      .eq("status", "credited");

    const totalEarned = rewards?.reduce((sum, r) => sum + Number(r.referrer_reward), 0) ?? 0;

    return NextResponse.json({
      referralCode: profile?.referral_code || null,
      firstName: profile?.full_name?.split(" ")[0] || "",
      walletBalance: wallet?.balance ?? 0,
      totalEarned,
      friendsInvited: friendsInvited ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
