"use client";

import { useTransferStore } from "@/store/useTransferStore";
import PremiumButton from "@/components/ui/PremiumButton";
import { triggerHaptic } from "@/lib/utils/haptics";
import { motion } from "framer-motion";

const METHODS = [
  {
    id: "baridimob" as const,
    title: "Virement BaridiMob / CCP",
    description: "Directement sur un compte postal algerien.",
    eta: "Instantane",
    fee: "Gratuit",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
        <path fillRule="evenodd" d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75C16.004 3 16.5 3.504 16.5 4.125v15.75c0 .621-.496 1.125-1.125 1.125h-6.75A1.125 1.125 0 017.5 19.875V4.125z" clipRule="evenodd" />
      </svg>
    ),
    popular: true,
  },
  {
    id: "cash" as const,
    title: "Retrait en Especes",
    description: "Disponible dans nos 150+ points relais partenaires.",
    eta: "En 15 minutes",
    fee: "+ 2.00 CAD",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
        <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 16.125V4.875zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
        <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
      </svg>
    ),
    popular: false,
  },
  {
    id: "bank" as const,
    title: "Virement Bancaire",
    description: "Transfert vers un compte bancaire local.",
    eta: "1-2 jours",
    fee: "+ 1.50 CAD",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 01-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
        <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
      </svg>
    ),
    popular: false,
  },
];

export default function StepDelivery() {
  const { deliveryMethod, setDeliveryMethod, setStep } = useTransferStore();

  return (
    <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-6 shadow-xl backdrop-blur-xl">
      <h2 className="text-2xl font-serif font-bold text-dz-fg mb-2">
        Comment envoyer l&apos;argent ?
      </h2>
      <p className="text-sm text-dz-fg-muted mb-6">
        Choisissez la methode de reception pour votre beneficiaire.
      </p>

      <div className="space-y-4 mb-8">
        {METHODS.map((method, idx) => {
          const isSelected = deliveryMethod === method.id;

          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                triggerHaptic("light");
                setDeliveryMethod(method.id);
              }}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 border-2 ${
                isSelected
                  ? "bg-[#00A84D]/5 border-[#00A84D] shadow-[0_0_20px_rgba(0,168,77,0.1)]"
                  : "bg-transparent border-dz-border-subtle hover:border-dz-fg-muted/50 hover:bg-white/5"
              }`}
            >
              {method.popular && (
                <div className="absolute -top-3 right-4 bg-dz-gold text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Le plus rapide
                </div>
              )}

              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-[#00A84D]/20 text-[#00A84D]"
                      : "bg-dz-bg border border-dz-border-subtle text-dz-fg-muted"
                  }`}
                >
                  {method.icon}
                </div>

                <div className="flex-1">
                  <h3
                    className={`font-bold ${
                      isSelected ? "text-[#00A84D]" : "text-dz-fg"
                    }`}
                  >
                    {method.title}
                  </h3>
                  <p className="text-xs text-dz-fg-muted mt-1">
                    {method.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-dz-fg">
                      <svg className="w-3.5 h-3.5 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
                      </svg>
                      {method.eta}
                    </span>
                    <span className="text-xs text-dz-fg-muted">&middot;</span>
                    <span className="text-xs font-semibold text-dz-fg">
                      {method.fee}
                    </span>
                  </div>
                </div>

                {/* Custom radio */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected ? "border-[#00A84D]" : "border-dz-fg-muted/30"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-[#00A84D]"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-4 rounded-2xl border border-dz-border-subtle text-dz-fg font-bold hover:bg-white/5 transition-colors"
        >
          Retour
        </button>
        <PremiumButton onClick={() => setStep(3)} disabled={!deliveryMethod}>
          Continuer
        </PremiumButton>
      </div>
    </div>
  );
}
