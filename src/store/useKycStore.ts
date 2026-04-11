import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KycTier } from "@/lib/constants/kyc-tiers";
import { KYC_TIERS } from "@/lib/constants/kyc-tiers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KycTierId = "tier_0" | "tier_1" | "tier_2" | "tier_3";

export type DocumentType =
  | "passport"
  | "national_id"
  | "selfie"
  | "proof_of_address"
  | "source_of_funds";

export type DocumentStatus = "pending" | "uploaded" | "verified" | "rejected";

export interface KycDocument {
  type: DocumentType;
  status: DocumentStatus;
  fileName?: string;
  uploadedAt?: string;
  rejectionReason?: string;
}

export interface KycState {
  // Current tier
  tierId: KycTierId;
  tierLabel: string;

  // Limits
  monthlyLimitCAD: number;
  monthlyUsedCAD: number;

  // Verification status
  emailVerified: boolean;
  phoneVerified: boolean;
  documents: KycDocument[];

  // Upgrade in progress
  upgradeInProgress: boolean;
  pendingTierId: KycTierId | null;

  // Actions
  setTier: (tierId: KycTierId) => void;
  addMonthlyUsage: (amount: number) => void;
  resetMonthlyUsage: () => void;
  verifyEmail: () => void;
  verifyPhone: () => void;
  uploadDocument: (type: DocumentType, fileName: string) => void;
  verifyDocument: (type: DocumentType) => void;
  rejectDocument: (type: DocumentType, reason: string) => void;
  startUpgrade: (targetTierId: KycTierId) => void;
  completeUpgrade: () => void;
  cancelUpgrade: () => void;

  // Computed (via selectors)
  getRemainingLimit: () => number;
  canSend: (amount: number) => boolean;
  getCurrentTier: () => KycTier;
  getNextTier: () => KycTier | null;
  getUpgradeProgress: () => { completed: number; total: number; percent: number };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useKycStore = create<KycState>()(
  persist(
    (set, get) => ({
      // Default: Tier 2 (verified) with mock usage for demo
      tierId: "tier_2",
      tierLabel: "Vérifié",
      monthlyLimitCAD: 2000,
      monthlyUsedCAD: 650,
      emailVerified: true,
      phoneVerified: true,
      documents: [
        { type: "passport", status: "verified", fileName: "passport_scan.pdf", uploadedAt: "2025-12-15T10:00:00Z" },
        { type: "selfie", status: "verified", fileName: "selfie_verification.jpg", uploadedAt: "2025-12-15T10:05:00Z" },
      ],
      upgradeInProgress: false,
      pendingTierId: null,

      // ---- Actions ----

      setTier: (tierId) => {
        const tier = KYC_TIERS.find((t) => t.id === tierId);
        if (!tier) return;
        set({
          tierId,
          tierLabel: tier.label.fr,
          monthlyLimitCAD: tier.monthlyLimitCAD,
        });
      },

      addMonthlyUsage: (amount) =>
        set((state) => ({
          monthlyUsedCAD: +(state.monthlyUsedCAD + amount).toFixed(2),
        })),

      resetMonthlyUsage: () => set({ monthlyUsedCAD: 0 }),

      verifyEmail: () => set({ emailVerified: true }),

      verifyPhone: () => set({ phoneVerified: true }),

      uploadDocument: (type, fileName) =>
        set((state) => {
          const docs = state.documents.filter((d) => d.type !== type);
          docs.push({
            type,
            status: "uploaded",
            fileName,
            uploadedAt: new Date().toISOString(),
          });
          return { documents: docs };
        }),

      verifyDocument: (type) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.type === type ? { ...d, status: "verified" as const } : d
          ),
        })),

      rejectDocument: (type, reason) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.type === type
              ? { ...d, status: "rejected" as const, rejectionReason: reason }
              : d
          ),
        })),

      startUpgrade: (targetTierId) =>
        set({ upgradeInProgress: true, pendingTierId: targetTierId }),

      completeUpgrade: () => {
        const { pendingTierId } = get();
        if (!pendingTierId) return;
        const tier = KYC_TIERS.find((t) => t.id === pendingTierId);
        if (!tier) return;
        set({
          tierId: pendingTierId,
          tierLabel: tier.label.fr,
          monthlyLimitCAD: tier.monthlyLimitCAD,
          upgradeInProgress: false,
          pendingTierId: null,
        });
      },

      cancelUpgrade: () =>
        set({ upgradeInProgress: false, pendingTierId: null }),

      // ---- Selectors ----

      getRemainingLimit: () => {
        const { monthlyLimitCAD, monthlyUsedCAD } = get();
        return Math.max(0, monthlyLimitCAD - monthlyUsedCAD);
      },

      canSend: (amount) => {
        const { monthlyLimitCAD, monthlyUsedCAD, tierId } = get();
        if (tierId === "tier_0") return false;
        return monthlyUsedCAD + amount <= monthlyLimitCAD;
      },

      getCurrentTier: () => {
        const { tierId } = get();
        return KYC_TIERS.find((t) => t.id === tierId) ?? KYC_TIERS[0];
      },

      getNextTier: () => {
        const { tierId } = get();
        const idx = KYC_TIERS.findIndex((t) => t.id === tierId);
        return idx < KYC_TIERS.length - 1 ? KYC_TIERS[idx + 1] : null;
      },

      getUpgradeProgress: () => {
        const { tierId, emailVerified, phoneVerified, documents } = get();
        const nextTier = (() => {
          const idx = KYC_TIERS.findIndex((t) => t.id === tierId);
          return idx < KYC_TIERS.length - 1 ? KYC_TIERS[idx + 1] : null;
        })();

        if (!nextTier) return { completed: 0, total: 0, percent: 100 };

        let total = 0;
        let completed = 0;

        if (nextTier.id === "tier_1") {
          total = 2;
          if (emailVerified) completed++;
          if (phoneVerified) completed++;
        } else if (nextTier.id === "tier_2") {
          total = 2;
          if (documents.find((d) => (d.type === "passport" || d.type === "national_id") && d.status === "verified")) completed++;
          if (documents.find((d) => d.type === "selfie" && d.status === "verified")) completed++;
        } else if (nextTier.id === "tier_3") {
          total = 3;
          if (documents.find((d) => d.type === "proof_of_address" && d.status === "verified")) completed++;
          if (documents.find((d) => d.type === "source_of_funds" && d.status === "verified")) completed++;
          // Facial verification counts as selfie re-verification
          if (documents.find((d) => d.type === "selfie" && d.status === "verified")) completed++;
        }

        return {
          completed,
          total,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      },
    }),
    {
      name: "dinarzone-kyc",
      partialize: (state) => ({
        tierId: state.tierId,
        tierLabel: state.tierLabel,
        monthlyLimitCAD: state.monthlyLimitCAD,
        monthlyUsedCAD: state.monthlyUsedCAD,
        emailVerified: state.emailVerified,
        phoneVerified: state.phoneVerified,
        documents: state.documents,
      }),
    }
  )
);
