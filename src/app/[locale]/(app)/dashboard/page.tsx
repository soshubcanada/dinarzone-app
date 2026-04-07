"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import FlagIcon from "@/components/ui/FlagIcon";

// Mock data
const MOCK_USER = {
  name: "Karim",
  kycTier: "tier_2" as const,
  kycLabel: "Verifie",
  monthlyLimit: 2000,
  monthlyUsed: 650,
};

const MOCK_RATES = [
  { from: "CAD", fromFlag: "CA", to: "DZD", toFlag: "DZ", rate: 99.5, trend: "up" as const },
  { from: "CAD", fromFlag: "CA", to: "TND", toFlag: "TN", rate: 2.28, trend: "up" as const },
  { from: "QAR", fromFlag: "QA", to: "DZD", toFlag: "DZ", rate: 37.2, trend: "down" as const },
  { from: "QAR", fromFlag: "QA", to: "TND", toFlag: "TN", rate: 0.85, trend: "up" as const },
];

const MOCK_TRANSFERS = [
  {
    id: "1",
    recipientName: "Fatima Benali",
    country: "DZ",
    amount: "49,750 DZD",
    amountSent: "$500 CAD",
    status: "delivered" as const,
    date: "3 avr. 2026",
  },
  {
    id: "2",
    recipientName: "Mohamed Trabelsi",
    country: "TN",
    amount: "1,140 TND",
    amountSent: "$500 CAD",
    status: "processing" as const,
    date: "5 avr. 2026",
  },
  {
    id: "3",
    recipientName: "Ahmed Khelifi",
    country: "DZ",
    amount: "14,925 DZD",
    amountSent: "$150 CAD",
    status: "delivered" as const,
    date: "28 mars 2026",
  },
];

