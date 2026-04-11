"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import FlagIcon from "@/components/ui/FlagIcon";
import HeroWelcomeCard from "@/components/dashboard/HeroWelcomeCard";
import PromoCarousel from "@/components/dashboard/PromoCarousel";
import RepeatTransferCard from "@/components/dashboard/RepeatTransferCard";
import { getAllRatesWithTrends } from "@/lib/engine/rates";
import { useKycStore } from "@/store/useKycStore";

/* ---- Rate data from engine ---- */
const RATE_TRENDS = getAllRatesWithTrends();

// Map rate trends to dashboard format (pick the 5 main corridors)
const DISPLAY_CORRIDORS = ["CA-DZ", "CA-TN", "QA-DZ", "QA-TN", "AE-DZ"];
const COUNTRY_TO_FLAG: Record<string, string> = {
  CAD: "CA", DZD: "DZ", TND: "TN", QAR: "QA", AED: "AE",
};

const LIVE_RATES = RATE_TRENDS
  .filter((r) => DISPLAY_CORRIDORS.includes(r.corridorId))
  .map((r) => ({
    from: r.from,
    fromFlag: COUNTRY_TO_FLAG[r.from] || "CA",
    to: r.to,
    toFlag: COUNTRY_TO_FLAG[r.to] || "DZ",
    rate: r.rate,
    trend: r.direction as "up" | "down",
    delta: r.delta,
  }));

const MOCK_TRANSFERS = [
  { id: "1", recipientName: "Fatima Benali", country: "DZ", amount: "49,750 DZD", amountSent: "$500 CAD", status: "delivered" as const, date: "Aujourd'hui, 14:30", method: "BaridiMob", isDebit: true },
  { id: "2", recipientName: "Recharge Carte", country: "CA", amount: "1,500 CAD", amountSent: "", status: "delivered" as const, date: "Hier, 09:15", method: "Depot", isDebit: false },
  { id: "3", recipientName: "Mohamed Trabelsi", country: "TN", amount: "1,140 TND", amountSent: "$500 CAD", status: "processing" as const, date: "7 avr.", method: "D17", isDebit: true },
  { id: "4", recipientName: "Ahmed Khelifi", country: "DZ", amount: "14,925 DZD", amountSent: "$150 CAD", status: "delivered" as const, date: "28 mars", method: "Cash", isDebit: true },
];

const STATUS_MAP: Record<string, { label: string; color: "green" | "gold" | "red" | "gray" }> = {
  delivered: { label: "Livre", color: "green" },
  processing: { label: "En cours", color: "gold" },
  failed: { label: "Echoue", color: "red" },
  cancelled: { label: "Annule", color: "red" },
};

/* ---- Promo banners are now in /components/dashboard/PromoCarousel.tsx ---- */

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
  return <>{displayed.toLocaleString("fr-CA")}</>;
}

/* ---- PromoCarousel is now imported from /components/dashboard/PromoCarousel ---- */

/* ---- Live ticker (Uber/Binance style) ---- */
function LiveTicker() {
  return (
    <div className="marquee-container rounded-xl bg-dz-dark/95 py-2 px-3">
      <div className="animate-ticker inline-flex gap-6 items-center">
        {[...LIVE_RATES, ...LIVE_RATES].map((rate, i) => (
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

/* ---- Animation variants ---- */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

/* ==== MAIN DASHBOARD ==== */
export default function DashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const loc = (locale as string) || "fr";
  const kyc = useKycStore();

  // Balance = monthly limit minus used (demo)
  const balance = kyc.monthlyLimitCAD - kyc.monthlyUsedCAD;

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >

      {/* 1. Social proof bar (Uber) */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-dz-success animate-live-dot" />
        <p className="text-xs text-dz-text-secondary">
          <span className="font-semibold text-dz-text"><AnimatedCounter value={1247} /></span> transferts aujourd&apos;hui
        </p>
        <span className="text-dz-border mx-1">|</span>
        <p className="text-xs text-dz-text-muted">
          <span className="font-semibold text-dz-success">$2.4M</span> envoyes cette semaine
        </p>
      </motion.div>

      {/* 1b. Balance Card (Wallet style) */}
      <motion.div variants={itemVariants} className="relative w-full rounded-3xl p-6 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00A84D] to-[#070B14]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#00A84D] animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wider">CAD</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B8923B] to-[#9A7A31] flex items-center justify-center text-[#070B14] font-black text-xs shadow-lg">
              DZ
            </div>
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium mb-1">Solde disponible</p>
            <h2 className="text-4xl font-bold text-white tabular-nums tracking-tight">
              ${balance.toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* 2. Welcome hero — premium card */}
      <motion.div variants={itemVariants}>
        <HeroWelcomeCard
          userName="Karim"
          monthlyLimit={kyc.monthlyLimitCAD}
          monthlyUsed={kyc.monthlyUsedCAD}
          kycLabel={kyc.tierLabel}
        />
      </motion.div>

      {/* 3. Quick Actions - Talabat category grid */}
      <motion.div variants={itemVariants}>
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
      </motion.div>

      {/* 4. Promo carousel — horizontal scroll snap */}
      <motion.div variants={itemVariants}>
        <PromoCarousel locale={loc} />
      </motion.div>

      {/* 5. Live rates ticker (Binance/Trading style) */}
      <motion.div variants={itemVariants}>
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
          {LIVE_RATES.map((rate, i) => (
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
      </motion.div>

      {/* 6. In-app ad space — Illustrated savings banner */}
      <motion.div variants={itemVariants}>
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
      </motion.div>

      {/* 7. Repeat transfer — 3-click flow */}
      <motion.div variants={itemVariants}>
        <RepeatTransferCard />
      </motion.div>

      {/* 8. Recent transfers — Uber activity feed */}
      <motion.div variants={itemVariants}>
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
                    <p className={`text-sm font-bold tabular-nums ${transfer.isDebit ? "text-dz-text" : "text-dz-success"}`}>
                      {transfer.isDebit ? "- " : "+ "}{transfer.amount}
                    </p>
                    <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </Card>
      </motion.div>

      {/* 9. Feature cards grid (Snoonu bottom section) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
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
      </motion.div>

      {/* 10. Bottom marketing space — App rating CTA (Uber style) */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-dz-dark p-5 text-center">
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
      </motion.div>

      {/* Extra bottom spacing for bottom nav */}
      <div className="h-4" />
    </motion.div>
  );
}
