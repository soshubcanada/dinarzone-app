"use client";

import { useState, useMemo } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import { CORRIDORS } from "@/lib/constants/corridors";
import { getDzRate, getQuote } from "@/lib/engine/rates";
import { useKycStore } from "@/store/useKycStore";
import FlagIcon from "@/components/ui/FlagIcon";
import PremiumButton from "@/components/ui/PremiumButton";
import { triggerHaptic } from "@/lib/utils/haptics";

// Build corridor list from constants + rate engine
const ACTIVE_CORRIDORS = CORRIDORS.filter((c) => c.isActive).map((c) => {
  const rate = getDzRate(c.id);
  return {
    id: c.id,
    from: c.sourceCountry,
    to: c.destinationCountry,
    fromCur: c.sourceCurrency,
    toCur: c.destinationCurrency,
    rate: rate?.dzRate ?? 0,
    minAmount: c.minAmount,
    maxAmount: c.maxAmount,
  };
}).filter((c) => c.rate > 0);

export default function StepCalculator() {
  const { sendAmount, corridor, fee, setAmount, setCorridor, setFee, setStep } =
    useTransferStore();

  const [amount, setLocalAmount] = useState(sendAmount);
  const selectedCorridor = ACTIVE_CORRIDORS.find((c) => c.id === corridor) || ACTIVE_CORRIDORS[0];
  const kycCanSend = useKycStore((s) => s.canSend);
  const kycRemaining = useKycStore((s) => s.getRemainingLimit);

  const quote = useMemo(
    () => getQuote(selectedCorridor.id, amount),
    [selectedCorridor.id, amount]
  );

  const receiveAmount = quote?.receiveAmount ?? 0;
  const fees = quote?.fees ?? { totalFee: 0, fixedFee: 0, percentFee: 0, feePercent: 0, deliverySurcharge: 0 };

  const handleCorridorChange = (id: string) => {
    const c = ACTIVE_CORRIDORS.find((c) => c.id === id);
    if (c) {
      triggerHaptic("light");
      setCorridor(c.id, c.rate);
    }
  };

  const handleContinue = () => {
    setAmount(amount, receiveAmount);
    setFee(fees.totalFee);
    setStep(2);
  };

  const isWithinCorridorLimits = amount >= selectedCorridor.minAmount && amount <= selectedCorridor.maxAmount;
  const isWithinKycLimit = kycCanSend(amount);
  const isValid = isWithinCorridorLimits && isWithinKycLimit;

  return (
    <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-6 shadow-xl backdrop-blur-xl">
      <h2 className="text-2xl font-serif font-bold text-dz-fg mb-6">
        Combien souhaitez-vous envoyer ?
      </h2>

      {/* Corridor selector */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {ACTIVE_CORRIDORS.slice(0, 8).map((c) => (
          <button
            key={c.id}
            onClick={() => handleCorridorChange(c.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
              corridor === c.id
                ? "border-[#00A84D] bg-[#00A84D]/10"
                : "border-dz-border-subtle bg-dz-bg hover:bg-white/10"
            }`}
          >
            <FlagIcon countryCode={c.to} size="md" />
            <span className="text-[11px] font-semibold text-dz-fg">{c.toCur}</span>
          </button>
        ))}
      </div>

      {/* Send input */}
      <div className="bg-dz-bg border border-dz-border-subtle rounded-2xl p-4 mb-2 hover:border-[#00A84D]/50 transition-colors focus-within:border-[#00A84D] focus-within:ring-1 focus-within:ring-[#00A84D]">
        <label className="text-xs text-dz-fg-muted font-bold uppercase tracking-wider">
          Vous envoyez
        </label>
        <div className="flex justify-between items-center mt-2">
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setLocalAmount(Number(e.target.value))}
            placeholder="0.00"
            className="bg-transparent text-4xl font-bold text-dz-fg w-full outline-none font-sans tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <div className="flex items-center gap-2 bg-dz-card px-3 py-2 rounded-xl border border-dz-border-subtle">
            <FlagIcon countryCode={selectedCorridor.from} size="sm" />
            <span className="font-bold text-dz-fg">{selectedCorridor.fromCur}</span>
          </div>
        </div>
      </div>

      {/* Wise-style fee breakdown */}
      <div className="pl-6 py-3 space-y-3 relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-dz-border-subtle" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-5 h-5 rounded-full bg-dz-bg border-2 border-dz-border-subtle flex items-center justify-center font-bold text-dz-fg text-xs">
            -
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-dz-fg-muted">
              Frais DinarZone
              {fees.feePercent > 0 && (
                <span className="text-[10px] ml-1">({fees.feePercent}%)</span>
              )}
            </span>
            <span className="font-bold text-dz-fg">
              {fees.totalFee.toFixed(2)} {selectedCorridor.fromCur}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-5 h-5 rounded-full bg-[#00A84D]/20 border-2 border-[#00A84D] flex items-center justify-center font-bold text-[#00A84D] text-[10px]">
            x
          </div>
          <div className="flex justify-between w-full text-sm">
            <span className="text-dz-fg-muted">Taux garanti (15 min)</span>
            <span className="font-bold text-[#00A84D]">
              {selectedCorridor.rate.toFixed(selectedCorridor.rate < 10 ? 4 : 2)}
            </span>
          </div>
        </div>
      </div>

      {/* Receive output */}
      <div className="bg-dz-bg border border-dz-border-subtle rounded-2xl p-4 mt-2">
        <label className="text-xs text-dz-fg-muted font-bold uppercase tracking-wider">
          Le beneficiaire recoit
        </label>
        <div className="flex justify-between items-center mt-2">
          <span className="text-4xl font-bold text-dz-fg tabular-nums">
            {receiveAmount.toLocaleString("fr-CA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <div className="flex items-center gap-2 bg-dz-card px-3 py-2 rounded-xl border border-dz-border-subtle">
            <FlagIcon countryCode={selectedCorridor.to} size="sm" />
            <span className="font-bold text-dz-fg">{selectedCorridor.toCur}</span>
          </div>
        </div>
      </div>

      {/* Savings badge */}
      {quote && quote.savings > 0 && amount > 0 && (
        <div className="flex items-center justify-center gap-2 mt-3 py-1.5">
          <svg className="w-4 h-4 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-[#00A84D]">
            Economisez {quote.savings.toLocaleString("fr-CA")} {selectedCorridor.toCur} vs banques
          </span>
        </div>
      )}

      {/* KYC limit warning */}
      {amount > 0 && !isWithinKycLimit && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-400">
            Limite KYC depassee. Reste: ${kycRemaining().toLocaleString("fr-CA")} CAD.
            <a href="/fr/kyc" className="underline ml-1 font-semibold">Augmenter</a>
          </p>
        </div>
      )}

      {/* Amount range hint */}
      {amount > 0 && !isWithinCorridorLimits && isWithinKycLimit && (
        <p className="text-center text-xs text-red-400 mt-2">
          Montant: {selectedCorridor.minAmount} - {selectedCorridor.maxAmount.toLocaleString("fr-CA")} {selectedCorridor.fromCur}
        </p>
      )}

      <div className="mt-8">
        <PremiumButton onClick={handleContinue} disabled={!isValid || amount <= 0}>
          Continuer
        </PremiumButton>
      </div>
    </div>
  );
}
