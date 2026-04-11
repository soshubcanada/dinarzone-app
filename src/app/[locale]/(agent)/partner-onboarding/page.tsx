"use client";

import { useState, useRef, Fragment } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Animation ----------
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ---------- Types ----------
interface FormState {
  businessName: string;
  registrationNumber: string;
  address: string;
  storePhoto: string | null;
  amlAccepted: boolean;
  commissionAccepted: boolean;
}

const INITIAL_FORM: FormState = {
  businessName: "",
  registrationNumber: "",
  address: "",
  storePhoto: null,
  amlAccepted: false,
  commissionAccepted: false,
};

// ---------- Step indicators ----------
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full max-w-md flex items-center justify-between mb-10 px-4">
      {[1, 2, 3].map((i) => (
        <Fragment key={i}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= i
                ? "bg-dz-gold text-dz-bg shadow-[0_0_15px_rgba(184,146,59,0.4)]"
                : "bg-white/10 text-dz-fg-muted"
            }`}
          >
            {step > i ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              i
            )}
          </div>
          {i < 3 && (
            <div className={`flex-1 h-[2px] mx-2 transition-colors ${step > i ? "bg-dz-gold" : "bg-white/10"}`} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ---------- Page ----------
export default function PartnerOnboardingPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  };

  const nextStep = () => {
    triggerHaptic();
    setStep((s) => s + 1);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // TODO: upload to Supabase Storage
      setTimeout(() => {
        setForm((f) => ({ ...f, storePhoto: URL.createObjectURL(file) }));
        setIsUploading(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-dz-bg flex flex-col items-center pt-12 px-4 pb-20 font-sans text-dz-fg">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dz-gold to-[#9A7A31] flex items-center justify-center text-dz-bg font-black text-xl shadow-[0_0_20px_rgba(184,146,59,0.3)]">
            DZ
          </div>
        </div>
        <h1 className="text-2xl font-serif font-bold text-center mb-2">Partenaire DinarZone</h1>
        <p className="text-dz-gold text-center text-sm font-bold uppercase tracking-widest">
          Portail Agent Officiel
        </p>
      </div>

      {/* Progress */}
      {step < 4 && <ProgressBar step={step} />}

      {/* Steps */}
      <div className="w-full max-w-md relative overflow-hidden min-h-[450px]">
        <AnimatePresence mode="wait">
          {/* Step 1: Business Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-3xl shadow-xl"
            >
              <h2 className="text-xl font-bold mb-6 text-dz-fg">Informations de l&apos;entreprise</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-dz-fg-muted uppercase">
                    Nom de l&apos;enseigne
                  </label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    placeholder="Ex: Superette El Baraka"
                    className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 mt-1 outline-none focus:border-dz-gold transition-colors text-dz-fg placeholder:text-dz-fg-muted/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-dz-fg-muted uppercase">
                    Numero de Registre (RC / NIF)
                  </label>
                  <input
                    type="text"
                    value={form.registrationNumber}
                    onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                    placeholder="Ex: 123456789"
                    className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 mt-1 outline-none focus:border-dz-gold transition-colors font-mono text-dz-fg placeholder:text-dz-fg-muted/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-dz-fg-muted uppercase">
                    Adresse complete du local
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Numero, rue, ville..."
                    className="w-full bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 mt-1 outline-none focus:border-dz-gold transition-colors resize-none text-dz-fg placeholder:text-dz-fg-muted/50"
                  />
                </div>

                <button
                  onClick={nextStep}
                  disabled={!form.businessName || !form.registrationNumber || !form.address}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all mt-2 ${
                    form.businessName && form.registrationNumber && form.address
                      ? "bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-bg active:scale-95"
                      : "bg-white/5 text-dz-fg-muted cursor-not-allowed"
                  }`}
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Storefront Photo */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-3xl shadow-xl"
            >
              <h2 className="text-xl font-bold mb-2">Devanture du magasin</h2>
              <p className="text-sm text-dz-fg-muted mb-6">
                Ajoutez une photo claire de votre vitrine pour rassurer les clients.
              </p>

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="w-full h-48 bg-dz-bg rounded-xl border-2 border-dashed border-dz-border-subtle hover:border-dz-gold transition-colors overflow-hidden flex flex-col items-center justify-center cursor-pointer relative group"
              >
                {form.storePhoto ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.storePhoto} alt="Devanture" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-bold text-white">Changer la photo</span>
                    </div>
                  </>
                ) : isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-white/20 border-t-dz-gold rounded-full"
                  />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-dz-gold mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                    <span className="text-sm font-bold text-dz-gold">Prendre une photo</span>
                  </>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-dz-border-subtle">
                <svg className="w-6 h-6 text-dz-fg-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-dz-fg">Horaires d&apos;ouverture</p>
                  <p className="text-[10px] text-dz-fg-muted">Sera affiche sur la carte DinarZone</p>
                </div>
                <button className="ml-auto text-xs font-bold text-dz-gold">Configurer</button>
              </div>

              <button
                onClick={nextStep}
                disabled={!form.storePhoto}
                className={`w-full py-3.5 rounded-xl font-bold transition-all mt-6 ${
                  form.storePhoto
                    ? "bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-bg active:scale-95"
                    : "bg-white/5 text-dz-fg-muted cursor-not-allowed"
                }`}
              >
                Continuer
              </button>
            </motion.div>
          )}

          {/* Step 3: AML & Commission Agreement */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-3xl shadow-xl"
            >
              <div className="w-12 h-12 bg-dz-gold/20 border border-dz-gold rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-dz-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Engagement Partenaire</h2>
              <p className="text-sm text-dz-fg-muted mb-6">
                Veuillez lire et accepter les conditions d&apos;operation DinarZone.
              </p>

              <div className="space-y-3 mb-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.amlAccepted}
                    onChange={(e) => setForm((f) => ({ ...f, amlAccepted: e.target.checked }))}
                    className="mt-1 w-4 h-4 accent-[#B8923B] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-dz-fg-muted group-hover:text-dz-fg transition-colors">
                    J&apos;accepte la charte de conformite AML (Anti-Blanchiment) et m&apos;engage a verifier
                    l&apos;identite des clients pour les retraits en especes.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.commissionAccepted}
                    onChange={(e) => setForm((f) => ({ ...f, commissionAccepted: e.target.checked }))}
                    className="mt-1 w-4 h-4 accent-[#B8923B] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-dz-fg-muted group-hover:text-dz-fg transition-colors">
                    J&apos;accepte la grille de commission standard DinarZone (1.5% par transaction traitee).
                  </span>
                </label>
              </div>

              <button
                onClick={nextStep}
                disabled={!form.amlAccepted || !form.commissionAccepted}
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                  form.amlAccepted && form.commissionAccepted
                    ? "bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-bg active:scale-95"
                    : "bg-white/5 text-dz-fg-muted cursor-not-allowed"
                }`}
              >
                Soumettre la candidature
              </button>
            </motion.div>
          )}

          {/* Step 4: Success — Pending Approval */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              className="bg-dz-card border border-dz-gold/30 p-8 rounded-3xl shadow-[0_0_30px_rgba(184,146,59,0.15)] flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-dz-gold to-[#9A7A31] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(184,146,59,0.4)] mb-6"
              >
                <svg className="w-12 h-12 text-dz-bg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-serif font-bold mb-2">Dossier en revision</h2>
              <p className="text-dz-fg-muted mb-6 text-sm">
                Votre candidature a ete transmise a notre equipe des operations. Nous verifierons votre
                registre de commerce sous 24 a 48 heures.
              </p>

              <div className="w-full bg-dz-bg border border-dz-border-subtle p-4 rounded-xl mb-6">
                <p className="text-xs font-bold text-dz-fg mb-1">Prochaine etape :</p>
                <p className="text-xs text-dz-fg-muted">
                  Vous recevrez un kit de formation (PLV, autocollants vitrine) une fois valide.
                </p>
              </div>

              <button
                onClick={() => router.push(`/${loc}/dashboard`)}
                className="w-full bg-white/5 border border-dz-border-subtle hover:bg-white/10 py-3.5 rounded-xl font-bold transition-colors text-dz-fg"
              >
                Retour a l&apos;accueil
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
