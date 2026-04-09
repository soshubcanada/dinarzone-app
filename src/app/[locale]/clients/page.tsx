"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/components/ui/FlagIcon";

// ---------- Business rules ----------
// Algeria has two FX markets: official (Bank of Algeria) and parallel ("Le Square").
// DinarZone positions the official rate as the default (compliance-first),
// while the parallel market is unlocked via a discreet "P2P community" mode —
// legally framed as a peer-to-peer matching platform between independent agents.
const OFFICIAL_RATE = 100.5;               // Banque Centrale d'Algerie
const PARALLEL_MARKET_RATE_RAW = 210.0;    // Marche parallele "Le Square"
const P2P_PLATFORM_FEE = 0.015;            // 1.5% platform margin folded into the P2P rate
const P2P_RATE = PARALLEL_MARKET_RATE_RAW * (1 - P2P_PLATFORM_FEE); // ≈ 206.85
const FIXED_FEE = 2.5;                     // CAD fixed processing fee

// Hero background image (served locally to avoid CSP/ORB issues)
const HERO_IMAGE_URL = "/clients/hero-bg.jpg";

// ---------- SVG Icons ----------
function BoltIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function ShieldIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 5.25-4.5 9.75-9 9.75S3 17.25 3 12V5.25l9-3 9 3V12z" />
    </svg>
  );
}
function CoinIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.25 0-4.5 1.5-4.5 3.75M12 6c2.485 0 4.5 1.007 4.5 2.25S14.485 10.5 12 10.5 7.5 9.493 7.5 8.25 9.515 6 12 6zm0 0V3m0 18v-3m9-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}
function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
function PhoneIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}
function MinusSmallIcon({ className = "w-2.5 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}
function MultiplySmallIcon({ className = "w-2.5 h-2.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function BankIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
    </svg>
  );
}
function UsersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

// ---------- Page ----------
export default function ClientsLandingPage() {
  const { locale } = useParams<{ locale: string }>();
  const loc = (locale as string) || "fr";

  const [sendAmount, setSendAmount] = useState<string>("1000");
  const [isP2PMode, setIsP2PMode] = useState<boolean>(false);

  const amountToConvert = useMemo(() => parseFloat(sendAmount) || 0, [sendAmount]);
  const currentRate = isP2PMode ? P2P_RATE : OFFICIAL_RATE;
  const receiveAmount = useMemo(
    () =>
      (amountToConvert * currentRate).toLocaleString("fr-DZ", {
        maximumFractionDigits: 0,
      }),
    [amountToConvert, currentRate]
  );

  return (
    <div className="min-h-screen bg-[#070B14] font-sans text-white selection:bg-[#00A84D]/30 overflow-x-hidden">
      {/* ---- NAV ---- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#070B14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={`/${loc}/clients`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A84D] to-[#004D26] flex items-center justify-center text-white font-black text-xs shadow-lg">
              DZ
            </div>
            <span className="font-serif font-bold text-xl tracking-widest">DinarZone</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#7B8DB5]">
            <a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#securite" className="hover:text-white transition-colors">Sécurité</a>
            <a href="#agents" className="hover:text-white transition-colors">Devenir Agent</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href={`/${loc}/login`} className="hidden md:block text-sm font-bold text-white hover:text-[#00A84D] transition-colors">
              Se connecter
            </Link>
            <Link
              href={`/${loc}/register`}
              className="px-6 py-2.5 bg-white text-[#070B14] rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- HERO with background image ---- */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
        {/* 1. Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        />
        {/* 2. Dark gradient overlay (left → right, dark for text readability) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#070B14] via-[#070B14]/80 to-[#070B14]/20" />

        {/* 3. Content */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-20 w-full">
          {/* Left: Headline */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#00A84D] mb-6 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#00A84D] animate-pulse" />
              Nouveau corridor Canada
              <ArrowRightIcon className="w-3 h-3" />
              Algérie
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6">
              L&apos;argent au pays,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A84D] to-[#42E88F]">
                sans compromis.
              </span>
            </h1>
            <p className="text-lg text-[#F0F4FA] mb-8 max-w-lg leading-relaxed">
              Transférez vos fonds vers le Maghreb en quelques secondes. Taux de change premium,
              livraison BaridiMob instantanée, zéro frais cachés.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${loc}/register`}
                className="group px-8 py-4 bg-gradient-to-r from-[#00A84D] to-[#006A33] rounded-xl font-bold text-lg shadow-[0_10px_30px_rgba(0,168,77,0.3)] hover:shadow-[0_10px_40px_rgba(0,168,77,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Commencer maintenant</span>
                <ArrowRightIcon className="w-5 h-5 relative z-10" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button
                type="button"
                className="px-8 py-4 bg-[#0F1523]/80 backdrop-blur-sm border border-white/10 hover:bg-white/5 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                Télécharger l&apos;App
                <PhoneIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Right: Discreet P2P calculator (compliance-first, premium unlocked via community mode) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-md mx-auto lg:ml-auto"
          >
            {/* Subtle halo — goes gold only when P2P mode is unlocked */}
            <div
              className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ${
                isP2PMode
                  ? "bg-gradient-to-br from-[#B8923B]/25 via-[#00A84D]/10 to-transparent"
                  : "bg-white/5"
              }`}
            />

            <div
              className={`relative bg-[#0F1523]/90 backdrop-blur-2xl border p-6 rounded-3xl overflow-hidden transition-all duration-500 ${
                isP2PMode
                  ? "border-[#B8923B]/40 shadow-[0_0_40px_rgba(184,146,59,0.15)]"
                  : "border-white/10 shadow-xl"
              }`}
            >
              {/* Ambient gold corner glow — only in P2P mode */}
              {isP2PMode && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B8923B] rounded-full blur-[80px] opacity-20 pointer-events-none" />
              )}

              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider relative">
                Calculateur de transfert
              </h3>

              {/* Input : Vous envoyez */}
              <div
                className={`bg-[#070B14] border rounded-2xl p-4 mb-2 transition-colors relative z-10 ${
                  isP2PMode
                    ? "border-white/10 focus-within:border-[#B8923B]"
                    : "border-white/10 focus-within:border-[#00A84D]"
                }`}
              >
                <label htmlFor="send-amount" className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Vous envoyez
                </label>
                <div className="flex items-center">
                  <input
                    id="send-amount"
                    type="number"
                    inputMode="decimal"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-3xl font-bold text-white outline-none tabular-nums"
                  />
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                    <FlagIcon countryCode="CA" size="sm" />
                    <span className="font-bold text-sm">CAD</span>
                  </div>
                </div>
              </div>

              {/* Rate breakdown line with connector */}
              <div className="pl-6 py-4 relative z-10">
                <div className="absolute left-[22px] top-0 bottom-0 w-px bg-white/10" />

                {/* Frais de traitement */}
                <div className="flex items-center justify-between text-sm mb-3 relative">
                  <div className="absolute -left-5 w-4 h-4 bg-[#0F1523] border border-white/10 rounded-full flex items-center justify-center text-white/60">
                    <MinusSmallIcon className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[#7B8DB5]">Frais de traitement</span>
                  <span className="font-bold text-white tabular-nums">
                    {FIXED_FEE.toFixed(2)} CAD
                  </span>
                </div>

                {/* Taux applique (dynamic label + color) */}
                <div className="flex items-center justify-between text-sm relative">
                  <div
                    className={`absolute -left-5 w-4 h-4 bg-[#0F1523] border rounded-full flex items-center justify-center transition-colors ${
                      isP2PMode
                        ? "border-[#B8923B] text-[#B8923B]"
                        : "border-[#00A84D] text-[#00A84D]"
                    }`}
                  >
                    <MultiplySmallIcon className="w-2.5 h-2.5" />
                  </div>

                  <span
                    className={`font-bold transition-colors ${
                      isP2PMode ? "text-[#B8923B]" : "text-[#00A84D]"
                    }`}
                  >
                    {isP2PMode ? "Taux P2P (Communauté)" : "Taux Standard (Garanti)"}
                  </span>
                  <span className="font-bold text-white font-mono tabular-nums">
                    1 CAD = {currentRate.toFixed(2)} DZD
                  </span>
                </div>
              </div>

              {/* Output : Le beneficiaire recoit */}
              <div
                className={`bg-[#070B14] border rounded-2xl p-4 mt-2 transition-all duration-500 relative z-10 ${
                  isP2PMode
                    ? "border-[#B8923B]/50 shadow-[0_0_20px_rgba(184,146,59,0.1)]"
                    : "border-white/10"
                }`}
              >
                <label className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Le bénéficiaire reçoit
                </label>
                <div className="flex items-center">
                  <motion.div
                    key={`${receiveAmount}-${isP2PMode ? "p2p" : "std"}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`w-full text-3xl font-bold tabular-nums truncate transition-colors ${
                      isP2PMode ? "text-[#B8923B]" : "text-[#00A84D]"
                    }`}
                  >
                    {receiveAmount}
                  </motion.div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0 ml-2">
                    <FlagIcon countryCode="DZ" size="sm" />
                    <span className="font-bold text-sm text-white">DZD</span>
                  </div>
                </div>
              </div>

              {/* Discreet P2P unlock toggle */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsP2PMode((m) => !m)}
                  aria-pressed={isP2PMode}
                  className="group flex items-center gap-2 text-xs font-bold text-[#7B8DB5] hover:text-white transition-colors py-2 px-4 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
                >
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                    {isP2PMode ? (
                      <BankIcon className="w-4 h-4" />
                    ) : (
                      <UsersIcon className="w-4 h-4" />
                    )}
                  </span>
                  {isP2PMode
                    ? "Retour au transfert bancaire standard"
                    : "Découvrir le transfert P2P (Taux de la communauté)"}
                </button>
              </div>

              {/* Compliance disclaimer — only visible in P2P mode */}
              <AnimatePresence>
                {isP2PMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-[#B8923B]/10 border border-[#B8923B]/20 rounded-xl p-3 overflow-hidden"
                  >
                    <p className="text-[10px] text-[#B8923B] leading-tight text-justify">
                      <strong>Mode P2P :</strong> Dans ce mode, DinarZone agit uniquement comme une
                      plateforme de mise en relation (matching). Le taux affiché reflète la moyenne
                      des offres de liquidité proposées par les agents indépendants de notre réseau
                      communautaire ce jour. La disponibilité des fonds dépend du réseau.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic CTA */}
              <Link
                href={`/${loc}/register`}
                className={`relative w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  isP2PMode
                    ? "bg-gradient-to-r from-[#B8923B] to-[#9A7A31] text-[#070B14] hover:shadow-[0_0_20px_rgba(184,146,59,0.4)]"
                    : "bg-white text-[#070B14] hover:bg-gray-200"
                }`}
              >
                Continuer
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ---- PARTNER LOGOS ---- */}
      <section id="securite" className="border-y border-white/5 bg-white/[0.02] py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-[#7B8DB5] uppercase tracking-widest mb-6">
            Sécurisé & Régulé par
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="text-xl font-serif font-bold">FINTRAC</div>
            <div className="text-xl font-bold tracking-tighter">stripe</div>
            <div className="text-xl font-bold">PCI DSS COMPLIANT</div>
            <div className="text-xl font-bold italic">BaridiMob</div>
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section id="comment-ca-marche" className="py-24 max-w-7xl mx-auto px-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
            La distance n&apos;est plus une barrière.
          </h2>
          <p className="text-[#7B8DB5] max-w-2xl mx-auto">
            Nous avons reconstruit l&apos;infrastructure financière de zéro pour vous offrir
            la meilleure expérience du marché.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <BoltIcon className="w-7 h-7" />,
              title: "Livraison Instantanée",
              desc: "Vos DZD sont disponibles sur le compte BaridiMob de votre proche en quelques secondes, 24/7.",
            },
            {
              icon: <ShieldIcon className="w-7 h-7" />,
              title: "Sécurité Bancaire",
              desc: "Vos fonds sont protégés par chiffrement AES-256 et sécurisés par authentification biométrique.",
            },
            {
              icon: <CoinIcon className="w-7 h-7" />,
              title: "Taux Imbattables",
              desc: "Nous contournons les banques traditionnelles pour vous offrir un taux de change au plus proche du marché réel.",
            },
          ].map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#0F1523] border border-white/5 hover:border-[#00A84D]/50 transition-colors p-8 rounded-3xl group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#00A84D] mb-6 group-hover:bg-[#00A84D]/20 transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-[#7B8DB5] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer id="agents" className="bg-[#0F1523] border-t border-white/5 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#00A84D] flex items-center justify-center text-[#070B14] font-black text-[10px]">
              DZ
            </div>
            <span className="font-serif font-bold tracking-widest">DinarZone</span>
          </div>
          <p className="text-[#7B8DB5] text-xs">
            &copy; {new Date().getFullYear()} DinarZone Inc. Opérant sous licence FINTRAC au Canada.
          </p>
        </div>
      </footer>
    </div>
  );
}
