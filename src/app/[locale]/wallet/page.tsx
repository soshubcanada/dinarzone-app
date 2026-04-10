"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDzRate } from "@/lib/engine/rates";
import { formatNumber } from "@/lib/utils/formatNumber";
import FlagIcon from "@/components/ui/FlagIcon";

type Currency = "CAD" | "DZD" | "USD";

type Wallet = {
  id: string;
  currency: Currency;
  name: string;
  symbol: string;
  country: string;
  balance: number;
};

type WalletTheme = {
  bgClass: string;
  borderClass: string;
  textClass: string;
  labelClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  hasGoldAccent: boolean;
};

type Transaction = {
  id: number;
  type: string;
  desc: string;
  amount: string;
  currency: Currency;
  date: string;
  icon: string;
  positive: boolean;
};

// DÉMO — à remplacer par les portefeuilles de l'utilisateur authentifié
const WALLETS: Wallet[] = [
  { id: "w-cad", currency: "CAD", name: "Dollar Canadien", symbol: "$", country: "CA", balance: 2450.75 },
  { id: "w-dzd", currency: "DZD", name: "Dinar Algérien", symbol: "DA", country: "DZ", balance: 145000 },
  { id: "w-usd", currency: "USD", name: "Compte Global USD", symbol: "$", country: "US", balance: 150 },
];

// DÉMO — remplacer par l'historique API filtré par corridor
const TRANSACTIONS_BY_CURRENCY: Record<Currency, Transaction[]> = {
  CAD: [
    { id: 1, type: "Dépôt Stripe", desc: "Carte finissant par 4242", amount: "+ 500.00", currency: "CAD", date: "Aujourd'hui", icon: "↓", positive: true },
    { id: 4, type: "Transfert P2P", desc: "Vers Contact #1", amount: "- 200.00", currency: "CAD", date: "10 Avr", icon: "↗", positive: false },
  ],
  DZD: [
    { id: 2, type: "Conversion FX", desc: "CAD vers DZD", amount: "+ 49 500", currency: "DZD", date: "Hier", icon: "⇄", positive: true },
    { id: 3, type: "Paiement Marchand", desc: "Démo Merchant", amount: "- 14 500", currency: "DZD", date: "12 Avr", icon: "●", positive: false },
  ],
  USD: [],
};

const CAD_DZD_CORRIDOR = getDzRate("CA-DZ");
const CAD_DZD_RATE = CAD_DZD_CORRIDOR?.dzRate ?? 100.3;

// DÉMO — à remplacer par un ticker USD/CAD live
const DEMO_USD_CAD_RATE = 1.36;

const TOTAL_IN_CAD = WALLETS.reduce((sum, w) => {
  if (w.currency === "CAD") return sum + w.balance;
  if (w.currency === "DZD") return sum + w.balance / CAD_DZD_RATE;
  if (w.currency === "USD") return sum + w.balance * DEMO_USD_CAD_RATE;
  return sum;
}, 0);

function walletTheme(currency: Currency): WalletTheme {
  switch (currency) {
    case "CAD":
      return {
        bgClass: "bg-white",
        borderClass: "border-dz-gold-mena/30",
        textClass: "text-gray-900",
        labelClass: "text-gray-500",
        badgeBgClass: "bg-dz-gold-mena/10",
        badgeTextClass: "text-dz-gold-mena",
        hasGoldAccent: true,
      };
    case "DZD":
      return {
        bgClass: "bg-gradient-to-br from-dz-primary to-[#007A38]",
        borderClass: "border-dz-primary",
        textClass: "text-white",
        labelClass: "text-white/80",
        badgeBgClass: "bg-white/20",
        badgeTextClass: "text-white",
        hasGoldAccent: false,
      };
    case "USD":
      return {
        bgClass: "bg-gradient-to-br from-[#111827] to-[#1F2937]",
        borderClass: "border-dz-gold-mena/50",
        textClass: "text-dz-gold-mena",
        labelClass: "text-white/80",
        badgeBgClass: "bg-dz-gold-mena/20",
        badgeTextClass: "text-dz-gold-mena",
        hasGoldAccent: false,
      };
  }
}

type QuickActionProps = {
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "primary";
  onClick?: () => void;
};

function QuickAction({ label, icon, variant = "default", onClick }: QuickActionProps) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-3 group focus:outline-none"
    >
      <span
        className={
          isPrimary
            ? "w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-dz-gold flex items-center justify-center text-xl text-white shadow-lg shadow-dz-gold/30 group-hover:shadow-dz-gold/50 group-focus-visible:ring-2 group-focus-visible:ring-dz-gold-mena transition-all active:scale-95 border border-[#9A7A31]/50"
            : "w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-xl text-gray-700 shadow-sm group-hover:border-dz-gold-mena/50 group-focus-visible:ring-2 group-focus-visible:ring-dz-gold-mena transition-all active:scale-95"
        }
      >
        {icon}
      </span>
      <span className={isPrimary ? "text-xs font-bold text-gray-900" : "text-xs font-semibold text-gray-600"}>
        {label}
      </span>
    </button>
  );
}

