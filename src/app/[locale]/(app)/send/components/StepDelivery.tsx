"use client";

import { useState } from "react";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import {
  CORRIDORS,
  DELIVERY_METHOD_INFO,
  type DeliveryMethod,
} from "@/lib/constants/corridors";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Extra fees per delivery method (mock)
const EXTRA_FEES: Partial<Record<DeliveryMethod, number>> = {
  cash_pickup: 2.0,
  exchange_house: 1.5,
  virtual_card: 0,
};

export default function StepDelivery() {
  const wizard = useTransferWizard();
  const [selected, setSelected] = useState<DeliveryMethod | null>(
    wizard.deliveryMethod
  );

  const corridor = CORRIDORS.find((c) => c.id === wizard.corridorId);
  const methods = corridor?.deliveryMethods || [];

  const handleContinue = () => {
    if (!selected) return;
    wizard.setDeliveryStep(selected);
  };

  const handleBack = () => {
    wizard.setStep(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dz-text mb-1">
          Mode de livraison
        </h2>
        <p className="text-sm text-dz-text-secondary">
          Comment votre destinataire recevra l&apos;argent?
        </p>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const info = DELIVERY_METHOD_INFO[method];
          const isSelected = selected === method;
          const extraFee = EXTRA_FEES[method] || 0;

          return (
            <Card
              key={method}
              hover
              padding="md"
              onClick={() => setSelected(method)}
              className={`
                cursor-pointer transition-all
                ${
                  isSelected
                    ? "border-dz-green ring-2 ring-dz-green/20 bg-dz-green/5"
                    : ""
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0 mt-0.5">{info.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-dz-text">
                      {info.label.fr}
                    </h3>
                    {method === "baridimob_ccp" || method === "d17_laposte" ? (
                      <span className="text-[10px] font-semibold text-dz-green bg-dz-green/10 px-1.5 py-0.5 rounded-full">
                        Populaire
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-dz-text-muted mt-0.5">
                    {info.estimatedTime.fr}
                  </p>
                  {extraFee > 0 && (
                    <p className="text-xs text-dz-gold font-medium mt-1">
                      +${extraFee.toFixed(2)} frais supplementaires
                    </p>
                  )}
                  {extraFee === 0 && method !== "bank_transfer" && (
                    <p className="text-xs text-dz-success font-medium mt-1">
                      Sans frais supplementaires
                    </p>
                  )}
                </div>

                {/* Checkmark */}
                {isSelected && (
                  <svg
                    className="w-6 h-6 text-dz-green flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={handleBack} className="px-6">
          Retour
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={!selected}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
