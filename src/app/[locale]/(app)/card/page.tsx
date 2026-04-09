"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/components/ui/FlagIcon";

// ---------- Business rules ----------
// Reverse-direction FX: client deposits DZD cash at a local agent, gets CAD
// credited on a virtual Visa. The "buy" rate is intentionally slightly worse
// than the remittance sending rate (206.85) — 215 DZD/CAD is the spread DinarZone
// keeps on this side of the flow.
const LOCAL_BUY_RATE = 215.0;
const CARD_SETUP_FEE_CAD = 1.5; // one-time on new card
const REFILL_FEE_PCT = 0.025; // 2.5% on every refill

type ActionType = "create" | "reload";

// ---------- SVG icons ----------
function BackIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}
function CheckIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
function ChipIcon({ className = "w-8 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none">
      <rect x="1" y="1" width="30" height="22" rx="3" fill="currentColor" fillOpacity="0.9" />
      <rect x="5" y="5" width="22" height="14" rx="1.5" fill="none" stroke="#070B14" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="5" y1="9" x2="27" y2="9" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
      <line x1="5" y1="15" x2="27" y2="15" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
      <line x1="11" y1="5" x2="11" y2="19" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
      <line x1="21" y1="5" x2="21" y2="19" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
    </svg>
  );
}

// ---------- Deterministic QR placeholder ----------
function QRPlaceholder() {
  return (
    <div className="w-48 h-48 bg-white p-2 grid grid-cols-9 grid-rows-9 gap-[2px] relative">
      {Array.from({ length: 81 }).map((_, i) => {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const isFinderTL = row < 3 && col < 3;
        const isFinderTR = row < 3 && col > 5;
        const isFinderBL = row > 5 && col < 3;
        const isCenter = row >= 3 && row <= 5 && col >= 3 && col <= 5;
        const isFill =
          isFinderTL || isFinderTR || isFinderBL || isCenter || (i * 11 + 7) % 5 < 2;
        return (
          <div
            key={i}
            className={`rounded-[1px] ${isFill ? "bg-[#070B14]" : "bg-white"}`}
          />
        );
      })}
    </div>
  );
}

