import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2025-04-30.basil" as any,
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
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const transferId = paymentIntent.metadata?.transfer_id;

      if (transferId) {
        await supabaseAdmin
          .from("transfers")
          .update({
            status: "paid",
            stripe_payment_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
          })
          .eq("id", transferId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const transferId = paymentIntent.metadata?.transfer_id;

      if (transferId) {
        await supabaseAdmin
          .from("transfers")
          .update({
            status: "payment_failed",
            failure_reason: paymentIntent.last_payment_error?.message,
          })
          .eq("id", transferId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
