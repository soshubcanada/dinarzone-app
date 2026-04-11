"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useKycStore } from "@/store/useKycStore";
import { triggerHaptic } from "@/lib/utils/haptics";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function KYCOnboarding() {
  const router = useRouter();
  const kyc = useKycStore();

  const [step, setStep] = useState(1);
  const [phoneState, setPhoneState] = useState<"input" | "otp" | "verified">("input");
  const [docState, setDocState] = useState<"select" | "scanning" | "done">("select");
  const [bioState, setBioState] = useState<"idle" | "scanning" | "done">("idle");

  const handleSendOTP = () => {
    triggerHaptic("light");
    setPhoneState("otp");
  };

  const handleVerifyOTP = () => {
    triggerHaptic("success");
    kyc.verifyPhone();
    setPhoneState("verified");
    setTimeout(() => setStep(2), 1000);
  };

  const handleScanDocument = (docType: "passport" | "national_id") => {
    triggerHaptic("light");
    setDocState("scanning");
    setTimeout(() => {
      kyc.uploadDocument(docType, `${docType}_scan.jpg`);
      // Simulate auto-verification
      setTimeout(() => kyc.verifyDocument(docType), 200);
      setDocState("done");
      setTimeout(() => setStep(3), 1500);
    }, 3000);
  };

  const handleBioScan = () => {
    triggerHaptic("light");
    setBioState("scanning");
    setTimeout(() => {
      kyc.uploadDocument("selfie", "selfie_liveness.jpg");
      setTimeout(() => kyc.verifyDocument("selfie"), 200);
      setBioState("done");
      setTimeout(() => {
        // Upgrade to tier_2 after full onboarding
        if (kyc.tierId === "tier_0" || kyc.tierId === "tier_1") {
          kyc.setTier("tier_2");
        }
        setStep(4);
      }, 1500);
    }, 3000);
  };

  const handleGoToDashboard = () => {
    triggerHaptic("success");
    const locale = window.location.pathname.split("/")[1] || "fr";
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-dz-bg flex flex-col items-center pt-12 px-4 pb-20 font-sans text-dz-fg">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-serif font-bold text-center mb-2">
          Verification d&apos;identite
        </h1>
        <p className="text-dz-fg-muted text-center text-sm">
          Exigence reglementaire pour securiser votre compte.
        </p>
      </div>

      {/* Progress bar */}
      {step < 4 && (
        <div className="w-full max-w-md flex items-center justify-between mb-10 px-4">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= i
                    ? "bg-[#00A84D] text-white shadow-[0_0_15px_rgba(0,168,77,0.4)]"
                    : "bg-white/10 text-dz-fg-muted"
                }`}
              >
                {step > i ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  i
                )}
              </div>
              {i < 3 && (
                <div
                  className={`flex-1 h-[2px] mx-2 transition-colors ${
                    step > i ? "bg-[#00A84D]" : "bg-white/10"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main container */}
      <div className="w-full max-w-md relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: PHONE */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-3xl shadow-xl"
            >
              <div className="w-12 h-12 bg-[#00A84D]/20 border border-[#00A84D] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-6">Confirmez votre numero</h2>

              {phoneState === "input" && (
                <div className="space-y-4">
                  <div className="flex bg-dz-bg border border-dz-border-subtle rounded-xl overflow-hidden focus-within:border-[#00A84D] transition-colors">
                    <div className="px-4 py-3 bg-white/5 text-dz-fg-muted font-bold border-r border-dz-border-subtle text-sm">
                      +1
                    </div>
                    <input
                      type="tel"
                      placeholder="514 000 0000"
                      className="w-full bg-transparent px-4 py-3 outline-none text-dz-fg"
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    className="w-full bg-gradient-to-r from-[#00A84D] to-[#006A33] py-3 rounded-xl font-bold active:scale-95 transition-transform text-white"
                  >
                    Recevoir le code
                  </button>
                </div>
              )}

              {phoneState === "otp" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-sm text-dz-fg-muted">Code a 6 chiffres envoye par SMS.</p>
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="------"
                    className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-4 outline-none text-center text-2xl tracking-[0.5em] focus:border-[#00A84D] transition-colors font-mono text-dz-fg"
                  />
                  <button
                    onClick={handleVerifyOTP}
                    className="w-full bg-gradient-to-r from-[#00A84D] to-[#006A33] py-3 rounded-xl font-bold active:scale-95 transition-transform text-white"
                  >
                    Verifier
                  </button>
                </motion.div>
              )}

              {phoneState === "verified" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-16 h-16 bg-[#00A84D] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,168,77,0.5)]">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 font-bold text-[#00A84D]">Numero securise</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 2: DOCUMENT */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-3xl shadow-xl"
            >
              <div className="w-12 h-12 bg-[#B8923B]/20 border border-[#B8923B] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#B8923B]" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-3.873 8.703a4.126 4.126 0 017.746 0 .75.75 0 01-.351.92 7.47 7.47 0 01-3.522.877 7.47 7.47 0 01-3.522-.877.75.75 0 01-.351-.92zM15 8.25a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H15zM14.25 12a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H15a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3.75a.75.75 0 000-1.5H15z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Piece d&apos;identite officielle</h2>
              <p className="text-sm text-dz-fg-muted mb-6">
                Passeport, permis de conduire ou carte nationale.
              </p>

              {docState === "select" && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleScanDocument("passport")}
                    className="w-full p-4 border border-dz-border-subtle bg-dz-bg rounded-xl flex items-center justify-between hover:border-[#00A84D] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-dz-fg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                      </svg>
                      <span className="font-bold text-dz-fg">Passeport</span>
                    </div>
                    <svg className="w-5 h-5 text-dz-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleScanDocument("national_id")}
                    className="w-full p-4 border border-dz-border-subtle bg-dz-bg rounded-xl flex items-center justify-between hover:border-[#00A84D] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-dz-fg" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-3.873 8.703a4.126 4.126 0 017.746 0 .75.75 0 01-.351.92 7.47 7.47 0 01-3.522.877 7.47 7.47 0 01-3.522-.877.75.75 0 01-.351-.92z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-bold text-dz-fg">Carte d&apos;identite</span>
                    </div>
                    <svg className="w-5 h-5 text-dz-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              )}

              {docState === "scanning" && (
                <div className="relative w-full h-48 bg-dz-bg rounded-xl border-2 border-dashed border-dz-border-subtle overflow-hidden flex items-center justify-center">
                  <div className="w-3/4 h-3/4 rounded-lg border border-white/10 bg-white/5 relative">
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                      className="absolute left-0 right-0 h-1 bg-[#00A84D] shadow-[0_0_15px_#00A84D]"
                    />
                  </div>
                  <p className="absolute bottom-4 text-xs font-bold text-[#00A84D] animate-pulse">
                    Extraction OCR en cours...
                  </p>
                </div>
              )}

              {docState === "done" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-16 h-16 bg-[#00A84D] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,168,77,0.5)]">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 font-bold text-[#00A84D]">Document valide</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: BIOMETRIC LIVENESS */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-3xl shadow-xl flex flex-col items-center text-center"
            >
              <h2 className="text-xl font-bold mb-2">Verification du visage</h2>
              <p className="text-sm text-dz-fg-muted mb-8">
                Nous devons nous assurer que c&apos;est bien vous.
              </p>

              <div className="relative w-48 h-48 rounded-full border-4 border-dz-border-subtle overflow-hidden mb-8 flex items-center justify-center bg-dz-bg">
                {bioState === "idle" && (
                  <svg className="w-20 h-20 text-dz-fg-muted opacity-50" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {bioState === "scanning" && (
                  <>
                    <svg className="w-20 h-20 text-dz-fg-muted opacity-80" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-4 border-t-[#00A84D] border-r-transparent border-b-transparent border-l-transparent"
                    />
                  </>
                )}
                {bioState === "done" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-[#00A84D] flex items-center justify-center"
                  >
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>

              {bioState === "idle" && (
                <button
                  onClick={handleBioScan}
                  className="w-full bg-gradient-to-r from-[#00A84D] to-[#006A33] py-4 rounded-xl font-bold active:scale-95 transition-transform text-white"
                >
                  Demarrer la camera
                </button>
              )}
              {bioState === "scanning" && (
                <p className="text-[#00A84D] font-bold animate-pulse">Analyse biometrique...</p>
              )}
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              className="bg-dz-card border border-[#00A84D]/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(0,168,77,0.15)] flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-[#00A84D] to-[#006A33] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,168,77,0.4)] mb-6"
              >
                <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-serif font-bold mb-2">Compte Securise</h2>
              <p className="text-dz-fg-muted mb-4">
                Votre identite a ete verifiee avec succes.
              </p>
              <div className="bg-[#00A84D]/10 border border-[#00A84D]/20 rounded-xl px-4 py-3 mb-8 w-full">
                <p className="text-sm font-semibold text-[#00A84D]">
                  Niveau: Verifie — Limite: {kyc.monthlyLimitCAD.toLocaleString("fr-CA")} CAD/mois
                </p>
              </div>
              <button
                onClick={handleGoToDashboard}
                className="w-full bg-gradient-to-r from-[#00A84D] to-[#006A33] py-4 rounded-xl font-bold active:scale-95 transition-transform text-white"
              >
                Aller au tableau de bord
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