// ---------- Page ----------
export default function VirtualCardFundingPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const [fundingAmountDZD, setFundingAmountDZD] = useState<string>("50000");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardGenerated, setCardGenerated] = useState<boolean>(false);
  const [actionType, setActionType] = useState<ActionType>("reload");

  // ---- Calculations ----
  const cardSetupFeeCAD = actionType === "create" ? CARD_SETUP_FEE_CAD : 0;

  const { grossCad, refillFeeCAD, netCadReceived } = useMemo(() => {
    const inputDZD = parseFloat(fundingAmountDZD) || 0;
    const gross = inputDZD / LOCAL_BUY_RATE;
    const refill = gross * REFILL_FEE_PCT;
    const net = Math.max(0, gross - cardSetupFeeCAD - refill);
    return { grossCad: gross, refillFeeCAD: refill, netCadReceived: net };
  }, [fundingAmountDZD, cardSetupFeeCAD]);

  const fundingAmountNumber = parseFloat(fundingAmountDZD) || 0;

  const handleFundCard = () => {
    setIsProcessing(true);
    if (typeof window !== "undefined" && "vibrate" in window.navigator) {
      window.navigator.vibrate(20);
    }
    setTimeout(() => {
      setIsProcessing(false);
      setCardGenerated(true);
      if (typeof window !== "undefined" && "vibrate" in window.navigator) {
        window.navigator.vibrate([15, 50, 20]);
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans text-white pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={() => router.push(`/${loc}/dashboard`)}
          aria-label="Retour au tableau de bord"
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-white">Carte Virtuelle</h1>
        <div className="w-10 h-10" />
      </div>

      <AnimatePresence mode="wait">
        {!cardGenerated ? (
          <motion.div
            key="funding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Action toggle: Create vs. Reload */}
            <div className="flex bg-[#0F1523] p-1 rounded-xl border border-white/5 shadow-inner">
              <button
                type="button"
                onClick={() => setActionType("reload")}
                aria-pressed={actionType === "reload"}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  actionType === "reload"
                    ? "bg-[#070B14] text-[#B8923B] border border-[#B8923B]/30 shadow-md"
                    : "text-[#7B8DB5] hover:text-white"
                }`}
              >
                Recharger
              </button>
              <button
                type="button"
                onClick={() => setActionType("create")}
                aria-pressed={actionType === "create"}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  actionType === "create"
                    ? "bg-[#070B14] text-[#B8923B] border border-[#B8923B]/30 shadow-md"
                    : "text-[#7B8DB5] hover:text-white"
                }`}
              >
                Nouvelle Carte
              </button>
            </div>

            {/* Card preview */}
            <div
              className={`w-full aspect-[1.6/1] rounded-2xl p-6 relative overflow-hidden transition-all duration-500 ${
                actionType === "create"
                  ? "shadow-[0_20px_50px_rgba(184,146,59,0.15)] bg-gradient-to-br from-[#1A2235] to-[#0F1523] border border-white/10"
                  : "shadow-[0_20px_50px_rgba(184,146,59,0.3)] bg-gradient-to-br from-[#B8923B] to-[#9A7A31]"
              }`}
            >
              {/* Subtle diagonal stripes texture (pure CSS, no external deps) */}
              <div
                className="absolute inset-0 opacity-10 z-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)",
                }}
              />

              <div
                className={`relative z-20 h-full flex flex-col justify-between ${
                  actionType === "create" ? "text-white" : "text-[#070B14]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-mono tracking-widest text-sm font-bold">
                    DinarZone Premium
                  </div>
                  <div className="text-2xl italic font-black">VISA</div>
                </div>

                {actionType === "reload" ? (
                  <div>
                    <div className="text-2xl font-mono tracking-widest font-bold mb-1">
                      •••• •••• •••• 8934
                    </div>
                    <p className="text-xs font-bold opacity-80">Solde actuel : 12,50 CAD</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChipIcon className="w-8 h-6 text-[#B8923B]" />
                    <div className="text-xl font-mono opacity-50 tracking-[0.2em]">
                      •••• •••• ••••
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="font-mono font-bold text-sm">Nabila Dahmani</div>
                </div>
              </div>
            </div>

            {/* Dynamic calculator */}
            <div className="bg-[#0F1523] border border-[#B8923B]/30 rounded-3xl p-5 shadow-lg relative">
              <div className="absolute -top-3 left-6 bg-[#B8923B] text-[#070B14] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-10">
                Taux Marché Local
              </div>

              {/* Input DZD */}
              <div className="bg-[#070B14] border border-white/10 rounded-2xl p-4 mb-4 mt-2 focus-within:border-[#B8923B] transition-colors">
                <label
                  htmlFor="funding-dzd"
                  className="text-xs font-bold text-[#7B8DB5] block mb-1"
                >
                  Espèces à déposer (Agent)
                </label>
                <div className="flex items-center">
                  <input
                    id="funding-dzd"
                    type="number"
                    inputMode="decimal"
                    value={fundingAmountDZD}
                    onChange={(e) => setFundingAmountDZD(e.target.value)}
                    className="w-full bg-transparent text-2xl font-bold text-white outline-none tabular-nums"
                  />
                  <div className="flex items-center gap-2 bg-[#B8923B]/10 px-3 py-1.5 rounded-lg border border-[#B8923B]/30 shrink-0">
                    <FlagIcon countryCode="DZ" size="sm" />
                    <span className="font-bold text-sm text-[#B8923B]">DZD</span>
                  </div>
                </div>
              </div>

              {/* Fee breakdown — radical transparency */}
              <div className="px-2 py-3 space-y-2.5 mb-4 relative border-l-2 border-white/10 ml-2">
                <div className="flex items-center justify-between text-xs pl-3">
                  <span className="text-[#B8923B] font-bold">Taux appliqué</span>
                  <span className="font-bold text-white font-mono">
                    1 CAD = {LOCAL_BUY_RATE.toFixed(2)} DZD
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pl-3">
                  <span className="text-[#7B8DB5]">Montant brut converti</span>
                  <span className="font-bold text-white tabular-nums">
                    {grossCad.toFixed(2)} CAD
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pl-3">
                  <span className="text-[#7B8DB5]">Frais de recharge (2,5 %)</span>
                  <span className="font-bold text-red-400 tabular-nums">
                    − {refillFeeCAD.toFixed(2)} CAD
                  </span>
                </div>

                <AnimatePresence>
                  {actionType === "create" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center justify-between text-xs pl-3 overflow-hidden"
                    >
                      <span className="text-[#7B8DB5]">Frais d&apos;émission (Unique)</span>
                      <span className="font-bold text-red-400 tabular-nums">
                        − {cardSetupFeeCAD.toFixed(2)} CAD
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Output CAD — net credited */}
              <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl p-4">
                <p className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Montant net ajouté à la carte
                </p>
                <div className="flex items-center">
                  <div className="w-full text-3xl font-bold text-[#00A84D] tabular-nums">
                    + {netCadReceived > 0 ? netCadReceived.toFixed(2) : "0,00"}
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 shrink-0">
                    <FlagIcon countryCode="CA" size="sm" />
                    <span className="font-bold text-sm text-white">CAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              disabled={isProcessing || netCadReceived <= 0}
              onClick={handleFundCard}
              className="w-full py-4 bg-gradient-to-r from-[#B8923B] to-[#9A7A31] text-[#070B14] rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(184,146,59,0.3)] hover:shadow-[0_10px_30px_rgba(184,146,59,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-[#070B14]/30 border-t-[#070B14] rounded-full"
                />
              ) : actionType === "create" ? (
                "Créer et Créditer la carte"
              ) : (
                "Générer le code de recharge"
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center pt-4"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#B8923B] to-[#9A7A31] rounded-full flex items-center justify-center text-[#070B14] shadow-[0_0_40px_rgba(184,146,59,0.4)] mb-6">
              <CheckIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              {actionType === "create" ? "Carte prête !" : "Code généré !"}
            </h2>
            <p className="text-[#7B8DB5] text-center text-sm mb-8 px-4">
              Présentez ce code à un agent DinarZone et déposez{" "}
              <span className="font-bold text-white">
                {fundingAmountNumber.toLocaleString("fr-DZ")} DZD
              </span>{" "}
              pour débloquer vos{" "}
              <span className="font-bold text-[#00A84D]">
                {netCadReceived.toFixed(2)} CAD
              </span>
              .
            </p>

            {/* QR code with scanning beam animation */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner mb-8 flex items-center justify-center relative overflow-hidden">
              <QRPlaceholder />
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute left-0 right-0 h-0.5 bg-[#B8923B] shadow-[0_0_15px_#B8923B] z-10"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setCardGenerated(false);
                setActionType("reload");
              }}
              className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold transition-all active:scale-95 hover:bg-white/15"
            >
              Terminer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
