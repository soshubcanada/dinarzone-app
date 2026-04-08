import { NextResponse, type NextRequest } from "next/server";
import { createTransferSchema } from "@/lib/schemas/transfer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { corridor, amount, delivery, recipient } = parsed.data;

    // Generate tracking code
    const trackingCode = `DZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

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
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "Erreur lors de la creation du transfert" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        trackingCode,
        status: "pending_payment",
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
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

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
