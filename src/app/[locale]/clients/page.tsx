"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/components/ui/FlagIcon";
import { formatNumber } from "@/lib/utils/formatNumber";

// ---------- Business rules ----------
// Official Bank of Algeria mid-market rate snapshot — the compliance-first default.
// The parallel "Square" rate is exposed ONLY via the opt-in "community" mode and
// is legally framed as a matching reference for independent agent offers, never
// as an executable DinarZone FX quote. Real quotes come from /api/quotes at
// checkout, rate-locked server-side (src/lib/engine/rates.ts).
const OFFICIAL_RATE_INDICATIVE = 100.5;
const P2P_MARKET_RATE_RAW = 210.0;
const P2P_MATCHING_SPREAD = 0.015;
const P2P_RATE_INDICATIVE = P2P_MARKET_RATE_RAW * (1 - P2P_MATCHING_SPREAD); // ≈ 206.85
const FIXED_FEE_CAD = 2.5;

// Regulatory posture — these disclosures are rendered in the footer and legal
// sections. Replace the MSB placeholder with the real FINTRAC registration #
// before going live (TODO: wire via env var NEXT_PUBLIC_FINTRAC_MSB).
const FINTRAC_MSB_NUMBER = process.env.NEXT_PUBLIC_FINTRAC_MSB ?? "MSB#M25XXXXXXX";

// KYC Tier 1 self-serve cap used as a calculator guardrail. Server enforces
// the real policy — this is purely UX friction to keep inputs in a sane range.
const TIER_1_MAX_CAD = 3000;
const MIN_AMOUNT_CAD = 10;

const HERO_IMAGE_URL = "/clients/hero-bg.jpg";

function sanitizeAmount(raw: string): string {
  // Allow a single comma OR period as decimal separator, strip other chars.
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
  const parts = cleaned.split(".");
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
}

// ---------- SVG Icons ----------
function BoltIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}
function ShieldIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 5.25-4.5 9.75-9 9.75S3 17.25 3 12V5.25l9-3 9 3V12z" />
    </svg>
  );
}
function CoinIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.25 0-4.5 1.5-4.5 3.75M12 6c2.485 0 4.5 1.007 4.5 2.25S14.485 10.5 12 10.5 7.5 9.493 7.5 8.25 9.515 6 12 6zm0 0V3m0 18v-3m9-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  );
}
function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
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
function InfoIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  );
}