const STATUS_MAP: Record<string, { label: string; color: "green" | "gold" | "red" | "gray" }> = {
  delivered: { label: "Livre", color: "green" },
  processing: { label: "En cours", color: "gold" },
  failed: { label: "Echoue", color: "red" },
  cancelled: { label: "Annule", color: "red" },
  draft: { label: "Brouillon", color: "gray" },
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function DashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const usedPercent = (MOCK_USER.monthlyUsed / MOCK_USER.monthlyLimit) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome card - gradient dark with avatar */}
      <Card variant="dark" padding="lg" className="bg-gradient-to-br from-dz-green-darkest via-dz-dark to-dz-dark-card overflow-hidden relative">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-dz-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-dz-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* User initial avatar */}
            <div className="w-12 h-12 rounded-full bg-dz-green/20 border border-dz-green/30 flex items-center justify-center">
              <span className="text-lg font-bold text-dz-green-light">{MOCK_USER.name[0]}</span>
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium mb-0.5 uppercase tracking-wider">
                Bienvenue
              </p>
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

        {/* Monthly limit progress */}
        <div className="relative mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/40 text-xs">Limite mensuelle</span>
            <span className="text-white/90 text-xs font-semibold">
              ${MOCK_USER.monthlyUsed.toLocaleString()} / ${MOCK_USER.monthlyLimit.toLocaleString()} CAD
            </span>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-dz-gold to-dz-gold-light rounded-full transition-all duration-700"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Quick Send - Two corridor cards side by side */}
      <div>
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/${locale}/send?to=DZ`}>
            <Card hover interactive padding="md" className="bg-gradient-to-br from-white to-dz-cream-light h-full">
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-dz-green/8 flex items-center justify-center">
                  <FlagIcon countryCode="DZ" size="md" />
                </div>
                <div>
                  <p className="font-semibold text-dz-text text-[15px]">Algerie</p>
                  <p className="text-xs text-dz-text-muted mt-0.5">1 CAD = 99.5 DZD</p>
                </div>
                <div className="flex items-center gap-1 text-dz-green text-xs font-medium mt-auto">
                  <span>Envoyer</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
          <Link href={`/${locale}/send?to=TN`}>
            <Card hover interactive padding="md" className="bg-gradient-to-br from-white to-dz-cream-light h-full">
              <div className="flex flex-col items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-dz-red/6 flex items-center justify-center">
                  <FlagIcon countryCode="TN" size="md" />
                </div>
                <div>
                  <p className="font-semibold text-dz-text text-[15px]">Tunisie</p>
                  <p className="text-xs text-dz-text-muted mt-0.5">1 CAD = 2.28 TND</p>
                </div>
                <div className="flex items-center gap-1 text-dz-green text-xs font-medium mt-auto">
                  <span>Envoyer</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Full width send button below */}
        <Link href={`/${locale}/send`} className="block mt-3">
          <Button fullWidth size="lg">
            Envoyer de l&apos;argent
          </Button>
        </Link>
      </div>

      {/* Live Rates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider">
            Taux en direct
          </h3>
          <span className="text-[11px] text-dz-text-muted">
            <svg className="w-3 h-3 inline mr-0.5 -mt-px" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
            Mis a jour il y a 2 min
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {MOCK_RATES.map((rate, i) => (
            <Card
              key={`${rate.from}-${rate.to}`}
              className={`flex-shrink-0 w-[170px] animate-stagger-in stagger-${i + 1}`}
              padding="sm"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <FlagIcon countryCode={rate.fromFlag} size="sm" />
                <svg className="w-3 h-3 text-dz-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <FlagIcon countryCode={rate.toFlag} size="sm" />
              </div>
              <p className="text-[11px] text-dz-text-muted mb-0.5">
                1 {rate.from} =
              </p>
              <div className="flex items-end gap-1.5">
                <p className="text-xl font-bold text-dz-text number-highlight">
                  {rate.rate}
                </p>
                <span className="text-xs font-medium text-dz-text-secondary mb-0.5">{rate.to}</span>
                {/* Trend arrow */}
                <span className={`ml-auto mb-0.5 ${rate.trend === "up" ? "text-dz-success" : "text-dz-red"}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    {rate.trend === "up" ? (
                      <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06l-5.47-5.47V19.5a.75.75 0 01-.75.75z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v13.19l5.47-5.47a.75.75 0 111.06 1.06l-6.75 6.75a.75.75 0 01-1.06 0l-6.75-6.75a.75.75 0 111.06-1.06l5.47 5.47V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    )}
                  </svg>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transfers - Wise activity feed style */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider">
            Transferts recents
          </h3>
          <Link
            href={`/${locale}/history`}
            className="inline-flex items-center gap-1 text-sm font-medium text-dz-green hover:text-dz-green-dark transition-colors"
          >
            Voir tout
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
              <div
                key={transfer.id}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-dz-cream/40 transition-colors cursor-pointer ${
                  !isLast ? "border-b border-dz-border/20" : ""
                } animate-stagger-in stagger-${index + 1}`}
              >
                {/* Initials circle */}
                <div className="w-10 h-10 rounded-full bg-dz-cream flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-dz-text-secondary">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-dz-text truncate">
                    {transfer.recipientName}
                  </p>
                  <p className="text-xs text-dz-text-muted">
                    {transfer.date} &middot; {transfer.amountSent}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-dz-text">
                    {transfer.amount}
                  </p>
                  <Badge color={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Agent Locator Promo */}
      <Card variant="outline" className="border-dz-border/30 overflow-hidden">
        <div className="flex items-center gap-4">
          {/* Map icon illustration */}
          <div className="w-12 h-12 rounded-2xl bg-dz-green/8 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-dz-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dz-text text-[15px] mb-0.5">
              Trouvez un point de retrait
            </h3>
            <p className="text-xs text-dz-text-secondary leading-relaxed">
              Localisez un agent pres de votre famille
            </p>
          </div>
          <Link href={`/${locale}/agents`}>
            <div className="w-9 h-9 rounded-xl bg-dz-cream flex items-center justify-center hover:bg-dz-green/10 transition-colors">
              <svg className="w-5 h-5 text-dz-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
