"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDzRate } from "@/lib/engine/rates";
import { formatNumber } from "@/lib/utils/formatNumber";
import { triggerHaptic } from "@/lib/utils/haptics";
import FlagIcon from "@/components/ui/FlagIcon";

type PaymentState = "idle" | "authenticating" | "success" | "error";
type WalletCurrency = "CAD" | "USD";

type UserWallet = {
  currency: WalletCurrency;
  country: string;
  balance: number;
  symbol: string;
};

// DÉMO — à remplacer par la session Stripe / order réelle via l'API
const DEMO_ORDER = {
  merchantName: "Démo Marchand",
  merchantInitials: "DM",
  description: "Panier de courses (Livraison Alger)",
  amountRequiredDZD: 14500,
};

// DÉMO — à remplacer par les portefeuilles de l'utilisateur authentifié
const DEMO_USER_WALLETS: UserWallet[] = [
  { currency: "CAD", country: "CA", balance: 2450.75, symbol: "$" },
  { currency: "USD", country: "US", balance: 150.0, symbol: "$" },
];

const CAD_DZD_CORRIDOR = getDzRate("CA-DZ");
const CAD_DZD_RATE = CAD_DZD_CORRIDOR?.dzRate ?? 100.3;
const AMOUNT_CAD = +(DEMO_ORDER.amountRequiredDZD / CAD_DZD_RATE).toFixed(2);

const AUTH_DELAY_MS = 2500;
const REDIRECT_DELAY_MS = 3000;

export default function CheckoutPage() {
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [selectedWallet, setSelectedWallet] = useState<WalletCurrency>("CAD");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  const handlePayment = () => {
    if (paymentState !== "idle") return;

    setPaymentState("authenticating");
    triggerHaptic("light");

    const authTimer = window.setTimeout(() => {
      setPaymentState("success");
      triggerHaptic("success");

      const redirectTimer = window.setTimeout(() => {
        // TODO: window.location.href = orderData.success_url
      }, REDIRECT_DELAY_MS);
      timersRef.current.push(redirectTimer);
    }, AUTH_DELAY_MS);

    timersRef.current.push(authTimer);
  };

  return (
    <div className="min-h-screen bg-dz-dark font-sans flex items-center justify-center p-4 selection:bg-dz-primary/30">
      <AnimatePresence mode="wait">
        {paymentState !== "success" ? (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-dz-dark-card border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 pb-6 border-b border-white/5 flex flex-col items-center bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-16 h-16 rounded-2xl bg-dz-dark border border-white/10 flex items-center justify-center text-base font-bold text-dz-gold mb-4 shadow-lg">
                {DEMO_ORDER.merchantInitials}
              </div>
              <p className="text-xs font-bold text-dz-text-muted uppercase tracking-widest mb-1">
                Paiement Sécurisé · DÉMO
              </p>
              <h2 className="text-xl font-bold text-white mb-1">{DEMO_ORDER.merchantName}</h2>
              <p className="text-sm text-dz-text-muted">{DEMO_ORDER.description}</p>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <p className="text-sm font-bold text-dz-text-muted mb-2">Montant demandé</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-4xl font-bold tabular-nums text-white">
                    {formatNumber(DEMO_ORDER.amountRequiredDZD, 0)}
                  </span>
                  <span className="text-xl font-bold text-dz-gold">DZD</span>
                </div>

                <div className="bg-dz-dark border border-white/10 rounded-xl py-3 px-4 w-full flex justify-between items-center">
                  <span className="text-xs text-dz-text-muted">Débit sur votre portefeuille</span>
                  <span className="font-bold text-white tabular-nums">
                    {formatNumber(AMOUNT_CAD, 2)} CAD
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-dz-text-muted uppercase mb-3">Payer avec</p>
              <div
                role="radiogroup"
                aria-label="Choisir un portefeuille"
                className="space-y-3 mb-8"
              >
                {DEMO_USER_WALLETS.map((wallet) => {
                  const checked = selectedWallet === wallet.currency;
                  return (
                    <label
                      key={wallet.currency}
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                        checked
                          ? "border-dz-primary bg-dz-primary/5 shadow-[0_0_15px_rgba(0,168,77,0.1)]"
                          : "border-white/10 bg-dz-dark hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FlagIcon countryCode={wallet.country} />
                        <div>
                          <p className="font-bold text-white text-sm">Portefeuille {wallet.currency}</p>
                          <p className="text-xs text-dz-text-muted tabular-nums">
                            Solde: {wallet.symbol}
                            {formatNumber(wallet.balance, 2)}
                          </p>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name="wallet"
                          value={wallet.currency}
                          checked={checked}
                          onChange={() => setSelectedWallet(wallet.currency)}
                          className="peer appearance-none w-5 h-5 border-2 border-white/30 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-dz-primary checked:border-dz-primary transition-colors"
                        />
                        <div className="pointer-events-none absolute w-2.5 h-2.5 bg-dz-primary rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handlePayment}
                disabled={paymentState !== "idle"}
                className="w-full py-4 bg-white text-dz-dark rounded-xl font-bold text-lg shadow-lg hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-80 disabled:cursor-wait"
              >
                {paymentState === "authenticating" ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 rounded-full border-2 border-dz-dark/30 border-t-dz-dark inline-block"
                      aria-hidden="true"
                    />
                    <span>Vérification biométrique…</span>
                  </>
                ) : (
                  <span>Payer {formatNumber(AMOUNT_CAD, 2)} CAD</span>
                )}
              </button>
            </div>

            <div className="py-4 bg-dz-dark border-t border-white/5 text-center flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded bg-dz-primary flex items-center justify-center text-dz-dark font-black text-[7px]">
                DZ
              </div>
              <span className="text-xs font-bold text-dz-text-muted">Propulsé par DinarZone Pay</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            role="status"
            aria-live="polite"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-dz-dark-card border border-dz-primary/30 p-10 rounded-[2rem] shadow-[0_0_50px_rgba(0,168,77,0.15)] flex flex-col items-center text-center"
          >
            <div
              role="img"
              aria-label="Paiement confirmé"
              className="w-20 h-20 bg-gradient-to-br from-dz-primary to-dz-green-dark rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,168,77,0.4)] mb-6"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="5 12 10 17 19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Paiement Réussi</h2>
            <p className="text-dz-text-muted mb-6 text-sm">
              Votre commande chez <strong className="text-white">{DEMO_ORDER.merchantName}</strong> est confirmée.
            </p>
            <div className="w-full bg-dz-dark border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-xs text-dz-text-muted uppercase tracking-wider mb-1">Débité</p>
              <p className="font-bold text-white text-xl tabular-nums">
                − {formatNumber(AMOUNT_CAD, 2)} CAD · Portefeuille {selectedWallet}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full inline-block"
                aria-hidden="true"
              />
              <p className="text-xs text-dz-text-muted">Retour au site marchand…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
