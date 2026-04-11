/**
 * DinarZone Database Types
 *
 * TypeScript definitions mirroring the Supabase schema.
 * Generated from: supabase/migrations/001 + 002
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type KycTier = "tier_0" | "tier_1" | "tier_2" | "tier_3";

export type AccountType = "personal" | "business";

export type DeliveryMethod =
  | "baridimob_ccp"
  | "cash_pickup"
  | "bank_transfer"
  | "d17_laposte"
  | "exchange_house"
  | "virtual_card";

export type TransferStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "payment_failed"
  | "processing"
  | "sent_to_provider"
  | "in_transit"
  | "available_for_pickup"
  | "delivered"
  | "cancelled"
  | "refunded";

export type DocumentType =
  | "passport"
  | "national_id"
  | "drivers_license"
  | "selfie"
  | "proof_of_address"
  | "business_registration";

export type DocumentStatus = "pending" | "approved" | "rejected";

export type NotificationType =
  | "transfer_status"
  | "kyc_update"
  | "rate_alert"
  | "promo"
  | "system";

export type RateSource = "manual" | "thunes" | "openexchangerates";

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface DbProfile {
  id: string;
  full_name: string;
  phone: string | null;
  country: string;
  account_type: AccountType;
  business_name: string | null;
  business_type: string | null;
  business_registration: string | null;
  kyc_tier: KycTier;
  kyc_verified_at: string | null;
  monthly_limit_cad: number;
  email_verified: boolean;
  phone_verified: boolean;
  preferred_locale: string;
  referral_code: string | null;
  referred_by: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRecipient {
  id: string;
  user_id: string;
  full_name: string;
  country: string;
  phone: string | null;
  delivery_method: DeliveryMethod;
  ccp_number: string | null;
  bank_name: string | null;
  iban: string | null;
  preferred_agent: string | null;
  city: string | null;
  nickname: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbTransfer {
  id: string;
  user_id: string;
  tracking_code: string;
  from_country: string;
  to_country: string;
  send_amount: number;
  send_currency: string;
  receive_amount: number;
  receive_currency: string;
  exchange_rate: number;
  fee: number;
  delivery_method: string;
  recipient_name: string;
  recipient_phone: string | null;
  recipient_account: string | null;
  recipient_id: string | null;
  agent_id: string | null;
  status: TransferStatus;
  stripe_payment_id: string | null;
  thunes_transaction_id: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  failure_reason: string | null;
  notes: string | null;
  // Added in migration 002
  corridor_id: number | null;
  rate_lock_id: string | null;
  mid_market_rate: number | null;
  dz_margin_applied: number | null;
  fee_breakdown: FeeBreakdownJson | null;
  created_at: string;
  updated_at: string;
}

export interface FeeBreakdownJson {
  fixed_fee: number;
  percent_fee: number;
  total_fee: number;
  fee_percent: number;
  delivery_surcharge: number;
}

export interface DbCurrencyCorridor {
  id: number;
  corridor_code: string;
  source_currency: string;
  target_currency: string;
  mid_market_rate: number;
  dz_margin_percent: number;
  fee_flat: number;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  rate_source: RateSource;
  last_rate_fetch: string;
  created_at: string;
  updated_at: string;
}

export interface DbFeeTier {
  id: number;
  max_amount: number;
  fixed_fee: number;
  percent_fee: number;
  corridor_code: string | null;
  created_at: string;
}

export interface DbDeliverySurcharge {
  id: number;
  delivery_method: string;
  surcharge: number;
}

export interface DbKycDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_url: string;
  status: DocumentStatus;
  sumsub_check_id: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface DbKycMonthlyUsage {
  id: string;
  user_id: string;
  period: string; // 'YYYY-MM'
  total_sent_cad: number;
  transaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbRateLock {
  id: string;
  user_id: string;
  corridor_id: number;
  send_amount: number;
  send_currency: string;
  receive_amount: number;
  receive_currency: string;
  locked_rate: number;
  mid_market_rate: number;
  fee_charged: number;
  total_charged: number;
  delivery_method: string | null;
  locked_at: string;
  expires_at: string;
  used: boolean;
  transfer_id: string | null;
}

export interface DbAgent {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  delivery_methods: string[];
  opening_hours: string | null;
  float_balance: number;
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface DbExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  fee_percent: number;
  min_amount: number | null;
  max_amount: number | null;
  source: string;
  fetched_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Supabase Database type (for createClient<Database>)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Omit<DbProfile, "created_at" | "updated_at">;
        Update: Partial<Omit<DbProfile, "id" | "created_at">>;
      };
      recipients: {
        Row: DbRecipient;
        Insert: Omit<DbRecipient, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbRecipient, "id" | "user_id" | "created_at">>;
      };
      transfers: {
        Row: DbTransfer;
        Insert: Omit<DbTransfer, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbTransfer, "id" | "user_id" | "created_at">>;
      };
      currency_corridors: {
        Row: DbCurrencyCorridor;
        Insert: Omit<DbCurrencyCorridor, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbCurrencyCorridor, "id" | "created_at">>;
      };
      fee_tiers: {
        Row: DbFeeTier;
        Insert: Omit<DbFeeTier, "id" | "created_at">;
        Update: Partial<Omit<DbFeeTier, "id" | "created_at">>;
      };
      delivery_surcharges: {
        Row: DbDeliverySurcharge;
        Insert: Omit<DbDeliverySurcharge, "id">;
        Update: Partial<Omit<DbDeliverySurcharge, "id">>;
      };
      kyc_documents: {
        Row: DbKycDocument;
        Insert: Omit<DbKycDocument, "id" | "submitted_at">;
        Update: Partial<Omit<DbKycDocument, "id" | "user_id" | "submitted_at">>;
      };
      kyc_monthly_usage: {
        Row: DbKycMonthlyUsage;
        Insert: Omit<DbKycMonthlyUsage, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbKycMonthlyUsage, "id" | "user_id" | "created_at">>;
      };
      rate_locks: {
        Row: DbRateLock;
        Insert: Omit<DbRateLock, "id">;
        Update: Partial<Omit<DbRateLock, "id" | "user_id">>;
      };
      agents: {
        Row: DbAgent;
        Insert: Omit<DbAgent, "id" | "created_at">;
        Update: Partial<Omit<DbAgent, "id" | "created_at">>;
      };
      exchange_rates: {
        Row: DbExchangeRate;
        Insert: Omit<DbExchangeRate, "id">;
        Update: Partial<Omit<DbExchangeRate, "id">>;
      };
      notifications: {
        Row: DbNotification;
        Insert: Omit<DbNotification, "id" | "created_at">;
        Update: Partial<Omit<DbNotification, "id" | "user_id" | "created_at">>;
      };
    };
    Functions: {
      get_dz_rate: {
        Args: { p_corridor_code: string };
        Returns: number;
      };
      calculate_fee: {
        Args: { p_amount: number; p_corridor_code?: string };
        Returns: { fixed_fee: number; percent_fee: number; total_fee: number }[];
      };
      can_user_send: {
        Args: { p_user_id: string; p_amount_cad: number };
        Returns: boolean;
      };
    };
  };
}
