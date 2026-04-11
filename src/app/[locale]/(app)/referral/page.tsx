"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Mock user data (TODO: fetch from API) ----------
const MOCK_USER = {
  firstName: "Nabila",
  referralCode: "NABILA-DZ26",
  totalEarned: 30,
  friendsInvited: 3,
};

// ---------- Animations ----------
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ---------- Page ----------
export default function ReferralPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  const shareText = `Rejoins DinarZone avec mon code ${MOCK_USER.referralCode} et on gagne 10 CAD chacun !`;
  const shareUrl = `https://dinarzone.com/invite/${MOCK_USER.referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(20);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silent fail
    }
  };

  const handleShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: "DinarZone - Transfert d\u2019argent",
          text: `Je t\u2019invite sur DinarZone. Utilise mon code ${MOCK_USER.referralCode} pour ton premier transfert sans frais et on gagne 10 CAD chacun !`,
          url: shareUrl,
        });
      } catch {
        // Share cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-dz-bg text-dz-fg font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dz-bg/80 backdrop-blur-xl border-b border-dz-border-subtle pt-12 pb-4 px-6">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push(`/${loc}/dashboard`)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-dz-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-serif font-bold text-dz-fg">Inviter des amis</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* ---- HERO: Value proposition ---- */}
          <motion.div
            variants={itemVariants}
            className="relative w-full rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-[#0F1523] to-[#1A2235] border border-dz-green/30 shadow-[0_0_40px_rgba(0,168,77,0.1)] text-center"
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-dz-green rounded-full blur-[80px] opacity-20 pointer-events-none translate-x-1/2 -translate-y-1/2" />

            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-dz-green to-emerald-800 rounded-full flex items-center justify-center shadow-lg mb-6 relative z-10">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-dz-fg mb-2 relative z-10">
              Gagnez 10 CAD ensemble
            </h2>
            <p className="text-dz-fg-muted text-sm mb-8 relative z-10">
              Pour chaque ami qui s&apos;inscrit et envoie plus de 100 CAD,
              nous vous offrons 10 CAD a tous les deux.
            </p>

            {/* Referral code (click to copy) */}
            <div className="relative z-10">
              <p className="text-xs font-bold text-dz-green uppercase tracking-wider mb-2">
                Votre code unique
              </p>
              <button
                onClick={handleCopy}
                className="w-full relative overflow-hidden group bg-dz-bg border-2 border-dashed border-dz-green/50 hover:border-dz-green rounded-2xl py-4 flex items-center justify-center transition-all active:scale-[0.98]"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="copied"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="flex items-center gap-2 text-dz-green"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="font-bold">Copie dans le presse-papier</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="code"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-2xl font-mono font-bold text-dz-fg tracking-widest">
                        {MOCK_USER.referralCode}
                      </span>
                      <svg className="w-5 h-5 text-dz-fg-muted group-hover:text-dz-fg transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Native share button */}
            <button
              onClick={handleShare}
              className="w-full mt-4 bg-dz-green hover:brightness-110 text-white py-4 rounded-xl font-bold text-lg shadow-[0_10px_20px_rgba(0,168,77,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10"
            >
              Partager le lien
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </button>
          </motion.div>

          {/* ---- STATS (Gamification) ---- */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <div className="bg-dz-card border border-dz-border-subtle p-5 rounded-2xl">
              <p className="text-xs font-bold text-dz-fg-muted uppercase mb-1">Total Gagne</p>
              <h3 className="text-2xl font-bold text-dz-green tabular-nums">
                {MOCK_USER.totalEarned}.00 CAD
              </h3>
            </div>
            <div className="bg-dz-card border border-dz-border-subtle p-5 rounded-2xl">
              <p className="text-xs font-bold text-dz-fg-muted uppercase mb-1">Amis Parraines</p>
              <h3 className="text-2xl font-bold text-dz-fg tabular-nums">
                {MOCK_USER.friendsInvited}
              </h3>
            </div>
          </motion.div>

          {/* ---- HOW IT WORKS ---- */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xs font-bold text-dz-fg-muted uppercase tracking-wider mb-4 ml-2">
              Comment ca marche ?
            </h3>
            <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-6 space-y-6">
              {[
                {
                  step: "1",
                  title: "Partagez votre code",
                  desc: "Votre ami utilise votre lien ou entre votre code lors de son inscription.",
                },
                {
                  step: "2",
                  title: "Ils font un transfert",
                  desc: "Votre ami complete un premier transfert d\u2019au moins 100 CAD (ou equivalent).",
                },
                {
                  step: "3",
                  title: "Tout le monde y gagne",
                  desc: "Nous creditons 10 CAD sur votre solde DinarZone et sur celui de votre ami.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-dz-green/20 border border-dz-green flex items-center justify-center text-sm font-bold text-dz-green shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-dz-fg text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-dz-fg-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
