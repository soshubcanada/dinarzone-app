import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getQuote } from "@/lib/engine/rates";

const RATE_LOCK_TTL_SECONDS = 15 * 60; // 15 minutes

/**
 * POST /api/quotes
 *
 * Generate a transfer quote with rate lock.
 * Body: { corridorCode: "CA-DZ", sendAmount: 1000, deliveryMethod?: "baridimob_ccp" }
 *
 * If the user is authenticated, persists a rate_lock row in Supabase
 * so the quoted rate is honored during payment.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { corridorCode, sendAmount, deliveryMethod } = body;

    if (!corridorCode || typeof corridorCode !== "string") {
      return NextResponse.json(
        { error: "corridorCode requis (ex: CA-DZ)" },
        { status: 400 }
      );
    }

    if (!sendAmount || typeof sendAmount !== "number" || sendAmount <= 0) {
      return NextResponse.json(
        { error: "sendAmount doit etre un nombre positif" },
        { status: 400 }
      );
    }

    // Generate quote using the local rate engine
    const quote = getQuote(corridorCode, sendAmount, deliveryMethod);
    if (!quote) {
      return NextResponse.json(
        { error: "Corridor non disponible" },
        { status: 404 }
      );
    }

    // Try to persist rate lock if user is authenticated
    let rateLockId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get corridor DB id
        const { data: corridor } = await supabase
          .from("currency_corridors")
          .select("id")
          .eq("corridor_code", corridorCode)
          .single();

        if (corridor) {
          // Check KYC limit server-side
          const { data: canSend } = await supabase.rpc("can_user_send", {
            p_user_id: user.id,
            p_amount_cad: sendAmount,
          });

          if (canSend === false) {
            return NextResponse.json(
              { error: "Limite KYC mensuelle depassee", code: "KYC_LIMIT_EXCEEDED" },
              { status: 403 }
            );
          }

          // Persist rate lock
          const expiresAt = new Date(Date.now() + RATE_LOCK_TTL_SECONDS * 1000).toISOString();
          const { data: lock } = await supabase
            .from("rate_locks")
            .insert({
              user_id: user.id,
              corridor_id: corridor.id,
              send_amount: quote.sendAmount,
              send_currency: quote.sendCurrency,
              receive_amount: quote.receiveAmount,
              receive_currency: quote.receiveCurrency,
              locked_rate: quote.dzRate,
              mid_market_rate: quote.midMarketRate,
              fee_charged: quote.fees.totalFee,
              total_charged: quote.totalCharged,
              delivery_method: deliveryMethod || null,
              expires_at: expiresAt,
              used: false,
              transfer_id: null,
            })
            .select("id")
            .single();

          rateLockId = lock?.id ?? null;
        }
      }
    } catch {
      // Non-critical: quote still valid without DB persistence
    }

    return NextResponse.json({
      quote: {
        corridorCode: quote.corridorId,
        sendAmount: quote.sendAmount,
        sendCurrency: quote.sendCurrency,
        receiveAmount: quote.receiveAmount,
        receiveCurrency: quote.receiveCurrency,
        dzRate: quote.dzRate,
        midMarketRate: quote.midMarketRate,
        fees: quote.fees,
        totalCharged: quote.totalCharged,
        savings: quote.savings,
        bankReceiveAmount: quote.bankReceiveAmount,
      },
      rateLock: {
        id: rateLockId,
        expiresAt: quote.rateLockExpiresAt,
        ttlSeconds: RATE_LOCK_TTL_SECONDS,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du calcul du devis" },
      { status: 500 }
    );
  }
}
