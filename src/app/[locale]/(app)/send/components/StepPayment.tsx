"use client";

import { useState } from "react";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function StepPayment() {
  const wizard = useTransferWizard();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const handlePay = async () => {
    setLoading(true);
    // Mock payment processing
    setTimeout(() => {
      setLoading(false);
      wizard.setTransferResult(
        "tr_" + crypto.randomUUID().replace(/-/g, "").substring(0, 10),
        "DZ-A8F3K2M9"
      );
    }, 2500);
  };

  const handleBack = () => {
    wizard.setStep(5);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dz-text mb-1">Paiement</h2>
        <p className="text-sm text-dz-text-secondary">
          Payez de facon securisee avec votre carte
        </p>
      </div>

      {/* Amount to pay */}
      <Card className="bg-dz-cream-light border-dz-border/40" padding="sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-dz-text-secondary">Montant a payer</span>
          <span className="text-xl font-bold text-dz-green">
            ${wizard.totalCharged.toFixed(2)} {wizard.sendCurrency}
          </span>
        </div>
      </Card>

      {/* Card form (mock Stripe) */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-8 h-5 text-dz-text-muted" viewBox="0 0 32 20" fill="currentColor">
              <rect width="32" height="20" rx="3" fill="#635BFF" />
              <text x="6" y="14" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">stripe</text>
            </svg>
            <span className="text-xs text-dz-text-muted">Paiement securise</span>
          </div>

          <Input
            label="Numero de carte"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expiration"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            />
            <Input
              label="CVC"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
        </div>
      </Card>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="flex items-center gap-1 text-xs text-dz-text-muted">
          <svg className="w-4 h-4 text-dz-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Chiffrement SSL
        </div>
        <div className="flex items-center gap-1 text-xs text-dz-text-muted">
          <svg className="w-4 h-4 text-dz-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Securise par Stripe
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={handleBack} className="px-6">
          Retour
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={handlePay}
          loading={loading}
          disabled={!cardNumber || !expiry || !cvc}
        >
          Payer ${wizard.totalCharged.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}
