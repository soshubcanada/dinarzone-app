"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/components/ui/FlagIcon";
import { formatNumber } from "@/lib/utils/formatNumber";

// ---------- Business rules ----------
// Reverse-direction FX: client deposits DZD cash at a local agent, receives CAD
// credited on a virtual Visa. Rates / fees shown here are indicative — the
// server-side engine returns the authoritative quote at confirmation time.
const LOCAL_BUY_RATE_INDICATIVE = 215.0;
const CARD_SETUP_FEE_CAD = 1.5;
const REFILL_FEE_PCT = 0.025;

// KYC-driven deposit caps. The real policy lives server-side; these mirror
// Tier 1 self-serve limits to keep calculator inputs in a sane range.
const MIN_DEPOSIT_DZD = 2000;
const MAX_DEPOSIT_DZD = 600_000; // ≈ 2790 CAD at 215 — just under Tier 1 cap

// Visa program disclosure. Update when the real issuing bank is confirmed.
const CARD_ISSUER_NAME =
  process.env.NEXT_PUBLIC_CARD_ISSUER_NAME ?? "Banque émettrice partenaire";

type ActionType = "create" | "reload";

function sanitizeAmount(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function BackIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}
function CheckIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
function ChipIcon({ className = "w-8 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="22" rx="3" fill="currentColor" fillOpacity="0.9" />
      <rect x="5" y="5" width="22" height="14" rx="1.5" fill="none" stroke="#070B14" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="5" y1="9" x2="27" y2="9" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
      <line x1="5" y1="15" x2="27" y2="15" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
      <line x1="11" y1="5" x2="11" y2="19" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
      <line x1="21" y1="5" x2="21" y2="19" stroke="#070B14" strokeOpacity="0.3" strokeWidth="0.8" />
    </svg>
  );
}

// Deterministic QR grid placeholder — watermarked DÉMO until wired to a real
// payment reference returned by /api/card/fund.
const QR_CELLS = Array.from({ length: 81 }, (_, i) => {
  const row = Math.floor(i / 9);
  const col = i % 9;
  const isFinderTL = row < 3 && col < 3;
  const isFinderTR = row < 3 && col > 5;
  const isFinderBL = row > 5 && col < 3;
  const isCenter = row >= 3 && row <= 5 && col >= 3 && col <= 5;
  return isFinderTL || isFinderTR || isFinderBL || isCenter || (i * 11 + 7) % 5 < 2;
});

function QRPlaceholder() {
  return (
    <div
      className="w-48 h-48 bg-white p-2 grid grid-cols-9 grid-rows-9 gap-[2px] relative"
      data-testid="qr-placeholder"
      aria-label="Code QR de démonstration"
    >
      {QR_CELLS.map((isFill, i) => (
        <div key={i} className={`rounded-[1px] ${isFill ? "bg-dz-dark" : "bg-white"}`} />
      ))}
      <span className="absolute inset-0 flex items-center justify-center text-dz-dark font-black text-[10px] tracking-widest bg-white/0 pointer-events-none">
        DÉMO
      </span>
    </div>
  );
}

