"use client";

import { useState, useEffect, useCallback } from "react";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import { DELIVERY_METHOD_INFO } from "@/lib/constants/corridors";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FlagIcon from "@/components/ui/FlagIcon";

export default function StepReview() {
  const wizard = useTransferWizard();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  const deliveryInfo = wizard.deliveryMethod
    ? DELIVERY_METHOD_INFO[wizard.deliveryMethod]
    : null;

  // Countdown timer for rate lock
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleConfirm = () => {
    wizard.setStep(6);
  };

  const handleBack = () => {
    wizard.setStep(4);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-dz-text mb-1">
          Verifiez votre transfert
        </h2>
        <p className="text-sm text-dz-text-secondary">
          Confirmez les details avant de payer
        </p>
      </div>

      {/* Rate lock timer */}
      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-dz-gold/10 rounded-lg">
        <svg className="w-4 h-4 text-dz-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-dz-gold">
          Taux bloque pour {formatTime(timeLeft)}
        </span>
      </div>

      {/* Transfer summary */}
      <Card>
        {/* Corridor */}
        <div className="flex items-center justify-between pb-4 border-b border-dz-border/40">
          <div className="flex items-center gap-2">
            <FlagIcon countryCode={wizard.sourceCountry} size="sm" />
            <span className="text-sm font-medium text-dz-text">
              {wizard.sendCurrency}
            </span>
          </div>
          <svg className="w-5 h-5 text-dz-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          <div className="flex items-center gap-2">
            <FlagIcon countryCode={wizard.destinationCountry} size="sm" />
            <span className="text-sm font-medium text-dz-text">
              {wizard.receiveCurrency}
            </span>
          </div>
          <button
            onClick={() => wizard.setStep(1)}
            className="text-xs text-dz-green font-medium hover:text-dz-green-dark"
          >
            Modifier
          </button>
        </div>

        {/* Amount */}
        <div className="py-4 border-b border-dz-border/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dz-text-secondary">Vous envoyez</span>
            <span className="text-lg font-bold text-dz-text">
              ${wizard.sendAmount.toLocaleString()} {wizard.sendCurrency}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dz-text-secondary">Ils recoivent</span>
            <span className="text-lg font-bold text-dz-green">
              {wizard.receiveAmount.toLocaleString()} {wizard.receiveCurrency}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-dz-text-muted">Taux</span>
            <span className="text-sm text-dz-text-secondary">
              1 {wizard.sendCurrency} = {wizard.exchangeRate} {wizard.receiveCurrency}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-muted">Frais</span>
            <span className="text-sm text-dz-text-secondary">
              ${wizard.feeAmount.toFixed(2)} {wizard.sendCurrency}
            </span>
          </div>
          <button
            onClick={() => wizard.setStep(2)}
            className="mt-2 text-xs text-dz-green font-medium hover:text-dz-green-dark"
          >
            Modifier le montant
          </button>
        </div>

        {/* Delivery method */}
        <div className="py-4 border-b border-dz-border/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-dz-text-secondary block mb-1">
                Mode de livraison
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{deliveryInfo?.icon}</span>
                <span className="text-sm font-medium text-dz-text">
                  {deliveryInfo?.label.fr}
                </span>
              </div>
              <Badge color="gold" className="mt-1">
                {deliveryInfo?.estimatedTime.fr}
              </Badge>
            </div>
            <button
              onClick={() => wizard.setStep(3)}
              className="text-xs text-dz-green font-medium hover:text-dz-green-dark"
            >
              Modifier
            </button>
          </div>
        </div>

        {/* Recipient */}
        <div className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-dz-text-secondary block mb-1">
                Destinataire
              </span>
              <p className="text-sm font-semibold text-dz-text">
                {wizard.recipientName}
              </p>
              {wizard.recipientAccountNumber && (
                <p className="text-xs text-dz-text-muted mt-0.5">
                  Compte: {wizard.recipientAccountNumber}
                </p>
              )}
              {wizard.recipientPhone && (
                <p className="text-xs text-dz-text-muted mt-0.5">
                  Tel: {wizard.recipientPhone}
                </p>
              )}
            </div>
            <button
              onClick={() => wizard.setStep(4)}
              className="text-xs text-dz-green font-medium hover:text-dz-green-dark"
            >
              Modifier
            </button>
          </div>
        </div>
      </Card>

      {/* Total card */}
      <Card className="bg-dz-green-darkest text-white border-none">
        <div className="flex items-center justify-between">
          <span className="text-white/80">Total a payer</span>
          <span className="text-2xl font-bold">
            ${wizard.totalCharged.toFixed(2)} {wizard.sendCurrency}
          </span>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={handleBack} className="px-6">
          Retour
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={handleConfirm}
          disabled={timeLeft === 0}
        >
          Confirmer et payer
        </Button>
      </div>
    </div>
  );
}
