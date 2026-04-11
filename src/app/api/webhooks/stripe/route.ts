import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-03-25.dahlia",
  });
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] Stripe env vars not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.warn("[stripe-webhook] Missing stripe-signature header");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe-webhook] Invalid signature:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type} (${event.id})`);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const transferId = paymentIntent.metadata?.transfer_id;

      if (!transferId) {
        console.warn(`[stripe-webhook] payment_intent.succeeded missing transfer_id in metadata (pi: ${paymentIntent.id})`);
        break;
      }

      const { data, error } = await supabaseAdmin
        .from("transfers")
        .update({
          status: "paid",
          stripe_payment_id: paymentIntent.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", transferId)
        .eq("status", "pending_payment")
        .select("id")
        .single();

      if (error) {
        console.error(`[stripe-webhook] DB update failed for transfer ${transferId}:`, error.message);
        // Return 500 so Stripe retries the webhook
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      if (!data) {
        console.warn(`[stripe-webhook] No pending_payment transfer found for id ${transferId} — may already be processed`);
      } else {
        console.log(`[stripe-webhook] Transfer ${transferId} marked as paid`);

        // Create notification for user
        const { data: transfer } = await supabaseAdmin
          .from("transfers")
          .select("user_id, tracking_code, receive_amount, receive_currency")
          .eq("id", transferId)
          .single();

        if (transfer) {
          await supabaseAdmin.from("notifications").insert({
            user_id: transfer.user_id,
            type: "transfer_status",
            title: "Paiement recu",
            body: `Votre transfert ${transfer.tracking_code} de ${transfer.receive_amount} ${transfer.receive_currency} est en cours de traitement.`,
            data: { transfer_id: transferId, status: "paid" },
          });

          // ---------- Referral reward check ----------
          // Trigger bonus if: first qualifying transfer (>= 100 CAD) + user was referred
          try {
            await processReferralReward(supabaseAdmin, transfer.user_id, transferId);
          } catch (refErr) {
            // Non-blocking: don't fail the webhook if referral crediting fails
            console.error(`[stripe-webhook] Referral reward error for ${transferId}:`, refErr);
          }
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const transferId = paymentIntent.metadata?.transfer_id;

      if (!transferId) {
        console.warn(`[stripe-webhook] payment_failed missing transfer_id (pi: ${paymentIntent.id})`);
        break;
      }

      const failureReason = paymentIntent.last_payment_error?.message || "Payment failed";

      const { error } = await supabaseAdmin
        .from("transfers")
        .update({
          status: "payment_failed",
          failure_reason: failureReason,
        })
        .eq("id", transferId)
        .eq("status", "pending_payment");

      if (error) {
        console.error(`[stripe-webhook] DB update failed for failed payment ${transferId}:`, error.message);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      console.log(`[stripe-webhook] Transfer ${transferId} marked as payment_failed: ${failureReason}`);

      // Notify user of failure
      const { data: transfer } = await supabaseAdmin
        .from("transfers")
        .select("user_id, tracking_code")
        .eq("id", transferId)
        .single();

      if (transfer) {
        await supabaseAdmin.from("notifications").insert({
          user_id: transfer.user_id,
          type: "transfer_status",
          title: "Echec du paiement",
          body: `Le paiement pour ${transfer.tracking_code} a echoue. Veuillez reessayer.`,
          data: { transfer_id: transferId, status: "payment_failed" },
        });
      }
      break;
    }

    default:
      console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// ---------- Referral reward processing ----------
const REFERRAL_MIN_AMOUNT = 100; // Minimum send_amount in CAD to qualify
const REFERRAL_REWARD = 10; // 10 CAD each

async function processReferralReward(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  transferId: string
) {
  // 1. Check if user has a referred_by code
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, referred_by")
    .eq("id", userId)
    .single();

  if (!profile?.referred_by) return; // No referral code — skip

  // 2. Check if this is the user's first paid transfer >= min amount
  const { data: transfer } = await supabase
    .from("transfers")
    .select("send_amount, send_currency")
    .eq("id", transferId)
    .single();

  if (!transfer || transfer.send_amount < REFERRAL_MIN_AMOUNT) return;

  // 3. Check no reward was already given for this user (prevent double-crediting)
  const { data: existingReward } = await supabase
    .from("referral_rewards")
    .select("id")
    .eq("referred_id", userId)
    .limit(1)
    .single();

  if (existingReward) return; // Already rewarded — skip

  // 4. Find the referrer by their referral_code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", profile.referred_by)
    .single();

  if (!referrer) {
    console.warn(`[stripe-webhook] Referrer not found for code: ${profile.referred_by}`);
    return;
  }

  // 5. Call the credit function (handles wallet + notifications atomically)
  const { error } = await supabase.rpc("credit_referral_reward", {
    p_referrer_id: referrer.id,
    p_referred_id: userId,
    p_transfer_id: transferId,
    p_reward_amount: REFERRAL_REWARD,
    p_currency: "CAD",
  });

  if (error) {
    console.error(`[stripe-webhook] credit_referral_reward RPC failed:`, error.message);
    return;
  }

  console.log(`[stripe-webhook] Referral reward credited: referrer=${referrer.id}, referred=${userId}, transfer=${transferId}`);
}