export default function VirtualCardFundingPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const [fundingAmountDZD, setFundingAmountDZD] = useState<string>("50000");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cardGenerated, setCardGenerated] = useState<boolean>(false);
  const [actionType, setActionType] = useState<ActionType>("reload");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const { inputDZD, grossCad, refillFeeCAD, cardSetupFeeCAD, netCadReceived } = useMemo(() => {
    const input = parseFloat(fundingAmountDZD) || 0;
    const gross = input / LOCAL_BUY_RATE_INDICATIVE;
    const refill = gross * REFILL_FEE_PCT;
    const setupFee = actionType === "create" ? CARD_SETUP_FEE_CAD : 0;
    const net = Math.max(0, gross - setupFee - refill);
    return {
      inputDZD: input,
      grossCad: gross,
      refillFeeCAD: refill,
      cardSetupFeeCAD: setupFee,
      netCadReceived: net,
    };
  }, [fundingAmountDZD, actionType]);

  const belowMin = inputDZD > 0 && inputDZD < MIN_DEPOSIT_DZD;
  const aboveMax = inputDZD > MAX_DEPOSIT_DZD;
  const hasAmountError = belowMin || aboveMax;
  const canSubmit = !hasAmountError && inputDZD >= MIN_DEPOSIT_DZD && termsAccepted && !isProcessing;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFundingAmountDZD(sanitizeAmount(e.target.value));
  };

  const handleFundCard = () => {
    if (!canSubmit) return;
    setIsProcessing(true);
    navigator.vibrate?.(20);
    // TODO: replace with POST /api/card/fund — this placeholder must NOT ship
    // to production without the real endpoint wired and an idempotency key.
    setTimeout(() => {
      setIsProcessing(false);
      setCardGenerated(true);
      navigator.vibrate?.([15, 50, 20]);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans text-white pb-12">
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
        <div className="w-10 h-10" aria-hidden="true" />
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
            <div
              role="radiogroup"
              aria-label="Type d'action"
              className="flex bg-[#0F1523] p-1 rounded-xl border border-white/5 shadow-inner"
            >
              {([
                { value: "reload", label: "Recharger" },
                { value: "create", label: "Nouvelle Carte" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActionType(value)}
                  role="radio"
                  aria-checked={actionType === value}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    actionType === value
                      ? "bg-dz-dark text-dz-gold border border-dz-gold/30 shadow-md"
                      : "text-[#7B8DB5] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              className={`w-full aspect-[1.6/1] rounded-2xl p-6 relative overflow-hidden transition-all duration-500 ${
                actionType === "create"
                  ? "shadow-[0_20px_50px_rgba(184,146,59,0.15)] bg-gradient-to-br from-[#1A2235] to-[#0F1523] border border-white/10"
                  : "shadow-[0_20px_50px_rgba(184,146,59,0.3)] bg-gradient-to-br from-dz-gold to-[#9A7A31]"
              }`}
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 opacity-10 z-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 12px)",
                }}
              />

              <div
                className={`relative z-20 h-full flex flex-col justify-between ${
                  actionType === "create" ? "text-white" : "text-dz-dark"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-mono tracking-widest text-sm font-bold">DinarZone</div>
                  <div className="text-2xl italic font-black">VISA</div>
                </div>

                {actionType === "reload" ? (
                  <div>
                    <div className="text-2xl font-mono tracking-widest font-bold mb-1">
                      •••• •••• •••• ••••
                    </div>
                    <p className="text-xs font-bold opacity-80">Solde affiché après connexion</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ChipIcon className="w-8 h-6 text-dz-gold" />
                    <div className="text-xl font-mono opacity-50 tracking-[0.2em]">
                      •••• •••• ••••
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <div className="font-mono font-bold text-sm uppercase tracking-wider opacity-80">
                    Titulaire
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#7B8DB5] text-center -mt-2">
              Carte Visa prépayée émise par {CARD_ISSUER_NAME}, sous licence Visa Inc.
              Programme soumis aux{" "}
              <a href={`/${loc}/legal/card-terms`} className="underline hover:text-white">
                conditions du porteur
              </a>
              .
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFundCard();
              }}
              className="bg-[#0F1523] border border-dz-gold/30 rounded-3xl p-5 shadow-lg relative"
            >
              <div className="absolute -top-3 left-6 bg-dz-gold text-dz-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md z-10">
                Taux indicatif
              </div>

              <div className="bg-dz-dark border border-white/10 rounded-2xl p-4 mb-4 mt-2 focus-within:border-dz-gold transition-colors">
                <label htmlFor="funding-dzd" className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Espèces à déposer (Agent)
                </label>
                <div className="flex items-center">
                  <input
                    id="funding-dzd"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={fundingAmountDZD}
                    onChange={handleAmountChange}
                    aria-describedby="deposit-help receive-amount"
                    aria-invalid={hasAmountError}
                    className="w-full bg-transparent text-2xl font-bold text-white outline-none tabular-nums"
                  />
                  <div className="flex items-center gap-2 bg-dz-gold/10 px-3 py-1.5 rounded-lg border border-dz-gold/30 shrink-0">
                    <FlagIcon countryCode="DZ" size="sm" />
                    <span className="font-bold text-sm text-dz-gold">DZD</span>
                  </div>
                </div>
              </div>

              <p id="deposit-help" className="sr-only">
                Dépôt minimum {formatNumber(MIN_DEPOSIT_DZD, 0)} DZD, maximum {formatNumber(MAX_DEPOSIT_DZD, 0)} DZD par transaction Tier 1.
              </p>

              {hasAmountError && (
                <p role="alert" className="text-[11px] font-bold text-dz-warning mb-2">
                  {belowMin
                    ? `Dépôt minimum : ${formatNumber(MIN_DEPOSIT_DZD, 0)} DZD.`
                    : `Plafond Tier 1 : ${formatNumber(MAX_DEPOSIT_DZD, 0)} DZD par transaction.`}
                </p>
              )}

              <div className="px-2 py-3 space-y-2.5 mb-4 relative border-l-2 border-white/10 ml-2">
                <div className="flex items-center justify-between text-xs pl-3">
                  <span className="text-dz-gold font-bold">Taux appliqué (indicatif)</span>
                  <span className="font-bold text-white font-mono">
                    1 CAD = {LOCAL_BUY_RATE_INDICATIVE.toFixed(2)} DZD
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pl-3">
                  <span className="text-[#7B8DB5]">Montant brut converti</span>
                  <span className="font-bold text-white tabular-nums">
                    {formatNumber(grossCad, 2)} CAD
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pl-3">
                  <span className="text-[#7B8DB5]">Frais de recharge (2,5 %)</span>
                  <span className="font-bold text-red-400 tabular-nums">
                    − {formatNumber(refillFeeCAD, 2)} CAD
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
                        − {formatNumber(cardSetupFeeCAD, 2)} CAD
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl p-4">
                <label htmlFor="receive-amount" className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Montant net ajouté à la carte
                </label>
                <div className="flex items-center">
                  <output
                    id="receive-amount"
                    htmlFor="funding-dzd"
                    aria-live="polite"
                    className="w-full text-3xl font-bold text-dz-primary tabular-nums"
                  >
                    + {netCadReceived > 0 ? formatNumber(netCadReceived, 2) : "0,00"}
                  </output>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 shrink-0">
                    <FlagIcon countryCode="CA" size="sm" />
                    <span className="font-bold text-sm text-white">CAD</span>
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 mt-4 text-[11px] text-[#7B8DB5] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-dz-gold focus:ring-dz-gold"
                />
                <span>
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <a href={`/${loc}/legal/card-terms`} className="underline hover:text-white">
                    conditions du programme de carte
                  </a>
                  , le{" "}
                  <a href={`/${loc}/legal/fees`} className="underline hover:text-white">
                    barème des frais
                  </a>{" "}
                  et le taux indicatif qui sera confirmé au moment du dépôt chez l&apos;agent.
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-5 py-4 bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-dark rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(184,146,59,0.3)] hover:shadow-[0_10px_30px_rgba(184,146,59,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-dz-dark/30 border-t-dz-dark rounded-full"
                    aria-label="Traitement en cours"
                  />
                ) : actionType === "create" ? (
                  "Créer et créditer la carte"
                ) : (
                  "Générer le code de recharge"
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center pt-4"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-dz-gold to-[#9A7A31] rounded-full flex items-center justify-center text-dz-dark shadow-[0_0_40px_rgba(184,146,59,0.4)] mb-6">
              <CheckIcon className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              {actionType === "create" ? "Carte prête !" : "Code généré !"}
            </h2>
            <p className="text-[#7B8DB5] text-center text-sm mb-8 px-4">
              Présentez ce code à un agent DinarZone et déposez{" "}
              <span className="font-bold text-white">
                {formatNumber(inputDZD, 0)} DZD
              </span>{" "}
              pour débloquer{" "}
              <span className="font-bold text-dz-primary">
                {formatNumber(netCadReceived, 2)} CAD
              </span>
              .
            </p>

            <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner mb-8 flex items-center justify-center relative overflow-hidden">
              <QRPlaceholder />
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute left-0 right-0 h-0.5 bg-dz-gold shadow-[0_0_15px_#B8923B] z-10"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setCardGenerated(false);
                setTermsAccepted(false);
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
