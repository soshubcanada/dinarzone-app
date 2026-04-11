"use client";

import { useTransferStore } from "@/store/useTransferStore";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import StepCalculator from "./components/StepCalculator";
import StepDelivery from "./components/StepDelivery";
import StepRecipient from "./components/StepRecipient";
import StepReview from "./components/StepReview";
import TransferTracking from "./components/TransferTracking";

const variants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const STEP_LABELS = ["Montant", "Livraison", "Destinataire", "Resume"];

export default function SendMoneyWizard() {
  const { step, direction } = useTransferStore();

  return (
    <div className="w-full max-w-xl mx-auto pt-4 pb-20">
      {/* Stepper — hidden on tracking step */}
      {step <= 4 && (
        <div className="flex items-center justify-between mb-8 px-4">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      step >= stepNum
                        ? "bg-[#00A84D] text-white shadow-[0_0_15px_rgba(0,168,77,0.4)]"
                        : "bg-white/5 text-[#7B8DB5] border border-white/10"
                    }`}
                  >
                    {step > stepNum ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      step >= stepNum ? "text-white" : "text-[#7B8DB5]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-1 rounded-full transition-colors duration-300 ${
                      step > stepNum ? "bg-[#00A84D]" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Animated step container */}
      <div className="relative w-full overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {step === 1 && <StepCalculator />}
            {step === 2 && <StepDelivery />}
            {step === 3 && <StepRecipient />}
            {step === 4 && <StepReview />}
            {step === 5 && <TransferTracking />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
