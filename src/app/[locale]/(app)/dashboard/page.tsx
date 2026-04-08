"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import FlagIcon from "@/components/ui/FlagIcon";

/* ---- Mock Data ---- */
const MOCK_USER = {
  name: "Karim",
  kycTier: "tier_2" as const,
  kycLabel: "Verifie",
  monthlyLimit: 2000,
  monthlyUsed: 650,
};

const MOCK_RATES = [
  { from: "CAD", fromFlag: "CA", to: "DZD", toFlag: "DZ", rate: 99.5, trend: "up" as const, delta: "+0.3" },
  { from: "CAD", fromFlag: "CA", to: "TND", toFlag: "TN", rate: 2.28, trend: "up" as const, delta: "+0.02" },
  { from: "QAR", fromFlag: "QA", to: "DZD", toFlag: "DZ", rate: 37.2, trend: "down" as const, delta: "-0.1" },
  { from: "QAR", fromFlag: "QA", to: "TND", toFlag: "TN", rate: 0.85, trend: "up" as const, delta: "+0.01" },
  { from: "AED", fromFlag: "AE", to: "DZD", toFlag: "DZ", rate: 36.8, trend: "up" as const, delta: "+0.2" },
];

const MOCK_TRANSFERS = [
  { id: "1", recipientName: "Fatima Benali", country: "DZ", amount: "49,750 DZD", amountSent: "$500 CAD", status: "delivered" as const, date: "3 avr.", method: "BaridiMob" },
  { id: "2", recipientName: "Mohamed Trabelsi", country: "TN", amount: "1,140 TND", amountSent: "$500 CAD", status: "processing" as const, date: "5 avr.", method: "D17" },
  { id: "3", recipientName: "Ahmed Khelifi", country: "DZ", amount: "14,925 DZD", amountSent: "$150 CAD", status: "delivered" as const, date: "28 mars", method: "Cash" },
];

const STATUS_MAP: Record<string, { label: string; color: "green" | "gold" | "red" | "gray" }> = {
  delivered: { label: "Livre", color: "green" },
  processing: { label: "En cours", color: "gold" },
  failed: { label: "Echoue", color: "red" },
  cancelled: { label: "Annule", color: "red" },
};

