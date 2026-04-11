import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createTransferSchema } from "@/lib/schemas/transfer";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return stripeClient;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTransferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { corridor, amount, delivery, recipient } = parsed.data;

    // Server-side KYC limit check
    const { data: canSend } = await supabase.rpc("can_user_send", {
      p_user_id: user.id,
      p_amount_cad: amount.sendAmount,
    });

    if (canSend === false) {
      return NextResponse.json(
        { error: "Limite KYC mensuelle depassee", code: "KYC_LIMIT_EXCEEDED" },
        { status: 403 }
      );
    }

    // Validate rate lock if provided
    const rateLockId = body.rateLockId as string | undefined;
    if (rateLockId) {
      const { data: lock } = await supabase
        .from("rate_locks")
        .select("*")
        .eq("id", rateLockId)
        .eq("user_id", user.id)
        .eq("used", false)
        .single();

      if (!lock || new Date(lock.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Taux expire — veuillez regenerer un devis", code: "RATE_EXPIRED" },
          { status: 409 }
        );
      }
    }

    // Resolve corridor DB id
    const corridorCode = `${corridor.fromCountry}-${corridor.toCountry}`;
    const { data: corridorRow } = await supabase
      .from("currency_corridors")
      .select("id, mid_market_rate, dz_margin_percent")
      .eq("corridor_code", corridorCode)
      .single();

    // Generate tracking code
    const trackingCode = `DZ-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().substring(0, 6).toUpperCase()}`;

    // Create transfer record
    const { data: transfer, error: dbError } = await supabase
      .from("transfers")
      .insert({
        user_id: user.id,
        tracking_code: trackingCode,
        from_country: corridor.fromCountry,
        to_country: corridor.toCountry,
        send_amount: amount.sendAmount,
        send_currency: amount.sendCurrency,
        receive_amount: amount.receiveAmount,
        receive_currency: amount.receiveCurrency,
        exchange_rate: amount.rate,
        fee: amount.fee,
        delivery_method: delivery.method,
        recipient_name: recipient.fullName,
        recipient_phone: recipient.phone,
        recipient_account: recipient.accountNumber || recipient.iban,
        status: "pending_payment",
        corridor_id: corridorRow?.id ?? null,
        rate_lock_id: rateLockId ?? null,
        mid_market_rate: corridorRow ? Number(corridorRow.mid_market_rate) : null,
        dz_margin_applied: corridorRow ? Number(corridorRow.dz_margin_percent) : null,
        fee_breakdown: body.feeBreakdown ?? null,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "Erreur lors de la creation du transfert" },
        { status: 500 }
      );
    }

    // Mark rate lock as used
    if (rateLockId) {
      await supabase
        .from("rate_locks")
        .update({ used: true, transfer_id: transfer.id })
        .eq("id", rateLockId);
    }

    // Create Stripe PaymentIntent
    const totalToCharge = amount.sendAmount + amount.fee;
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totalToCharge * 100), // Stripe uses cents
      currency: amount.sendCurrency.toLowerCase(),
      metadata: {
        transfer_id: transfer.id,
        tracking_code: trackingCode,
        user_id: user.id,
        corridor: corridorCode,
      },
    });

    // Store Stripe payment ID on the transfer
    await supabase
      .from("transfers")
      .update({ stripe_payment_id: paymentIntent.id })
      .eq("id", transfer.id);

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        trackingCode,
        status: "pending_payment",
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const rawLimit = parseInt(searchParams.get("limit") || "20");
    const rawOffset = parseInt(searchParams.get("offset") || "0");
    const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 1), 100);
    const offset = Math.max(isNaN(rawOffset) ? 0 : rawOffset, 0);

    let query = supabase
      .from("transfers")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: transfers, error: dbError, count } = await query;

    if (dbError) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ transfers, total: count });
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
