"use client";

import { useState } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import PremiumButton from "@/components/ui/PremiumButton";
import { triggerHaptic } from "@/lib/utils/haptics";
import { motion, AnimatePresence } from "framer-motion";

export default function StepRecipient() {
  const { deliveryMethod, setStep } = useTransferStore();
  const [tab, setTab] = useState<"existing" | "new">("new");
  const [ripData, setRipData] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Masque de saisie pour le RIP
  const formatRIP = (val: string) => {
    return val
      .replace(/\D/g, "")
      .replace(/(.{3})(.{5})(.{10})(.{2})/, "$1 $2 $3 $4")
      .trim();
  };

  const isRipValid = ripData.replace(/\s/g, "").length === 20;

  const handleRipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prev = ripData.replace(/\s/g, "").length;
    setRipData(e.target.value);
    const next = e.target.value.replace(/\D/g, "").length;
    if (prev < 20 && next === 20) triggerHaptic("success");
  };

  return (
    <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
      {/* Effet de brillance en arriere-plan */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-dz-primary/5 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-2xl font-serif font-bold text-dz-fg mb-6 relative z-10">
        &Agrave; qui envoyez-vous ?
      </h2>

      {/* Onglets (Segmented Control) avec coulissement style iOS Natif */}
      <div className="relative flex bg-[#070B14]/50 p-1 rounded-xl mb-8 border border-white/5 z-10">
        {(["existing", "new"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              triggerHaptic("light");
              setTab(t);
            }}
            className={`relative flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors z-10 ${
              tab === t
                ? "text-white"
                : "text-dz-fg-muted hover:text-white/70"
            }`}
          >
            {tab === t && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 border border-white/10 shadow-sm rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {t === "existing"
              ? "Carnet d\u2019adresses"
              : "Nouveau destinataire"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "new" ? (
          <motion.div
            key="new"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5 mb-8 relative z-10"
          >
            {/* Formulaire Dynamique : BaridiMob */}
            {deliveryMethod === "baridimob" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Nom complet du titulaire
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-colors ${
                      focusedInput === "name"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : "border-dz-border-subtle"
                    }`}
                  >
                    <span className="pl-4 text-dz-fg-muted">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Ex: Mohamed Khelifi"
                      onFocus={() => setFocusedInput("name")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-dz-fg outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Num&eacute;ro RIP (20 chiffres)
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-all duration-300 ${
                      focusedInput === "rip"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : isRipValid
                          ? "border-[#00A84D] bg-[#00A84D]/5"
                          : "border-dz-border-subtle"
                    }`}
                  >
                    <span className="pl-4 text-dz-fg-muted">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 01-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                        <path
                          fillRule="evenodd"
                          d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      maxLength={23}
                      value={formatRIP(ripData)}
                      onChange={handleRipChange}
                      onFocus={() => setFocusedInput("rip")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder="007 00000 0000000000 00"
                      className="w-full bg-transparent pl-3 pr-12 py-3.5 text-sm text-dz-fg font-sans tabular-nums tracking-wide outline-none"
                    />

                    {/* Badge de validation anime */}
                    <AnimatePresence>
                      {isRipValid && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 w-6 h-6 bg-[#00A84D] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,168,77,0.4)]"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-white"
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
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}

            {/* Formulaire Dynamique : Especes */}
            {deliveryMethod === "cash" && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 mb-2 bg-dz-gold/10 border border-dz-gold/20 rounded-xl flex gap-3 items-start"
                >
                  <svg
                    className="w-5 h-5 text-dz-gold flex-shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-dz-gold leading-relaxed">
                    Le nom doit correspondre{" "}
                    <strong className="font-bold">exactement</strong> &agrave;
                    la pi&egrave;ce d&apos;identit&eacute; officielle du
                    b&eacute;n&eacute;ficiaire pour autoriser le retrait.
                  </p>
                </motion.div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Pr&eacute;nom l&eacute;gal
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-colors ${
                      focusedInput === "firstName"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : "border-dz-border-subtle"
                    }`}
                  >
                    <span className="pl-4 text-dz-fg-muted">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      onFocus={() => setFocusedInput("firstName")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-dz-fg outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Nom de famille l&eacute;gal
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-colors ${
                      focusedInput === "lastName"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : "border-dz-border-subtle"
                    }`}
                  >
                    <span className="pl-4 text-dz-fg-muted">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      onFocus={() => setFocusedInput("lastName")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-dz-fg outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Num&eacute;ro de t&eacute;l&eacute;phone local
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-colors ${
                      focusedInput === "phone"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : "border-dz-border-subtle"
                    }`}
                  >
                    <div className="pl-4 pr-2 text-sm font-semibold text-dz-fg-muted border-r border-dz-border-subtle py-3.5">
                      +213
                    </div>
                    <input
                      type="tel"
                      placeholder="555 000 000"
                      onFocus={() => setFocusedInput("phone")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-dz-fg outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Formulaire Dynamique : Virement Bancaire */}
            {deliveryMethod === "bank" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Nom complet du titulaire
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-colors ${
                      focusedInput === "bankName"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : "border-dz-border-subtle"
                    }`}
                  >
                    <span className="pl-4 text-dz-fg-muted">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Ex: Mohamed Khelifi"
                      onFocus={() => setFocusedInput("bankName")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-dz-fg outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dz-fg-muted uppercase tracking-wider ml-1">
                    Num&eacute;ro de compte / RIB
                  </label>
                  <div
                    className={`relative flex items-center bg-dz-bg border rounded-xl overflow-hidden transition-colors ${
                      focusedInput === "rib"
                        ? "border-dz-primary ring-1 ring-dz-primary/30"
                        : "border-dz-border-subtle"
                    }`}
                  >
                    <span className="pl-4 text-dz-fg-muted">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 01-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
                        <path
                          fillRule="evenodd"
                          d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Ex: 00799999000013"
                      onFocus={() => setFocusedInput("rib")}
                      onBlur={() => setFocusedInput(null)}
                      className="w-full bg-transparent px-3 py-3.5 text-sm text-dz-fg font-sans tabular-nums outline-none"
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="existing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-8 relative z-10"
          >
            {/* Liste de contacts Premium */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-all active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A84D] to-[#006A33] text-white flex items-center justify-center font-bold shadow-md text-sm">
                    FA
                  </div>
                  <div>
                    <p className="font-bold text-dz-fg text-sm">
                      Fatima Khelifi
                    </p>
                    <p className="text-xs text-dz-fg-muted font-sans tracking-wide">
                      BaridiMob &bull;&bull;&bull;&bull; 4589
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-dz-primary flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-dz-primary rounded-full" />
                </div>
              </div>

              {/* Bouton Ajouter */}
              <button
                onClick={() => setTab("new")}
                className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-sm font-bold text-dz-fg-muted hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
              >
                + Ajouter un nouveau destinataire
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 relative z-10">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-dz-fg font-bold hover:bg-white/10 transition-colors active:scale-95"
        >
          Retour
        </button>
        <PremiumButton
          onClick={() => setStep(4)}
          disabled={
            tab === "new" && deliveryMethod === "baridimob" && !isRipValid
          }
        >
          Revoir le transfert
        </PremiumButton>
      </div>
    </div>
  );
}