/* ---- Promo banners (Talabat/Snoonu style) with original SVG illustrations ---- */
const PROMO_BANNERS = [
  {
    id: "ramadan",
    gradient: "promo-gradient-1",
    tag: "RAMADAN 2026",
    title: "0% de frais",
    subtitle: "Sur votre premier transfert vers l'Algerie",
    cta: "Envoyer maintenant",
    href: "/send?to=DZ",
    illustration: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
        {/* Crescent moon */}
        <circle cx="60" cy="45" r="28" fill="white" opacity="0.15" />
        <circle cx="70" cy="38" r="24" fill="#006633" />
        {/* Star */}
        <polygon points="55,30 57,36 63,36 58,40 60,46 55,42 50,46 52,40 47,36 53,36" fill="white" opacity="0.2" />
        {/* Gift/money envelope */}
        <rect x="35" y="65" width="50" height="35" rx="6" fill="white" opacity="0.15" />
        <path d="M35 73 L60 88 L85 73" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
        {/* Dollar sign in envelope */}
        <text x="60" y="85" textAnchor="middle" fontSize="16" fill="white" fontWeight="bold" opacity="0.2">$0</text>
        {/* Sparkles */}
        <circle cx="90" cy="30" r="2" fill="white" opacity="0.3" />
        <circle cx="30" cy="50" r="1.5" fill="white" opacity="0.2" />
        <circle cx="95" cy="60" r="1" fill="white" opacity="0.25" />
      </svg>
    ),
  },
  {
    id: "referral",
    gradient: "promo-gradient-2",
    tag: "PARRAINAGE",
    title: "Gagnez $10",
    subtitle: "Pour chaque ami qui envoie son premier transfert",
    cta: "Inviter un ami",
    href: "/profile",
    illustration: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
        {/* Two people connected */}
        <circle cx="42" cy="40" r="14" fill="white" opacity="0.12" />
        <circle cx="42" cy="35" r="8" fill="white" opacity="0.15" />
        <ellipse cx="42" cy="55" rx="14" ry="10" fill="white" opacity="0.12" />
        <circle cx="78" cy="40" r="14" fill="white" opacity="0.12" />
        <circle cx="78" cy="35" r="8" fill="white" opacity="0.15" />
        <ellipse cx="78" cy="55" rx="14" ry="10" fill="white" opacity="0.12" />
        {/* Connection line with heart */}
        <line x1="52" y1="42" x2="68" y2="42" stroke="#D4AF6A" strokeWidth="2" opacity="0.4" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.5s" repeatCount="indefinite" />
        </line>
        {/* Gift box */}
        <rect x="42" y="72" width="36" height="28" rx="5" fill="white" opacity="0.15" />
        <line x1="60" y1="72" x2="60" y2="100" stroke="white" strokeWidth="2" opacity="0.1" />
        <rect x="42" y="72" width="36" height="8" rx="3" fill="#D4AF6A" opacity="0.2" />
        {/* Ribbon */}
        <path d="M56 72 L60 65 L64 72" stroke="#D4AF6A" strokeWidth="2" fill="none" opacity="0.3" />
        {/* $10 */}
        <text x="60" y="93" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold" opacity="0.25">$10</text>
        {/* Sparkles */}
        <circle cx="30" cy="25" r="2" fill="#D4AF6A" opacity="0.3" />
        <circle cx="95" cy="30" r="1.5" fill="white" opacity="0.2" />
        <circle cx="100" cy="80" r="2" fill="#D4AF6A" opacity="0.2" />
      </svg>
    ),
  },
  {
    id: "cashpickup",
    gradient: "promo-gradient-3",
    tag: "NOUVEAU",
    title: "Cash Pickup",
    subtitle: "+200 points de retrait en Algerie et Tunisie",
    cta: "Voir les agents",
    href: "/agents",
    illustration: (
      <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
        {/* Map pin */}
        <path d="M60 15 C40 15 28 30 28 48 C28 70 60 100 60 100 C60 100 92 70 92 48 C92 30 80 15 60 15Z" fill="white" opacity="0.1" />
        <circle cx="60" cy="45" r="14" fill="white" opacity="0.15" />
        {/* Store/agent icon inside pin */}
        <rect x="50" y="40" width="20" height="14" rx="2" fill="white" opacity="0.2" />
        <path d="M48 40 L60 32 L72 40" stroke="white" strokeWidth="2" fill="none" opacity="0.2" />
        {/* Cash bills */}
        <rect x="20" y="70" width="30" height="18" rx="3" fill="white" opacity="0.12" transform="rotate(-15, 35, 79)" />
        <rect x="70" y="68" width="30" height="18" rx="3" fill="white" opacity="0.12" transform="rotate(10, 85, 77)" />
        {/* Coins */}
        <circle cx="45" cy="90" r="8" fill="#D4AF6A" opacity="0.15" />
        <circle cx="48" cy="87" r="8" fill="white" opacity="0.1" />
        {/* Signal waves from pin */}
        <circle cx="60" cy="45" r="24" stroke="white" strokeWidth="1" opacity="0.08" />
        <circle cx="60" cy="45" r="34" stroke="white" strokeWidth="1" opacity="0.05" />
        {/* +200 */}
        <text x="85" y="55" fontSize="11" fill="white" fontWeight="bold" opacity="0.2">+200</text>
      </svg>
    ),
  },
];