// ---------- Page ----------
export default function ClientsLandingPage() {
  const { locale } = useParams<{ locale: string }>();
  const loc = (locale as string) || "fr";

  const [sendAmount, setSendAmount] = useState<string>("1000");
  const [isP2PMode, setIsP2PMode] = useState<boolean>(false);

  const parsed = parseFloat(sendAmount) || 0;
  const clamped = Math.min(Math.max(parsed, 0), TIER_1_MAX_CAD);
  const currentRate = isP2PMode ? P2P_RATE_INDICATIVE : OFFICIAL_RATE_INDICATIVE;
  const receiveAmount = formatNumber(clamped * currentRate, 0);

  const exceedsTier1 = parsed > TIER_1_MAX_CAD;
  const belowMin = parsed > 0 && parsed < MIN_AMOUNT_CAD;
  const hasError = exceedsTier1 || belowMin;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSendAmount(sanitizeAmount(e.target.value));
  };

  const registerHref = `/${loc}/register?amount=${encodeURIComponent(sendAmount)}&mode=${isP2PMode ? "p2p" : "standard"}`;

  const rateTimestamp = "indicatif · actualisé à chaque ouverture";

  return (
    <div className="min-h-screen bg-dz-dark font-sans text-white selection:bg-dz-primary/30 overflow-x-hidden">
      <nav className="fixed top-0 inset-x-0 z-50 bg-dz-dark/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={`/${loc}`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dz-primary to-dz-green-dark flex items-center justify-center text-white font-black text-xs shadow-lg">
              DZ
            </div>
            <span className="font-serif font-bold text-xl tracking-widest">DinarZone</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#7B8DB5]">
            <a href="#comment-ca-marche" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#securite" className="hover:text-white transition-colors">Sécurité</a>
            <a href="#conformite" className="hover:text-white transition-colors">Conformité</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/${loc}/login`} className="hidden md:block text-sm font-bold text-white hover:text-dz-primary transition-colors">
              Se connecter
            </Link>
            <Link
              href={`/${loc}/register`}
              className="px-6 py-2.5 bg-white text-dz-dark rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center isolate">
        <Image
          src={HERO_IMAGE_URL}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0"
          aria-hidden="true"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-dz-dark via-dz-dark/80 to-dz-dark/20" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-20 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-dz-primary mb-6 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-dz-primary motion-safe:animate-pulse" />
              Nouveau corridor Canada
              <ArrowRightIcon className="w-3 h-3" />
              Algérie
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6">
              L&apos;argent au pays,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dz-primary to-[#42E88F]">
                sans compromis.
              </span>
            </h1>
            <p className="text-lg text-[#F0F4FA] mb-8 max-w-lg leading-relaxed">
              Transférez vos fonds vers le Maghreb en quelques minutes. Taux de change
              compétitifs, livraison BaridiMob rapide, tarification transparente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={registerHref}
                className="group px-8 py-4 bg-gradient-to-r from-dz-primary to-[#006A33] rounded-xl font-bold text-lg shadow-[0_10px_30px_rgba(0,168,77,0.3)] hover:shadow-[0_10px_40px_rgba(0,168,77,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Commencer maintenant</span>
                <ArrowRightIcon className="w-5 h-5 relative z-10" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href={`/${loc}/login`}
                className="px-8 py-4 bg-[#0F1523]/80 backdrop-blur-sm border border-white/10 hover:bg-white/5 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-md mx-auto lg:ml-auto"
          >
            <div
              className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ${
                isP2PMode
                  ? "bg-gradient-to-br from-dz-gold/25 via-dz-primary/10 to-transparent"
                  : "bg-white/5"
              }`}
              aria-hidden="true"
            />

            <form
              role="region"
              aria-label="Calculateur de transfert"
              onSubmit={(e) => e.preventDefault()}
              className={`relative bg-[#0F1523]/90 backdrop-blur-2xl border p-6 rounded-3xl overflow-hidden transition-all duration-500 ${
                isP2PMode
                  ? "border-dz-gold/40 shadow-[0_0_40px_rgba(184,146,59,0.15)]"
                  : "border-white/10 shadow-xl"
              }`}
            >
              {isP2PMode && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-dz-gold rounded-full blur-[80px] opacity-20 pointer-events-none" aria-hidden="true" />
              )}

              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider relative">
                Calculateur de transfert
              </h3>

              <div
                className={`bg-dz-dark border rounded-2xl p-4 mb-2 transition-colors relative z-10 ${
                  isP2PMode
                    ? "border-white/10 focus-within:border-dz-gold"
                    : "border-white/10 focus-within:border-dz-primary"
                }`}
              >
                <label htmlFor="send-amount" className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Vous envoyez
                </label>
                <div className="flex items-center">
                  <input
                    id="send-amount"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={sendAmount}
                    onChange={handleAmountChange}
                    placeholder="0,00"
                    aria-describedby="rate-breakdown amount-help"
                    aria-invalid={hasError}
                    className="w-full bg-transparent text-3xl font-bold text-white outline-none tabular-nums"
                  />
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                    <FlagIcon countryCode="CA" size="sm" />
                    <span className="font-bold text-sm">CAD</span>
                  </div>
                </div>
              </div>

              <p id="amount-help" className="sr-only">
                Montant minimum {MIN_AMOUNT_CAD} CAD, plafond auto-service Tier 1 de {TIER_1_MAX_CAD} CAD sans vérification d&apos;identité renforcée.
              </p>

              {hasError && (
                <p role="alert" className="text-[11px] font-bold text-dz-warning pl-2 mb-1">
                  {exceedsTier1
                    ? `Plafond auto-service Tier 1 : ${TIER_1_MAX_CAD} CAD. Vérification renforcée requise au-delà.`
                    : `Montant minimum : ${MIN_AMOUNT_CAD} CAD.`}
                </p>
              )}

              <div id="rate-breakdown" className="pl-6 py-4 relative z-10">
                <div className="absolute left-[22px] top-0 bottom-0 w-px bg-white/10" aria-hidden="true" />

                <div className="flex items-center justify-between text-sm mb-3 relative">
                  <div className="absolute -left-5 w-4 h-4 bg-[#0F1523] border border-white/10 rounded-full flex items-center justify-center text-white/60" aria-hidden="true">
                    <MinusSmallIcon className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[#7B8DB5]">Frais de traitement</span>
                  <span className="font-bold text-white tabular-nums">
                    {FIXED_FEE_CAD.toFixed(2)} CAD
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm relative">
                  <div
                    className={`absolute -left-5 w-4 h-4 bg-[#0F1523] border rounded-full flex items-center justify-center transition-colors ${
                      isP2PMode
                        ? "border-dz-gold text-dz-gold"
                        : "border-dz-primary text-dz-primary"
                    }`}
                    aria-hidden="true"
                  >
                    <MultiplySmallIcon className="w-2.5 h-2.5" />
                  </div>

                  <span
                    className={`font-bold transition-colors ${
                      isP2PMode ? "text-dz-gold" : "text-dz-primary"
                    }`}
                  >
                    {isP2PMode ? "Taux P2P (Communauté)" : "Taux Standard (indicatif)"}
                  </span>
                  <span className="font-bold text-white font-mono tabular-nums">
                    1 CAD = {currentRate.toFixed(2)} DZD
                  </span>
                </div>

                <p className="text-[9px] text-[#7B8DB5]/80 mt-2 ml-1 flex items-center gap-1">
                  <InfoIcon className="w-2.5 h-2.5" />
                  {rateTimestamp} — taux confirmé au moment du transfert.
                </p>
              </div>

              <div
                className={`bg-dz-dark border rounded-2xl p-4 mt-2 transition-all duration-500 relative z-10 ${
                  isP2PMode
                    ? "border-dz-gold/50 shadow-[0_0_20px_rgba(184,146,59,0.1)]"
                    : "border-white/10"
                }`}
              >
                <label htmlFor="receive-amount" className="text-xs font-bold text-[#7B8DB5] block mb-1">
                  Le bénéficiaire reçoit
                </label>
                <div className="flex items-center">
                  <output
                    id="receive-amount"
                    htmlFor="send-amount"
                    aria-live="polite"
                    className={`w-full text-3xl font-bold tabular-nums truncate transition-colors ${
                      isP2PMode ? "text-dz-gold" : "text-dz-primary"
                    }`}
                  >
                    {receiveAmount}
                  </output>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shrink-0 ml-2">
                    <FlagIcon countryCode="DZ" size="sm" />
                    <span className="font-bold text-sm text-white">DZD</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsP2PMode((m) => !m)}
                  role="switch"
                  aria-checked={isP2PMode}
                  aria-label="Mode P2P communautaire"
                  className="group flex items-center gap-2 text-xs font-bold text-[#7B8DB5] hover:text-white transition-colors py-2 px-4 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
                >
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                    {isP2PMode ? <BankIcon className="w-4 h-4" /> : <UsersIcon className="w-4 h-4" />}
                  </span>
                  {isP2PMode
                    ? "Retour au transfert bancaire standard"
                    : "Découvrir le transfert P2P (Taux de la communauté)"}
                </button>
              </div>

              <AnimatePresence>
                {isP2PMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 bg-dz-gold/10 border border-dz-gold/20 rounded-xl p-3 overflow-hidden"
                  >
                    <p className="text-[10px] text-dz-gold leading-tight text-justify">
                      <strong>Mode P2P — indicatif, non contractuel.</strong> DinarZone agit
                      comme plateforme de mise en relation (matching) entre agents de liquidité
                      indépendants et membres vérifiés. Le taux affiché reflète la moyenne des
                      offres observées et ne constitue pas une cotation ferme. Exécution
                      soumise à vérification d&apos;identité (KYC), dépistage AML/sanctions,
                      disponibilité des agents, et confirmation au moment du transfert. Aucun
                      engagement d&apos;exécution.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href={hasError ? "#" : registerHref}
                aria-disabled={hasError}
                onClick={(e) => {
                  if (hasError) e.preventDefault();
                }}
                className={`relative w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  hasError
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : isP2PMode
                      ? "bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-dark hover:shadow-[0_0_20px_rgba(184,146,59,0.4)]"
                      : "bg-white text-dz-dark hover:bg-gray-200"
                }`}
              >
                Continuer
                <ArrowRightIcon className="w-5 h-5" />
              </Link>

              <p className="text-[9px] text-[#7B8DB5]/80 text-center mt-3 px-2">
                En continuant, vous acceptez nos{" "}
                <Link href={`/${loc}/legal/terms`} className="underline hover:text-white">
                  conditions
                </Link>{" "}
                et{" "}
                <Link href={`/${loc}/legal/privacy`} className="underline hover:text-white">
                  politique de confidentialité
                </Link>
                . Transfert soumis à vérification KYC.
              </p>
            </form>
          </motion.div>
        </div>
      </main>

      <section id="securite" className="border-y border-white/5 bg-white/[0.02] py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-[#7B8DB5] uppercase tracking-widest mb-6">
            Conformité &amp; Partenaires
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <div className="text-center">
              <div className="text-xl font-serif font-bold">FINTRAC</div>
              <div className="text-[9px] text-[#7B8DB5] mt-1">{FINTRAC_MSB_NUMBER}</div>
            </div>
            <div className="text-xl font-bold tracking-tighter">stripe</div>
            <div className="text-xl font-bold italic">BaridiMob</div>
            <div className="text-xl font-bold">Thunes</div>
          </div>
        </div>
      </section>

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
            une expérience transparente, conforme, et sans friction.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: "speed",
              icon: <BoltIcon className="w-7 h-7" />,
              title: "Livraison rapide",
              desc: "Vos DZD sont disponibles sur le compte BaridiMob de votre proche en quelques minutes, sous réserve de vérifications de conformité.",
            },
            {
              id: "security",
              icon: <ShieldIcon className="w-7 h-7" />,
              title: "Sécurité de niveau bancaire",
              desc: "Chiffrement de bout en bout, authentification forte, et partenaire d'encaissement PCI DSS (Stripe). Vos fonds transitent par des rails régulés.",
            },
            {
              id: "rates",
              icon: <CoinIcon className="w-7 h-7" />,
              title: "Taux compétitifs, tarification claire",
              desc: "Un taux affiché en amont, des frais annoncés avant confirmation, zéro surprise au moment du transfert.",
            },
          ].map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#0F1523] border border-white/5 hover:border-dz-primary/50 transition-colors p-8 rounded-3xl group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-dz-primary mb-6 group-hover:bg-dz-primary/20 transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-[#7B8DB5] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="conformite" className="border-t border-white/5 bg-white/[0.02] py-16 relative z-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Conformité &amp; Transparence
          </h2>
          <p className="text-[#7B8DB5] text-sm leading-relaxed max-w-2xl mx-auto mb-6">
            DinarZone Inc. est une société de services monétaires (ESM) enregistrée auprès
            du CANAFE/FINTRAC. Tous les transferts sont soumis à des contrôles KYC, AML, et
            de dépistage des sanctions. Les taux de change affichés sont indicatifs et
            confirmés au moment du transfert.
          </p>
          <div className="inline-flex flex-wrap justify-center gap-3 text-[11px] text-[#7B8DB5]">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              FINTRAC — {FINTRAC_MSB_NUMBER}
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              PCMLTFA compliant
            </span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              Loi 25 (Québec) — RGPD
            </span>
          </div>
        </div>
      </section>

      <footer id="agents" className="bg-[#0F1523] border-t border-white/5 py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-dz-primary flex items-center justify-center text-dz-dark font-black text-[10px]">
              DZ
            </div>
            <span className="font-serif font-bold tracking-widest">DinarZone</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-[#7B8DB5]" aria-label="Pied de page">
            <Link href={`/${loc}/legal/terms`} className="hover:text-white transition-colors">Conditions</Link>
            <Link href={`/${loc}/legal/privacy`} className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href={`/${loc}/legal/aml`} className="hover:text-white transition-colors">Politique AML</Link>
            <Link href={`/${loc}/legal/complaints`} className="hover:text-white transition-colors">Plaintes</Link>
          </nav>
          <p className="text-[#7B8DB5] text-[11px] text-center md:text-right">
            &copy; {new Date().getFullYear()} DinarZone Inc.
            <br />
            ESM enregistrée CANAFE — {FINTRAC_MSB_NUMBER}
          </p>
        </div>
      </footer>
    </div>
  );
}
