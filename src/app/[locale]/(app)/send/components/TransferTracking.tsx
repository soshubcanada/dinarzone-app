"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransferStore } from "@/store/useTransferStore";
import PremiumButton from "@/components/ui/PremiumButton";

const STAGES = [
  {
    id: 1,
    title: "Paiement initi\u00e9",
    desc: "Nous avons re\u00e7u votre demande.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
        <path
          fillRule="evenodd"
          d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Fonds s\u00e9curis\u00e9s",
    desc: "Vos CAD sont chez DinarZone.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Conversion en cours",
    desc: "Taux garanti appliqu\u00e9 (99.5 DZD).",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06L4.81 15.75H16.5a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Livr\u00e9 \u00e0 Fatima",
    desc: "Fonds d\u00e9pos\u00e9s sur BaridiMob.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function TransferTracking() {
  const { reset } = useTransferStore();
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStage(2), 2000),
      setTimeout(() => setCurrentStage(3), 5000),
      setTimeout(() => setCurrentStage(4), 8000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto pt-4 pb-20">
      {/* En-tete de Succes */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#00A84D] to-[#006A33] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,168,77,0.4)]"
        >
          <svg
            className="w-12 h-12 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>

        <h2 className="text-3xl font-serif font-bold text-dz-fg mb-2">
          Transfert en route !
        </h2>
        <p className="text-dz-fg-muted">
          Code de suivi :{" "}
          <span className="text-dz-fg font-mono bg-white/10 px-2 py-1 rounded">
            DZ-8472-X9
          </span>
        </p>
      </div>

      {/* Carte de Suivi (Live Tracking) */}
      <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-8 shadow-xl backdrop-blur-xl relative overflow-hidden mb-8">
        {/* Effet Radar */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-dz-primary/5 rounded-full blur-3xl pointer-events-none animate-[pulse_4s_infinite]" />

        <div className="relative z-10 space-y-8">
          {STAGES.map((stage, index) => {
            const isCompleted = currentStage > stage.id;
            const isActive = currentStage === stage.id;

            return (
              <div key={stage.id} className="relative flex gap-6">
                {/* Ligne connectrice verticale */}
                {index < STAGES.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-[-32px] w-0.5 bg-dz-border-subtle">
                    <motion.div
                      className="w-full bg-gradient-to-b from-[#00A84D] to-[#006A33]"
                      initial={{ height: "0%" }}
                      animate={{
                        height: isCompleted
                          ? "100%"
                          : isActive
                            ? "50%"
                            : "0%",
                      }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  </div>
                )}

                {/* Icone d'etape */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor:
                      isCompleted || isActive
                        ? "rgba(0, 168, 77, 0.2)"
                        : "rgba(255, 255, 255, 0.05)",
                    borderColor:
                      isCompleted || isActive
                        ? "#00A84D"
                        : "rgba(255, 255, 255, 0.1)",
                  }}
                  className="relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-500"
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4 text-[#00A84D]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={`${isActive ? "text-[#00A84D]" : "text-dz-fg-muted opacity-50"}`}
                    >
                      {stage.icon}
                    </span>
                  )}

                  {/* Anneau de pulsation pour l'etape active */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border border-[#00A84D] animate-[ping_2s_infinite] opacity-50" />
                  )}
                </motion.div>

                {/* Textes de l'etape */}
                <div className="flex-1 pt-2">
                  <h3
                    className={`font-bold transition-colors duration-500 ${
                      isCompleted || isActive
                        ? "text-dz-fg"
                        : "text-dz-fg-muted"
                    }`}
                  >
                    {stage.title}
                  </h3>
                  <AnimatePresence>
                    {(isActive || isCompleted) && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-sm text-dz-fg-muted mt-1 leading-relaxed"
                      >
                        {stage.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions post-transfert */}
      <div className="space-y-4">
        <PremiumButton onClick={() => reset()}>
          Retour &agrave; l&apos;accueil
        </PremiumButton>

        <button className="w-full py-4 border border-white/10 bg-white/5 rounded-2xl text-dz-fg font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
              clipRule="evenodd"
            />
          </svg>
          Partager le re&ccedil;u
        </button>
      </div>
    </div>
  );
}
