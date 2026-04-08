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

/* ---- Promo banners (Talabat/Snoonu style) ---- */
const PROMO_BANNERS = [
  {
    id: "ramadan",
    gradient: "promo-gradient-1",
    tag: "RAMADAN 2026",
    title: "0% de frais",
    subtitle: "Sur votre premier transfert vers l'Algerie",
    cta: "Envoyer maintenant",
    href: "/send?to=DZ",
    icon: (
      <svg className="w-16 h-16 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z" />
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
    icon: (
      <svg className="w-16 h-16 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A18.365 18.365 0 0112 21.75c-2.331 0-4.512-.645-6.374-1.766a.75.75 0 01-.245-.932 6.75 6.75 0 01.929-1.935zM22.125 15.769a.75.75 0 010 .354c-.073.294-.17.585-.29.868-.09.209-.245.381-.422.463a15.64 15.64 0 01-2.198.882.75.75 0 01-.508-.07 6.7 6.7 0 00-1.707-2.946 1.884 1.884 0 01-.068-.116.75.75 0 01.345-.855 6.747 6.747 0 014.848-.605zM1.875 15.769a6.747 6.747 0 014.848.605.75.75 0 01.345.855 1.884 1.884 0 01-.068.116 6.7 6.7 0 00-1.707 2.946.75.75 0 01-.508.07 15.64 15.64 0 01-2.198-.882c-.177-.082-.332-.254-.422-.463a5.414 5.414 0 01-.29-.868.75.75 0 010-.354z" />
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
    icon: (
      <svg className="w-16 h-16 text-white/20" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
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
          {/* Background icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
            {banner.icon}
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

      {/* 2. Welcome card + balance (Uber hero) */}
      <Card variant="dark" padding="lg" className="bg-gradient-to-br from-dz-green-darkest via-dz-dark to-dz-dark-card overflow-hidden relative animate-stagger-in stagger-2">
        <div className="absolute top-0 right-0 w-40 h-40 bg-dz-green/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-4 w-24 h-24 bg-dz-gold/5 rounded-full translate-y-1/2" />

        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-dz-green/20 border border-dz-green/30 flex items-center justify-center animate-bounce-in">
              <span className="text-lg font-bold text-dz-green-light">{MOCK_USER.name[0]}</span>
            </div>
            <div>
              <p className="text-white/40 text-[11px] font-medium uppercase tracking-widest">Bienvenue</p>
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

        {/* Progress bar animated */}
        <div className="relative">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/40 text-xs">Limite mensuelle</span>
            <span className="text-white/90 text-xs font-semibold">
              $<AnimatedCounter value={MOCK_USER.monthlyUsed} /> / ${MOCK_USER.monthlyLimit.toLocaleString()} CAD
            </span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-dz-gold to-dz-gold-light rounded-full transition-all duration-1000 ease-out progress-animated"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>
      </Card>

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

      {/* 6. In-app ad space — Partner banner (Snoonu style) */}
      <div className="animate-stagger-in stagger-6">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-dz-cream border border-dz-gold/20 p-4 flex items-center gap-4 card-press">
          <div className="w-14 h-14 rounded-2xl bg-dz-gold/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-dz-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
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
