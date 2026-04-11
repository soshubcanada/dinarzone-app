"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTransferStore } from "@/store/useTransferStore";
import { triggerHaptic } from "@/lib/utils/haptics";
import BottomSheet from "@/components/ui/BottomSheet";
import PremiumButton from "@/components/ui/PremiumButton";

interface RecentTransfer {
  id: string;
  recipientName: string;
  recipientInitials: string;
  amount: number;
  currency: string;
  receiveCurrency: string;
  receiveAmount: number;
  rate: number;
  corridor: string;
  method: string;
  methodLabel: string;
  date: string;
}

const RECENT_TRANSFERS: RecentTransfer[] = [
  {
    id: "1",
    recipientName: "Fatima Khelifi",
    recipientInitials: "FK",
    amount: 500,
    currency: "CAD",
    receiveCurrency: "DZD",
    receiveAmount: 49750,
    rate: 99.5,
    corridor: "CA-DZ",
    method: "baridimob",
    methodLabel: "BaridiMob",
    date: "Il y a 3 jours",
  },
  {
    id: "2",
    recipientName: "Ahmed Benali",
    recipientInitials: "AB",
    amount: 200,
    currency: "CAD",
    receiveCurrency: "DZD",
    receiveAmount: 19900,
    rate: 99.5,
    corridor: "CA-DZ",
    method: "cash",
    methodLabel: "Especes",
    date: "Il y a 1 semaine",
  },
  {
    id: "3",
    recipientName: "Nadia Mansouri",
    recipientInitials: "NM",
    amount: 300,
    currency: "CAD",
    receiveCurrency: "TND",
    receiveAmount: 684,
    rate: 2.28,
    corridor: "CA-TN",
    method: "bank",
    methodLabel: "Virement bancaire",
    date: "Il y a 2 semaines",
  },
];

export default function RepeatTransferCard() {
  const [selected, setSelected] = useState<RecentTransfer | null>(null);
  const { setAmount, setCorridor, setDeliveryMethod, setStep } =
    useTransferStore();
  const router = useRouter();

  const handleRepeat = () => {
    if (!selected) return;
    triggerHaptic("medium");

    // Pre-fill the store with previous transfer data
    setCorridor(selected.corridor, selected.rate);
    setAmount(selected.amount, selected.receiveAmount);
    const validMethods = ["baridimob", "ccp", "bank", "cash", "d17", "wallet"] as const;
    if (validMethods.includes(selected.method as typeof validMethods[number])) {
      setDeliveryMethod(selected.method as typeof validMethods[number]);
    }

    // Jump directly to review (step 4)
    setStep(4);
    setSelected(null);
    router.push("/fr/send");
  };

  return (
    <>
      <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-dz-fg text-sm">
            R&eacute;p&eacute;ter un transfert
          </h3>
          <svg
            className="w-4 h-4 text-dz-fg-muted"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="space-y-3">
          {RECENT_TRANSFERS.map((transfer, idx) => (
            <motion.button
              key={transfer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                triggerHaptic("light");
                setSelected(transfer);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dz-border-subtle hover:bg-white/5 transition-all active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A84D] to-[#006A33] text-white flex items-center justify-center font-bold text-xs shadow-md flex-shrink-0">
                {transfer.recipientInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dz-fg text-sm truncate">
                  {transfer.recipientName}
                </p>
                <p className="text-[11px] text-dz-fg-muted">
                  {transfer.amount} {transfer.currency} &rarr;{" "}
                  {transfer.receiveAmount.toLocaleString("fr-CA")}{" "}
                  {transfer.receiveCurrency} &bull; {transfer.date}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-[#00A84D]/10 text-[#00A84D] px-2.5 py-1.5 rounded-lg flex-shrink-0">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[11px] font-bold">R&eacute;p&eacute;ter</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* BottomSheet de confirmation */}
      <BottomSheet
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="R\u00e9p\u00e9ter ce transfert ?"
      >
        {selected && (
          <div className="space-y-6">
            {/* Recipient */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00A84D] to-[#006A33] text-white flex items-center justify-center font-bold text-lg shadow-md">
                {selected.recipientInitials}
              </div>
              <div>
                <p className="font-bold text-white text-lg">
                  {selected.recipientName}
                </p>
                <p className="text-sm text-dz-fg-muted">
                  {selected.methodLabel}
                </p>
              </div>
            </div>

            {/* Amount summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dz-fg-muted">Vous envoyez</span>
                <span className="text-xl font-bold text-white">
                  {selected.amount.toFixed(2)} {selected.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-dz-fg-muted">Taux</span>
                <span className="text-sm font-bold text-[#00A84D]">
                  1 {selected.currency} = {selected.rate}{" "}
                  {selected.receiveCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-sm text-dz-fg-muted font-bold">
                  Re&ccedil;oit
                </span>
                <span className="text-xl font-bold text-white">
                  {selected.receiveAmount.toLocaleString("fr-CA")}{" "}
                  {selected.receiveCurrency}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <PremiumButton onClick={handleRepeat}>
                Confirmer et envoyer
              </PremiumButton>
              <button
                onClick={() => {
                  triggerHaptic("light");
                  // Pre-fill but go to step 1 to allow editing
                  if (selected) {
                    setCorridor(selected.corridor, selected.rate);
                    setAmount(selected.amount, selected.receiveAmount);
                  }
                  setSelected(null);
                  router.push("/fr/send");
                }}
                className="w-full py-3 text-sm font-bold text-dz-fg-muted hover:text-white transition-colors"
              >
                Modifier avant d&apos;envoyer
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