/* ---- Quick actions (Talabat category grid) ---- */
const QUICK_ACTIONS = [
  { label: "Algerie", flag: "DZ", rate: "99.5", href: "/send?to=DZ", color: "bg-dz-green/8" },
  { label: "Tunisie", flag: "TN", rate: "2.28", href: "/send?to=TN", color: "bg-dz-red/6" },
  { label: "Qatar", flag: "QA", rate: "2.71", href: "/send?to=QA", color: "bg-dz-maroon/6" },
  { label: "EAU", flag: "AE", rate: "2.73", href: "/send?to=AE", color: "bg-dz-gold/8" },
];

/* ---- Helpers ---- */
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { start = end; clearInterval(timer); }
      setDisplayed(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{displayed.toLocaleString()}</>;
}

/* ---- Promo Carousel (Snoonu style) ---- */
function PromoCarousel({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const banner = PROMO_BANNERS[active];

  return (
    <div className="relative">
      <Link href={`/${locale}${banner.href}`} className="block">
        <div className={`${banner.gradient} rounded-2xl p-5 overflow-hidden relative min-h-[140px] card-press`}>
          {/* Illustrated background */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            {banner.illustration}
          </div>
          {/* Content */}
          <div className="relative z-10">
            <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-white tracking-wider mb-2">
              {banner.tag}
            </span>
            <h3 className="text-2xl font-bold text-white mb-0.5 animate-slide-up">{banner.title}</h3>
            <p className="text-sm text-white/80 mb-3">{banner.subtitle}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              {banner.cta}
              <svg className="w-4 h-4 animate-swipe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
      {/* Dots (Snoonu style) */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {PROMO_BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-dz-green" : "w-1.5 bg-dz-border"
            }`}
            aria-label={`Banniere ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---- Live ticker (Uber/Binance style) ---- */
function LiveTicker() {
  return (
    <div className="marquee-container rounded-xl bg-dz-dark/95 py-2 px-3">
      <div className="animate-ticker inline-flex gap-6 items-center">
        {[...MOCK_RATES, ...MOCK_RATES].map((rate, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs whitespace-nowrap">
            <span className="text-white/50">{rate.from}/{rate.to}</span>
            <span className="font-bold text-white">{rate.rate}</span>
            <span className={rate.trend === "up" ? "text-dz-success" : "text-dz-red"}>
              {rate.delta}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ==== MAIN DASHBOARD ==== */
export default function DashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const loc = (locale as string) || "fr";
  const usedPercent = (MOCK_USER.monthlyUsed / MOCK_USER.monthlyLimit) * 100;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* 1. Social proof bar (Uber) */}
      <div className="flex items-center gap-2 px-1 animate-stagger-in stagger-1">
        <div className="w-2 h-2 rounded-full bg-dz-success animate-live-dot" />
        <p className="text-xs text-dz-text-secondary">
          <span className="font-semibold text-dz-text"><AnimatedCounter value={1247} /></span> transferts aujourd&apos;hui
        </p>
        <span className="text-dz-border mx-1">|</span>
        <p className="text-xs text-dz-text-muted">
          <span className="font-semibold text-dz-success">$2.4M</span> envoyes cette semaine
        </p>
      </div>

      {/* 2. Welcome hero — illustrated SVG scene */}
      <div className="rounded-2xl overflow-hidden relative animate-stagger-in stagger-2">
        {/* Illustrated background — original SVG scene */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 800 320" fill="none" preserveAspectRatio="xMidYMid slice">
            {/* Sky gradient */}
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="800" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#003318" />
                <stop offset="40%" stopColor="#004D26" />
                <stop offset="100%" stopColor="#0a2f1a" />
              </linearGradient>
              <linearGradient id="goldBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B8923B" stopOpacity="0" />
                <stop offset="50%" stopColor="#D4AF6A" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#B8923B" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="groundGrad" x1="0" y1="240" x2="0" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#003318" stopOpacity="0" />
                <stop offset="100%" stopColor="#001a0d" stopOpacity="0.5" />
              </linearGradient>
              <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00873E" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00873E" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D4AF6A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#D4AF6A" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="800" height="320" fill="url(#sky)" />

            {/* Stars / dots */}
            <circle cx="120" cy="40" r="1.5" fill="white" opacity="0.3" />
            <circle cx="300" cy="25" r="1" fill="white" opacity="0.2" />
            <circle cx="500" cy="50" r="1.5" fill="white" opacity="0.25" />
            <circle cx="680" cy="35" r="1" fill="white" opacity="0.3" />
            <circle cx="750" cy="70" r="1.5" fill="white" opacity="0.15" />
            <circle cx="50" cy="80" r="1" fill="white" opacity="0.2" />

            {/* Stylized Canada (left) — CN Tower silhouette */}
            <g opacity="0.15">
              <rect x="80" y="130" width="4" height="110" rx="2" fill="white" />
              <rect x="74" y="170" width="16" height="30" rx="3" fill="white" />
              <circle cx="82" cy="150" r="8" fill="white" />
              {/* Buildings */}
              <rect x="50" y="200" width="18" height="40" rx="2" fill="white" />
              <rect x="100" y="190" width="14" height="50" rx="2" fill="white" />
              <rect x="120" y="210" width="20" height="30" rx="2" fill="white" />
            </g>

            {/* Stylized Algeria / Tunisia (right) — Mosque + Casbah */}
            <g opacity="0.15">
              {/* Minaret */}
              <rect x="680" y="140" width="5" height="100" rx="2" fill="white" />
              <circle cx="682.5" cy="140" r="6" fill="white" />
              {/* Dome */}
              <ellipse cx="720" cy="200" rx="25" ry="18" fill="white" />
              <rect x="695" y="200" width="50" height="40" rx="2" fill="white" />
              {/* Casbah buildings */}
              <rect x="640" y="210" width="22" height="30" rx="2" fill="white" />
              <rect x="750" y="195" width="18" height="45" rx="2" fill="white" />
            </g>

            {/* Transfer arc — golden corridor line */}
            <path d="M 150 200 Q 400 60 650 200" stroke="url(#goldBeam)" strokeWidth="2.5" strokeDasharray="8 6" fill="none" opacity="0.8">
              <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2s" repeatCount="indefinite" />
            </path>

            {/* Money packet traveling along the arc */}
            <g opacity="0.9">
              <circle r="10" fill="#D4AF6A" opacity="0.9">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 150 200 Q 400 60 650 200" />
              </circle>
              <text fontSize="8" fill="#003318" fontWeight="bold" textAnchor="middle" dy="3">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 150 200 Q 400 60 650 200" />
                $
              </text>
            </g>

            {/* Second arc — green (return flow) */}
            <path d="M 650 220 Q 400 280 150 220" stroke="#00873E" strokeWidth="1.5" strokeDasharray="4 6" fill="none" opacity="0.3">
              <animate attributeName="stroke-dashoffset" from="0" to="20" dur="3s" repeatCount="indefinite" />
            </path>

            {/* Globe glow left */}
            <circle cx="150" cy="200" r="80" fill="url(#glowGreen)" />
            {/* Globe glow right */}
            <circle cx="650" cy="200" r="80" fill="url(#glowGold)" />

            {/* Country circles — sender */}
            <circle cx="150" cy="200" r="22" fill="#006633" stroke="white" strokeWidth="1.5" opacity="0.9" />
            <text x="150" y="196" textAnchor="middle" fontSize="14" fill="white" dy="5">CA</text>

            {/* Country circles — receiver */}
            <circle cx="650" cy="200" r="22" fill="#B8923B" stroke="white" strokeWidth="1.5" opacity="0.9" />
            <text x="650" y="196" textAnchor="middle" fontSize="14" fill="white" dy="5">DZ</text>

            {/* Middle hub — DinarZone logo concept */}
            <circle cx="400" cy="130" r="28" fill="#006633" stroke="#D4AF6A" strokeWidth="2" opacity="0.9" />
            <text x="400" y="126" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold" dy="5">DZ</text>

            {/* Radiating connection lines from hub */}
            <line x1="400" y1="158" x2="320" y2="250" stroke="#00873E" strokeWidth="1" opacity="0.2" strokeDasharray="3 4" />
            <line x1="400" y1="158" x2="480" y2="250" stroke="#00873E" strokeWidth="1" opacity="0.2" strokeDasharray="3 4" />

            {/* Small service icons along the arc */}
            {/* Cash icon */}
            <g transform="translate(280, 115)" opacity="0.5">
              <rect width="24" height="16" rx="3" fill="white" />
              <circle cx="12" cy="8" r="4" fill="#006633" />
            </g>
            {/* Phone/mobile icon */}
            <g transform="translate(500, 115)" opacity="0.5">
              <rect x="3" width="16" height="24" rx="3" fill="white" />
              <circle cx="11" cy="20" r="2" fill="#006633" />
              <rect x="7" y="3" width="8" height="12" rx="1" fill="#006633" opacity="0.3" />
            </g>

            {/* Ground gradient overlay */}
            <rect y="240" width="800" height="80" fill="url(#groundGrad)" />

            {/* Geometric patterns — Islamic star motif (subtle) */}
            <g opacity="0.06" transform="translate(370, 250)">
              <polygon points="0,-20 6,-7 20,-7 9,3 12,18 0,10 -12,18 -9,3 -20,-7 -6,-7" fill="white" />
            </g>
            <g opacity="0.04" transform="translate(200, 270)">
              <polygon points="0,-15 5,-5 15,-5 7,2 9,14 0,8 -9,14 -7,2 -15,-5 -5,-5" fill="white" />
            </g>
            <g opacity="0.04" transform="translate(580, 265)">
              <polygon points="0,-15 5,-5 15,-5 7,2 9,14 0,8 -9,14 -7,2 -15,-5 -5,-5" fill="white" />
            </g>
          </svg>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce-in">
                <span className="text-lg font-bold text-white">{MOCK_USER.name[0]}</span>
              </div>
              <div>
                <p className="text-white/50 text-[11px] font-medium uppercase tracking-widest">Bienvenue</p>
                <h2 className="text-xl font-bold text-white">{MOCK_USER.name}</h2>
              </div>
            </div>
            <Badge color="gold">
              <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              {MOCK_USER.kycLabel}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/40 text-xs">Limite mensuelle</span>
              <span className="text-white/90 text-xs font-semibold">
                $<AnimatedCounter value={MOCK_USER.monthlyUsed} /> / ${MOCK_USER.monthlyLimit.toLocaleString()} CAD
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-dz-gold to-dz-gold-light rounded-full transition-all duration-1000 ease-out progress-animated"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions - Talabat category grid */}
      <div className="animate-stagger-in stagger-3">
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.flag} href={`/${loc}${action.href}`}>
              <div className="category-pill flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-dz-border/30 py-3 px-2 text-center card-elevated">
                <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center`}>
                  <FlagIcon countryCode={action.flag} size="md" />
                </div>
                <span className="text-xs font-semibold text-dz-text">{action.label}</span>
                <span className="text-[10px] text-dz-text-muted">{action.rate}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href={`/${loc}/send`} className="block mt-3">
          <Button fullWidth size="lg" icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
            </svg>
          }>
            Envoyer de l&apos;argent
          </Button>
        </Link>
      </div>

      {/* 4. Promo carousel (Snoonu/Talabat) */}
      <div className="animate-stagger-in stagger-4">
        <PromoCarousel locale={loc} />
      </div>

      {/* 5. Live rates ticker (Binance/Trading style) */}
      <div className="animate-stagger-in stagger-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-dz-success animate-live-dot" />
            <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider">
              Taux en direct
            </h3>
          </div>
          <span className="text-[10px] text-dz-text-muted">Mis a jour en temps reel</span>
        </div>
        <LiveTicker />

        {/* Expanded rate cards below */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 mt-3 scrollbar-none">
          {MOCK_RATES.map((rate, i) => (
            <Link key={`${rate.from}-${rate.to}`} href={`/${loc}/send?from=${rate.from}&to=${rate.to}`}>
              <div className={`card-lift flex-shrink-0 w-[150px] rounded-2xl bg-white border border-dz-border/30 p-3.5 animate-stagger-in stagger-${i + 1}`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <FlagIcon countryCode={rate.fromFlag} size="sm" />
                  <svg className="w-3 h-3 text-dz-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <FlagIcon countryCode={rate.toFlag} size="sm" />
                </div>
                <p className="text-[10px] text-dz-text-muted">1 {rate.from} =</p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-dz-text number-highlight">{rate.rate}</span>
                  <span className="text-[10px] font-medium text-dz-text-secondary mb-1">{rate.to}</span>
                </div>
                <div className={`flex items-center gap-0.5 mt-1 text-[10px] font-semibold ${rate.trend === "up" ? "text-dz-success" : "text-dz-red"}`}>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    {rate.trend === "up" ? (
                      <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06l-5.47-5.47V19.5a.75.75 0 01-.75.75z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v13.19l5.47-5.47a.75.75 0 111.06 1.06l-6.75 6.75a.75.75 0 01-1.06 0l-6.75-6.75a.75.75 0 111.06-1.06l5.47 5.47V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    )}
                  </svg>
                  {rate.delta}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 6. In-app ad space — Illustrated savings banner */}
      <div className="animate-stagger-in stagger-6">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-white to-dz-cream border border-dz-gold/20 p-4 flex items-center gap-3 card-press overflow-hidden relative">
          {/* SVG illustration — bank vs DinarZone comparison */}
          <div className="w-16 h-16 flex-shrink-0 relative">
            <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
              {/* Bank building (crossed out) */}
              <rect x="8" y="24" width="24" height="20" rx="2" fill="#E0DBD0" opacity="0.5" />
              <path d="M8 24 L20 14 L32 24" fill="#E0DBD0" opacity="0.4" />
              <rect x="13" y="30" width="4" height="6" rx="1" fill="#8B9AAF" opacity="0.3" />
              <rect x="23" y="30" width="4" height="6" rx="1" fill="#8B9AAF" opacity="0.3" />
              <rect x="13" y="38" width="4" height="6" rx="1" fill="#8B9AAF" opacity="0.3" />
              <rect x="23" y="38" width="4" height="6" rx="1" fill="#8B9AAF" opacity="0.3" />
              {/* X over bank */}
              <line x1="8" y1="14" x2="32" y2="44" stroke="#D21034" strokeWidth="2.5" opacity="0.5" />
              <line x1="32" y1="14" x2="8" y2="44" stroke="#D21034" strokeWidth="2.5" opacity="0.5" />
              {/* Arrow pointing right */}
              <path d="M36 32 L44 32" stroke="#B8923B" strokeWidth="2" strokeLinecap="round" />
              <path d="M42 28 L46 32 L42 36" stroke="#B8923B" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* DZ coin (golden) */}
              <circle cx="52" cy="32" r="10" fill="#B8923B" opacity="0.2" />
              <circle cx="52" cy="32" r="8" fill="#D4AF6A" opacity="0.3" />
              <text x="52" y="36" textAnchor="middle" fontSize="9" fill="#B8923B" fontWeight="bold">DZ</text>
              {/* Savings sparkle */}
              <circle cx="58" cy="22" r="2" fill="#B8923B" opacity="0.4" />
              <circle cx="46" cy="20" r="1.5" fill="#D4AF6A" opacity="0.3" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-dz-gold bg-dz-gold/10 px-1.5 py-0.5 rounded">OFFRE</span>
            </div>
            <p className="text-sm font-semibold text-dz-text">Economisez jusqu&apos;a 40%</p>
            <p className="text-xs text-dz-text-secondary">vs les banques traditionnelles</p>
          </div>
          <svg className="w-5 h-5 text-dz-gold animate-swipe flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>

      {/* 7. Recent transfers — Uber activity feed */}
      <div className="animate-stagger-in stagger-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider">
            Activite recente
          </h3>
          <Link href={`/${loc}/history`} className="inline-flex items-center gap-1 text-xs font-semibold text-dz-green hover:text-dz-green-dark transition-colors">
            Voir tout
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        <Card padding="none">
          {MOCK_TRANSFERS.map((transfer, index) => {
            const statusInfo = STATUS_MAP[transfer.status];
            const initials = getInitials(transfer.recipientName);
            const isLast = index === MOCK_TRANSFERS.length - 1;
            return (
              <Link key={transfer.id} href={`/${loc}/track/${transfer.id}`}>
                <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-dz-cream/40 transition-all cursor-pointer card-press ${
                  !isLast ? "border-b border-dz-border/15" : ""
                }`}>
                  <div className="w-10 h-10 rounded-full bg-dz-cream flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-dz-text-secondary">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-dz-text truncate">{transfer.recipientName}</p>
                      <FlagIcon countryCode={transfer.country} size="xs" />
                    </div>
                    <p className="text-[11px] text-dz-text-muted mt-0.5">
                      {transfer.date} &middot; {transfer.method} &middot; {transfer.amountSent}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-dz-text">{transfer.amount}</p>
                    <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </Card>
      </div>

      {/* 8. Feature cards grid (Snoonu bottom section) */}
      <div className="grid grid-cols-2 gap-3 animate-stagger-in stagger-8">
        <Link href={`/${loc}/agents`}>
          <div className="card-lift rounded-2xl bg-white border border-dz-border/30 p-4 h-full">
            <div className="w-10 h-10 rounded-xl bg-dz-green/8 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-dz-green" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-dz-text mb-0.5">Points de retrait</p>
            <p className="text-[11px] text-dz-text-muted leading-relaxed">+200 agents en DZ &amp; TN</p>
          </div>
        </Link>
        <Link href={`/${loc}/kyc`}>
          <div className="card-lift rounded-2xl bg-white border border-dz-border/30 p-4 h-full">
            <div className="w-10 h-10 rounded-xl bg-dz-gold/8 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-dz-gold" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-dz-text mb-0.5">Limite $10K</p>
            <p className="text-[11px] text-dz-text-muted leading-relaxed">Verifiez votre identite</p>
          </div>
        </Link>
        <Link href={`/${loc}/recipients`}>
          <div className="card-lift rounded-2xl bg-white border border-dz-border/30 p-4 h-full">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A18.365 18.365 0 0112 21.75c-2.331 0-4.512-.645-6.374-1.766a.75.75 0 01-.245-.932 6.75 6.75 0 01.929-1.935z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-dz-text mb-0.5">Destinataires</p>
            <p className="text-[11px] text-dz-text-muted leading-relaxed">Gerez vos contacts</p>
          </div>
        </Link>
        <Link href={`/${loc}/profile`}>
          <div className="card-lift rounded-2xl bg-white border border-dz-border/30 p-4 h-full">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666ZM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5Z" clipRule="evenodd" />
                <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-dz-text mb-0.5">Inviter &amp; Gagner</p>
            <p className="text-[11px] text-dz-text-muted leading-relaxed">$10 par parrainage</p>
          </div>
        </Link>
      </div>

      {/* 9. Bottom marketing space — App rating CTA (Uber style) */}
      <div className="rounded-2xl bg-dz-dark p-5 text-center animate-stagger-in stagger-8">
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-5 h-5 text-dz-gold" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
          ))}
        </div>
        <p className="text-white text-sm font-semibold mb-1">Vous aimez DinarZone?</p>
        <p className="text-white/50 text-xs mb-3">Aidez-nous a grandir avec une note 5 etoiles</p>
        <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors card-press">
          Noter l&apos;application
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </button>
      </div>

      {/* Extra bottom spacing for bottom nav */}
      <div className="h-4" />
    </div>
  );
}
