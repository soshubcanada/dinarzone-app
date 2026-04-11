"use client";

import { useState, useMemo } from "react";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import { CORRIDORS } from "@/lib/constants/corridors";
import { getQuote } from "@/lib/engine/rates";
import CurrencyInput from "@/components/ui/CurrencyInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function StepAmount() {
  const wizard = useTransferWizard();
  const [sendAmount, setSendAmount] = useState(wizard.sendAmount || 0);
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  const corridor = CORRIDORS.find((c) => c.id === wizard.corridorId);

  const quote = useMemo(
    () => getQuote(wizard.corridorId, sendAmount),
    [wizard.corridorId, sendAmount]
  );

  const rate = quote?.dzRate ?? 1;
  const receiveAmount = quote?.receiveAmount ?? 0;
  const fee = quote?.fees.totalFee ?? 0;
  const totalCharged = quote?.totalCharged ?? 0;
  const savings = quote?.savings ?? 0;

  const isValid = sendAmount >= (corridor?.minAmount || 10);

  const handleContinue = () => {
    wizard.setAmountStep({
      sendAmount,
      receiveAmount,
      exchangeRate: rate,
      feeAmount: fee,
      totalCharged,
    });
  };

  const handleBack = () => {
    wizard.setStep(1);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-dz-text mb-0.5">
          Combien envoyez-vous?
        </h2>
        <p className="text-sm text-dz-text-muted">
          Taux garanti pendant 30 minutes
        </p>
      </div>

      {/* You Send - larger styling */}
      <CurrencyInput
        label="Vous envoyez"
        value={sendAmount}
        onChange={setSendAmount}
        currency={wizard.sendCurrency}
        flag={corridor?.sourceFlag || "\u{1F3F3}\u{FE0F}"}
      />

      {/* Rate badge between inputs (Wise style) */}
      <div className="relative flex items-center justify-center py-1">
        <div className="absolute inset-x-0 top-1/2 h-px bg-dz-border/30" />
        <div className="relative flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-dz-border/30 shadow-sm">
          <svg className="w-4 h-4 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <span className="text-sm font-semibold text-dz-text">
            1 {wizard.sendCurrency} = {rate} {wizard.receiveCurrency}
          </span>
          {/* Green check for guaranteed rate */}
          <svg className="w-4 h-4 text-dz-success" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* They Receive */}
      <CurrencyInput
        label="Ils recoivent"
        value={receiveAmount}
        onChange={() => {}}
        currency={wizard.receiveCurrency}
        flag={corridor?.destinationFlag || "\u{1F3F3}\u{FE0F}"}
        disabled
      />

      {/* Savings comparison line (Wise style) */}
      {sendAmount > 0 && savings > 0 && (
        <div className="flex items-center justify-center gap-2 py-1 animate-fade-in">
          <svg className="w-4 h-4 text-dz-success" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-dz-success">
            Vous economisez {savings.toLocaleString("fr-CA")} {wizard.receiveCurrency} par rapport aux banques
          </span>
        </div>
      )}

      {/* Fee breakdown - Collapsible (Wise hides details) */}
      <Card variant="outline" className="border-dz-border/20 overflow-hidden" padding="none">
        <button
          onClick={() => setShowFeeDetails(!showFeeDetails)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-dz-cream/30 transition-colors"
        >
          <span className="text-sm font-medium text-dz-text-secondary">Frais et details</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-dz-text">${fee.toFixed(2)} {wizard.sendCurrency}</span>
            <svg
              className={`w-4 h-4 text-dz-text-muted transition-transform duration-200 ${showFeeDetails ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </button>

        {showFeeDetails && (
          <div className="px-4 pb-3 space-y-2.5 border-t border-dz-border/15 pt-3 animate-fade-in">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dz-text-muted">Frais de transfert</span>
              <span className="font-medium text-dz-text">
                ${fee.toFixed(2)} {wizard.sendCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dz-text-muted">Taux de change</span>
              <span className="font-medium text-dz-text">
                1 {wizard.sendCurrency} = {rate} {wizard.receiveCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dz-text-muted">Marge de change</span>
              <span className="font-medium text-dz-success">0.0%</span>
            </div>
          </div>
        )}

        {/* Total - always visible */}
        <div className="px-4 py-3 bg-dz-cream/30 border-t border-dz-border/15">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-dz-text text-[15px]">Total a payer</span>
            <span className="text-xl font-bold text-dz-green number-highlight">
              ${sendAmount > 0 ? totalCharged.toFixed(2) : "0.00"} {wizard.sendCurrency}
            </span>
          </div>
        </div>
      </Card>

      {/* Min/Max info */}
      {corridor && (
        <p className="text-[11px] text-dz-text-muted text-center">
          Min: ${corridor.minAmount} {wizard.sendCurrency} &middot; Max: ${corridor.maxAmount.toLocaleString("fr-CA")} {wizard.sendCurrency}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="ghost" size="lg" onClick={handleBack} className="px-6">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Retour
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
