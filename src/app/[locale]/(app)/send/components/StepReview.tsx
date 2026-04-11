"use client";

import { useState, useEffect } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import SwipeToPay from "@/components/ui/SwipeToPay";

export default function StepReview() {
  const { sendAmount, receiveAmount, exchangeRate, fee, sendCurrency, receiveCurrency, setStep } =
    useTransferStore();
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const rateExpired = timeLeft <= 0;

  const handlePaymentSuccess = () => {
    if (rateExpired) {
      // Rate expired — restart from calculator
      setStep(1);
      return;
    }
    setStep(5);
  };

  return (
    <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-6 shadow-xl backdrop-blur-xl">
      {/* Header avec Timer */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-dz-fg">
          V&eacute;rification
        </h2>
        <div className="flex items-center gap-2 bg-[#00A84D]/10 border border-[#00A84D]/30 px-3 py-1.5 rounded-lg">
          <svg
            className="w-3.5 h-3.5 text-[#00A84D] animate-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
              clipRule="evenodd"
            />
          </svg>
          <span className={`text-xs font-bold tabular-nums ${rateExpired ? "text-red-500" : "text-[#00A84D]"}`}>
            {rateExpired ? "Taux expire" : `Taux garanti : ${formatTime(timeLeft)}`}
          </span>
        </div>
      </div>

      {/* Ticket de resume (Receipt) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-4">
        {/* Envoi */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="text-sm text-dz-fg-muted">Vous envoyez</div>
          <div className="text-xl font-bold text-dz-fg">
            {sendAmount.toFixed(2)} {sendCurrency}
          </div>
        </div>

        {/* Details (Frais & Taux) */}
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-dz-fg-muted">Frais DinarZone</span>
            <span className="text-dz-fg font-medium">
              {fee.toFixed(2)} {sendCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dz-fg-muted">Taux de change</span>
            <span className="text-[#00A84D] font-bold">
              1 {sendCurrency} = {exchangeRate} {receiveCurrency}
            </span>
          </div>
        </div>

        {/* Reception */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <div className="text-sm text-dz-fg-muted font-bold">
            Le b&eacute;n&eacute;ficiaire re&ccedil;oit
          </div>
          <div className="text-2xl font-bold text-dz-fg tracking-tight">
            {receiveAmount.toLocaleString("fr-CA", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            {receiveCurrency}
          </div>
        </div>
      </div>

      {/* Info Beneficiaire */}
      <div className="bg-white/5 rounded-2xl p-4 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#00A84D] to-[#006A33] rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm">
          FA
        </div>
        <div>
          <p className="text-dz-fg font-bold text-sm">Fatima Khelifi</p>
          <p className="text-xs text-dz-fg-muted">
            Virement BaridiMob &bull; 007 **** 12
          </p>
        </div>
        <button
          onClick={() => setStep(3)}
          className="ml-auto text-xs font-bold text-dz-gold hover:underline"
        >
          Modifier
        </button>
      </div>

      {/* Action de paiement finale */}
      <div className="space-y-4">
        <SwipeToPay
          amount={`${(sendAmount + fee).toFixed(2)} ${sendCurrency}`}
          onConfirm={handlePaymentSuccess}
        />

        <p className="text-center text-[10px] text-dz-fg-muted leading-relaxed px-4">
          En glissant, vous acceptez les{" "}
          <span className="underline hover:text-dz-fg cursor-pointer">
            Conditions d&apos;utilisation
          </span>
          . Le transfert sera confi&eacute; &agrave; nos partenaires
          licenci&eacute;s.
        </p>
      </div>
    </div>
  );
}
