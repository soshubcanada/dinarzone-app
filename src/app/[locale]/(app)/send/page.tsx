"use client";

import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import Stepper from "@/components/ui/Stepper";
import StepCorridor from "./components/StepCorridor";
import StepAmount from "./components/StepAmount";
import StepDelivery from "./components/StepDelivery";
import StepRecipient from "./components/StepRecipient";
import StepReview from "./components/StepReview";
import StepPayment from "./components/StepPayment";
import StepConfirmation from "./components/StepConfirmation";

const WIZARD_STEPS = [
  "Corridor",
  "Montant",
  "Livraison",
  "Destinataire",
  "Resume",
  "Paiement",
  "Confirmation",
];

export default function SendPage() {
  const { currentStep } = useTransferWizard();

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      {/* Stepper - hidden on confirmation step */}
      {currentStep < 7 && (
        <Stepper
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          className="mb-6"
        />
      )}

      {/* Step content */}
      {currentStep === 1 && <StepCorridor />}
      {currentStep === 2 && <StepAmount />}
      {currentStep === 3 && <StepDelivery />}
      {currentStep === 4 && <StepRecipient />}
      {currentStep === 5 && <StepReview />}
      {currentStep === 6 && <StepPayment />}
      {currentStep === 7 && <StepConfirmation />}
    </div>
  );
}
