"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import FlagIcon from "@/components/ui/FlagIcon";

// ---------- Business rules ----------
// Algeria has two FX markets: official (Bank of Algeria) and parallel ("Le Square").
// DinarZone's edge is delivering the parallel market rate via a local POS agent network,
// while the official rate is served via traditional bank wire.
const OFFICIAL_MARKET_RATE = 100.5;   // Banque Centrale d'Algerie
const PARALLEL_MARKET_RATE = 210.0;   // Marche parallele "Le Square"
const DINARZONE_MARGIN = 0.015;       // 1.5% margin kept on parallel rate
const FIXED_FEE = 2.5;                // CAD fixed processing fee

// Final rates displayed to customers
const FINAL_OFFICIAL_RATE = OFFICIAL_MARKET_RATE;
const FINAL_PREMIUM_RATE = PARALLEL_MARKET_RATE * (1 - DINARZONE_MARGIN); // ≈ 206.85

// Hero background image (served locally to avoid CSP/ORB issues)
const HERO_IMAGE_URL = "/clients/hero-bg.jpg";

type RateChoice = "premium" | "official";

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
function FlameIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 0s1.13 3.29.88 5.78c-.27 2.67-2.13 4.93-4.13 6.84C8.22 14.56 6 16.5 6 19.5 6 22.53 8.47 25 11.5 25s5.5-2.47 5.5-5.5c0-1.78-.87-3.34-2.19-4.48C13.12 14.11 12 12 12 12s-2.19 2.56-3.25 4.5C8.05 17.35 7.5 18.32 7.5 19.5c0-1.5 1-3 2.5-4.5.58-.58 1.5-1 1.5-2 0-.67-.5-1.5-.5-2.5C11 8 13.5 6 13.5 0z" />
    </svg>
  );
}