export default function WalletPage() {
  const [activeWalletIndex, setActiveWalletIndex] = useState(0);

  const activeWallet = WALLETS[activeWalletIndex];
  const theme = walletTheme(activeWallet.currency);

  const recentTransactions = useMemo(
    () => TRANSACTIONS_BY_CURRENCY[activeWallet.currency],
    [activeWallet.currency]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 pb-24 selection:bg-dz-gold-mena/30">
      <header
        className="bg-white px-6 pb-6 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
        style={{ paddingTop: "max(env(safe-area-inset-top), 3.5rem)" }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 border border-dz-gold-mena/20 flex items-center justify-center overflow-hidden shadow-inner text-sm font-bold text-dz-gold-mena">
              PC
            </div>
            <div>
              <p className="text-[10px] text-dz-gold-mena font-bold uppercase tracking-widest mb-0.5">
                Membre Premium
              </p>
              <p className="font-bold text-gray-900 text-lg leading-tight tracking-tight tabular-nums">
                ≈ ${formatNumber(TOTAL_IN_CAD, 2)} CAD
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="w-10 h-10 rounded-full bg-white border border-gray-100 hover:border-dz-gold-mena/50 focus-visible:ring-2 focus-visible:ring-dz-gold-mena transition-colors flex items-center justify-center shadow-sm text-gray-600 hover:text-dz-gold-mena"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto pt-8">
        <div className="px-6 mb-8">
          <div
            role="tabpanel"
            aria-live="polite"
            className="relative h-56 w-full flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWallet.id}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`absolute w-full h-full rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-gray-200/60 border ${theme.borderClass} ${theme.bgClass}`}
              >
                {theme.hasGoldAccent && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-dz-gold-mena/5 to-transparent rounded-bl-full pointer-events-none" />
                )}

                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <FlagIcon countryCode={activeWallet.country} size="lg" className="drop-shadow-sm" />
                    <span className={`font-semibold ${theme.textClass}`}>{activeWallet.name}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full font-mono text-xs font-bold tracking-widest ${theme.badgeBgClass} ${theme.badgeTextClass} shadow-sm`}>
                    {activeWallet.currency}
                  </div>
                </div>

                <div className="relative z-10">
                  <p className={`text-sm mb-1 font-medium ${theme.labelClass}`}>Solde disponible</p>
                  <h2 className={`text-4xl font-bold tabular-nums tracking-tighter ${theme.textClass}`}>
                    <span className="opacity-50 font-normal mr-1">{activeWallet.symbol}</span>
                    {formatNumber(activeWallet.balance, 2)}
                  </h2>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div role="tablist" aria-label="Portefeuilles" className="flex justify-center gap-2 mt-6">
            {WALLETS.map((w, index) => {
              const selected = activeWalletIndex === index;
              return (
                <button
                  key={w.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`Portefeuille ${w.currency}`}
                  onClick={() => setActiveWalletIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-dz-gold-mena ${
                    selected ? "w-6 bg-dz-gold-mena" : "w-1.5 bg-gray-300"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="px-6 mb-10 flex justify-center gap-6">
          <QuickAction
            label="Alimenter"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            }
          />
          <QuickAction
            label="Convertir"
            variant="primary"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            }
          />
          <QuickAction
            label="Envoyer"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            }
          />
        </div>

        <div className="px-6">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-sm font-bold text-gray-900 tracking-wide">Transactions Récentes</h3>
            <button type="button" className="text-xs font-bold text-dz-gold-mena hover:text-dz-gold transition-colors">
              Tout voir
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            <AnimatePresence mode="wait">
              {recentTransactions.length > 0 ? (
                <motion.ul
                  key={activeWallet.currency}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {recentTransactions.map((tx, idx) => (
                    <li
                      key={tx.id}
                      className={`p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-50/80 transition-colors ${
                        idx !== recentTransactions.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shadow-sm text-gray-700">
                          {tx.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{tx.type}</p>
                          <p className="text-xs text-gray-500 font-medium">{tx.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold tabular-nums tracking-tight ${tx.positive ? "text-dz-primary" : "text-gray-900"}`}>
                          {tx.amount}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{tx.date}</p>
                      </div>
                    </li>
                  ))}
                </motion.ul>
              ) : (
                <motion.div
                  key={`empty-${activeWallet.currency}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center border border-gray-100 text-gray-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Aucune activité récente.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
