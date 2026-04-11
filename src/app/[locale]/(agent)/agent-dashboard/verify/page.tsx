"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ---------- Types ----------
type VerifyStep = "select_id" | "capture_id" | "input_details" | "verified";

interface ExpectedRecipient {
  name: string;
  amount: string;
  reference: string;
}

// ---------- Mock (TODO: fetch from transfer reference) ----------
const EXPECTED_RECIPIENT: ExpectedRecipient = {
  name: "Sarah Benali",
  amount: "248,750 DZD",
  reference: "DZ-B4N9-5V2C",
};

const ID_TYPES = [
  {
    id: "passport",
    label: "Passeport",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: "national_id",
    label: "Carte d\u2019Identite (CNI)",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
      </svg>
    ),
  },
  {
    id: "driving_license",
    label: "Permis de conduire",
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H21M3.375 14.25V5.625m0 0A1.125 1.125 0 0 1 4.5 4.5h9.038a1.125 1.125 0 0 1 .768.303l4.462 4.2a1.125 1.125 0 0 1 .357.822V14.25m0 0h-4.5" />
      </svg>
    ),
  },
];

// ---------- Animations ----------
const slideVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

// ---------- Page ----------
export default function AgentIDVerificationPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const [step, setStep] = useState<VerifyStep>("select_id");
  const [idType, setIdType] = useState("");
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = (pattern: number[] = [20]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleIdSelection = (label: string) => {
    setIdType(label);
    setStep("capture_id");
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      // TODO: real OCR extraction via API
      setTimeout(() => {
        setIdPhoto(URL.createObjectURL(file));
        setIsScanning(false);
        setStep("input_details");
        triggerHaptic([20, 30, 20]);
      }, 2500);
    }
  };

  const handleFinalVerification = () => {
    setStep("verified");
    triggerHaptic([15, 50, 20]);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      {/* Hidden file input for tablet camera */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <div className="w-full max-w-2xl bg-dz-card border border-dz-gold/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans text-dz-fg">
        {/* Secure header */}
        <div className="bg-dz-gold/10 p-6 border-b border-dz-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-dz-fg mb-1">
              Verification d&apos;Identite (AML)
            </h2>
            <p className="text-xs text-dz-fg-muted">
              Ref:{" "}
              <span className="font-mono text-dz-fg">{EXPECTED_RECIPIENT.reference}</span>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm font-bold text-dz-fg-muted mb-1">Beneficiaire attendu</p>
            <h3 className="text-2xl font-bold text-dz-gold">{EXPECTED_RECIPIENT.name}</h3>
          </div>
        </div>

        <div className="p-8 min-h-[400px] relative">
          <AnimatePresence mode="wait">
            {/* ---- STEP 1: Select document type ---- */}
            {step === "select_id" && (
              <motion.div key="select" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col">
                <h4 className="text-sm font-bold text-dz-fg-muted uppercase mb-6 text-center tracking-widest">
                  Que presente le client ?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ID_TYPES.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleIdSelection(doc.label)}
                      className="flex flex-col items-center justify-center p-6 bg-dz-bg border border-dz-border-subtle rounded-2xl hover:border-dz-gold hover:bg-dz-gold/5 transition-all group"
                    >
                      <div className="text-dz-fg-muted group-hover:text-dz-gold group-hover:scale-110 transition-all mb-4">
                        {doc.icon}
                      </div>
                      <span className="font-bold text-sm text-dz-fg group-hover:text-dz-gold transition-colors">
                        {doc.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ---- STEP 2: Capture document photo ---- */}
            {step === "capture_id" && (
              <motion.div key="capture" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-6">
                  <button
                    onClick={() => setStep("select_id")}
                    className="text-dz-fg-muted hover:text-dz-fg text-sm font-bold flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Retour
                  </button>
                  <h4 className="text-sm font-bold text-dz-fg uppercase">{idType}</h4>
                  <div className="w-16" />
                </div>

                <div
                  onClick={!isScanning ? handleCaptureClick : undefined}
                  className="w-full max-w-md h-56 bg-dz-bg rounded-2xl border-2 border-dashed border-dz-gold/30 hover:border-dz-gold transition-colors overflow-hidden flex flex-col items-center justify-center cursor-pointer relative group"
                >
                  {isScanning ? (
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-4 border-white/10 border-t-dz-gold rounded-full mb-4"
                      />
                      <p className="text-dz-gold font-bold text-sm animate-pulse">
                        Extraction des donnees (OCR)...
                      </p>
                    </div>
                  ) : (
                    <>
                      <svg className="w-12 h-12 text-dz-fg-muted/50 group-hover:text-dz-gold mb-3 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                      </svg>
                      <span className="font-bold text-dz-gold">
                        Prendre en photo le document
                      </span>
                      <p className="text-xs text-dz-fg-muted mt-2">
                        La photo sera archivee cryptee pour l&apos;audit.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ---- STEP 3: Verify details against expected recipient ---- */}
            {step === "input_details" && (
              <motion.div key="input" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Scanned photo preview */}
                  <div className="md:w-1/3">
                    <p className="text-xs font-bold text-dz-fg-muted uppercase mb-2">
                      Apercu du scan
                    </p>
                    <div className="w-full aspect-[3/2] bg-dz-bg rounded-xl border border-dz-border-subtle overflow-hidden relative">
                      {idPhoto && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={idPhoto}
                          alt="Document scanne"
                          className="w-full h-full object-cover opacity-80"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                        <span className="text-[10px] text-dz-green font-mono flex items-center gap-1">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          Scan OCR Reussi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agent verification form */}
                  <div className="flex-1 space-y-4">
                    <div className="bg-dz-gold/10 border border-dz-gold/30 p-3 rounded-lg flex items-start gap-3">
                      <svg className="w-5 h-5 text-dz-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      <p className="text-xs text-dz-gold leading-tight">
                        Verifiez attentivement que le nom sur la piece d&apos;identite
                        correspond <strong>exactement</strong> au beneficiaire prevu.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-dz-fg-muted uppercase">
                        Nom lu sur la piece d&apos;identite
                      </label>
                      <input
                        type="text"
                        defaultValue={EXPECTED_RECIPIENT.name}
                        className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 mt-1 outline-none focus:border-dz-gold transition-colors font-bold text-dz-fg"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-dz-fg-muted uppercase">
                          Numero du document
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 109384729"
                          className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 mt-1 outline-none focus:border-dz-gold transition-colors font-mono uppercase text-dz-fg placeholder:text-dz-fg-muted/50"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-dz-fg-muted uppercase">
                          Date d&apos;expiration
                        </label>
                        <input
                          type="date"
                          className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 mt-1 outline-none focus:border-dz-gold transition-colors text-dz-fg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dz-border-subtle flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => setStep("capture_id")}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-dz-border-subtle rounded-xl font-bold transition-colors text-dz-fg"
                  >
                    Reprendre la photo
                  </button>
                  <button
                    onClick={handleFinalVerification}
                    className="px-8 py-3 bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-bg rounded-xl font-bold hover:shadow-[0_0_20px_rgba(184,146,59,0.4)] transition-all active:scale-95"
                  >
                    Valider l&apos;identite
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 4: Verified ---- */}
            {step === "verified" && (
              <motion.div
                key="verified"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-dz-green to-emerald-800 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,168,77,0.4)] mb-4"
                >
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-serif font-bold text-dz-fg mb-2">
                  Identite Confirmee
                </h2>
                <p className="text-dz-fg-muted mb-8 text-sm">
                  Le document a ete archive. Vous etes protege en cas d&apos;audit.
                </p>

                <button
                  onClick={() => router.push(`/${loc}/agent-dashboard`)}
                  className="w-full max-w-sm py-4 bg-gradient-to-r from-dz-green to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                  Remettre {EXPECTED_RECIPIENT.amount}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