// ---------- Page ----------
export default function ClientsLandingPage() {
  const { locale } = useParams<{ locale: string }>();
  const loc = (locale as string) || "fr";

  const [sendAmount, setSendAmount] = useState<string>("1000");
  const [selectedRate, setSelectedRate] = useState<RateChoice>("premium");

  const amountToConvert = useMemo(() => parseFloat(sendAmount) || 0, [sendAmount]);

  const receiveOfficial = useMemo(
    () =>
      (amountToConvert * FINAL_OFFICIAL_RATE).toLocaleString("fr-DZ", {
        maximumFractionDigits: 0,
      }),
    [amountToConvert]
  );

  const receivePremium = useMemo(
    () =>
      (amountToConvert * FINAL_PREMIUM_RATE).toLocaleString("fr-DZ", {
        maximumFractionDigits: 0,
      }),
    [amountToConvert]
  );

  // Savings vs official (shown as highlight on premium card)
  const savingsMultiplier = useMemo(
    () => (FINAL_PREMIUM_RATE / FINAL_OFFICIAL_RATE).toFixed(2),
    []
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

          {/* Right: Dual-rate calculator widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-md mx-auto lg:ml-auto"
          >
            {/* Outer gold halo (hints at premium parallel rate) */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#B8923B]/25 via-[#00A84D]/10 to-transparent rounded-3xl blur-2xl" />

            <div className="relative bg-[#0F1523]/90 backdrop-blur-2xl border border-[#B8923B]/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(184,146,59,0.15)] overflow-hidden">
              {/* Ambient gold glow in corner */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B8923B] rounded-full blur-[80px] opacity-20 pointer-events-none" />

              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider relative">
                Comparez &amp; Choisissez
              </h3>

              {/* Send input */}
              <div className="bg-[#070B14] border border-white/10 rounded-2xl p-4 mb-6 focus-within:border-[#B8923B] transition-colors relative">
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

              {/* Strategic choice: two offers */}
              <div className="space-y-4 mb-6 relative">
                {/* OFFER 1: Premium rate (Local/Parallel market) — highlighted */}
                <button
                  type="button"
                  onClick={() => setSelectedRate("premium")}
                  aria-pressed={selectedRate === "premium"}
                  className={`relative w-full text-left cursor-pointer rounded-2xl p-1 transition-all ${
                    selectedRate === "premium"
                      ? "bg-gradient-to-r from-[#B8923B] to-[#9A7A31] shadow-lg scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* "Best choice" badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A84D] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap z-10 flex items-center gap-1">
                    <FlameIcon className="w-3 h-3" />
                    Taux Marché Local
                  </div>

                  <div
                    className={`rounded-xl p-4 flex flex-col ${
                      selectedRate === "premium" ? "bg-[#070B14]" : "bg-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-sm font-bold ${
                          selectedRate === "premium" ? "text-[#B8923B]" : "text-white"
                        }`}
                      >
                        Réseau Premium DinarZone
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedRate === "premium" ? "border-[#B8923B]" : "border-white/30"
                        }`}
                      >
                        {selectedRate === "premium" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#B8923B]" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#7B8DB5] mb-3">
                      Retrait en espèces via agents agréés.
                    </p>

                    <div className="flex justify-between items-end gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#7B8DB5] uppercase">Taux appliqué</p>
                        <p className="font-mono text-sm text-white truncate">
                          1 CAD = {FINAL_PREMIUM_RATE.toFixed(2)} DZD
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-[#00A84D] font-bold uppercase mb-0.5">
                          Le bénéficiaire reçoit
                        </p>
                        <p className="text-2xl font-bold text-[#00A84D] tabular-nums">
                          {receivePremium}
                          <span className="text-xs text-[#00A84D]/80 ml-1">DZD</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* OFFER 2: Official rate (Bank wire) */}
                <button
                  type="button"
                  onClick={() => setSelectedRate("official")}
                  aria-pressed={selectedRate === "official"}
                  className={`relative w-full text-left cursor-pointer rounded-2xl border transition-all ${
                    selectedRate === "official"
                      ? "border-white bg-white/5 scale-[1.02]"
                      : "border-white/10 bg-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="p-4 flex flex-col opacity-90">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-white">
                        Virement Bancaire Officiel
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedRate === "official" ? "border-white" : "border-white/30"
                        }`}
                      >
                        {selectedRate === "official" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#7B8DB5] mb-3">
                      Taux de la Banque Centrale d&apos;Algérie.
                    </p>

                    <div className="flex justify-between items-end gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#7B8DB5] uppercase">Taux appliqué</p>
                        <p className="font-mono text-sm text-[#7B8DB5] truncate">
                          1 CAD = {FINAL_OFFICIAL_RATE.toFixed(2)} DZD
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-white tabular-nums">
                          {receiveOfficial}
                          <span className="text-xs text-white/70 ml-1">DZD</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Shared fixed fees summary */}
              <div className="flex justify-between items-center text-xs text-[#7B8DB5] px-2 mb-4 relative">
                <span>Frais de traitement DinarZone</span>
                <span className="font-bold text-white tabular-nums">
                  {FIXED_FEE.toFixed(2)} CAD
                </span>
              </div>

              {/* Savings callout (only when premium is selected) */}
              {selectedRate === "premium" && (
                <div className="flex justify-between items-center text-xs px-2 mb-4 relative">
                  <span className="text-[#00A84D] font-bold uppercase tracking-wider">
                    Gain vs. officiel
                  </span>
                  <span className="font-bold text-[#00A84D] tabular-nums">
                    ×{savingsMultiplier}
                  </span>
                </div>
              )}

              {/* Dynamic CTA */}
              <Link
                href={`/${loc}/register`}
                className={`relative w-full mt-2 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  selectedRate === "premium"
                    ? "bg-gradient-to-r from-[#B8923B] to-[#9A7A31] text-[#070B14] hover:shadow-[0_0_20px_rgba(184,146,59,0.4)]"
                    : "bg-white text-[#070B14] hover:bg-gray-200"
                }`}
              >
                Continuer avec {selectedRate === "premium" ? "le Taux Local" : "le Taux Officiel"}
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
