"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import FlagIcon from "@/components/ui/FlagIcon";

// ---------- Mock data ----------
const MOCK_TRANSFER = {
  id: "TRX-2026-0041",
  trackingCode: "DZ-2026-0041-XKFR",
  status: "in_transit" as const,
  recipientName: "Fatima Benali",
  recipientCountry: "DZ",
  deliveryMethod: "Baridimob",
  amountSent: "500.00 CAD",
  amountReceived: "49,750 DZD",
  rate: "1 CAD = 99.50 DZD",
  fee: "4.99 CAD",
  createdAt: "5 avr. 2026, 14:23",
};

type StepStatus = "completed" | "current" | "upcoming";

interface TimelineStep {
  label: string;
  timestamp: string | null;
  note: string | null;
  status: StepStatus;
}

const MOCK_TIMELINE: TimelineStep[] = [
  {
    label: "Transfert initie",
    timestamp: "5 avr. 2026, 14:23",
    note: "Paiement recu par Interac e-Transfer",
    status: "completed",
  },
  {
    label: "Verification en cours",
    timestamp: "5 avr. 2026, 14:25",
    note: "Conformite validee automatiquement",
    status: "completed",
  },
  {
    label: "En transit",
    timestamp: "5 avr. 2026, 14:30",
    note: "Fonds en cours d'acheminement vers l'Algerie",
    status: "current",
  },
  {
    label: "Disponible au retrait",
    timestamp: null,
    note: null,
    status: "upcoming",
  },
  {
    label: "Livre au destinataire",
    timestamp: null,
    note: null,
    status: "upcoming",
  },
];

export default function TrackingPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(MOCK_TRANSFER.trackingCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back link */}
      <Link
        href={`/${locale}/history`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-dz-text-secondary hover:text-dz-text transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Historique
      </Link>

      {/* Tracking code card */}
      <Card
        variant="dark"
        padding="lg"
        className="bg-gradient-to-br from-dz-green-darkest via-dz-dark to-dz-dark-card text-center relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-dz-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-dz-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
            Code de suivi
          </p>
          <p className="text-2xl font-bold text-white tracking-widest mb-3 font-mono">
            {MOCK_TRANSFER.trackingCode}
          </p>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm text-dz-green-light hover:text-dz-green transition-colors font-medium"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Copie !
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
                Copier
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-4">
          Suivi en temps reel
        </h3>

        <div className="relative pl-8">
          {MOCK_TIMELINE.map((step, index) => {
            const isLast = index === MOCK_TIMELINE.length - 1;

            return (
              <div
                key={index}
                className={`relative pb-6 ${isLast ? "pb-0" : ""} animate-stagger-in stagger-${Math.min(index + 1, 5)}`}
              >
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={`absolute left-[-20px] top-6 w-0.5 h-full ${
                      step.status === "completed"
                        ? "bg-dz-green"
                        : step.status === "current"
                        ? "bg-gradient-to-b from-dz-gold to-dz-border/30"
                        : "border-l border-dashed border-dz-border/40"
                    }`}
                  />
                )}

                {/* Dot */}
                <div
                  className={`absolute left-[-26px] top-0.5 w-3 h-3 rounded-full border-2 ${
                    step.status === "completed"
                      ? "bg-dz-green border-dz-green"
                      : step.status === "current"
                      ? "bg-dz-gold border-dz-gold animate-pulse"
                      : "bg-white border-dz-border/50"
                  }`}
                />

                {/* Content */}
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      step.status === "completed"
                        ? "text-dz-text"
                        : step.status === "current"
                        ? "text-dz-gold"
                        : "text-dz-text-muted"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-dz-text-muted mt-0.5">
                      {step.timestamp}
                    </p>
                  )}
                  {step.note && (
                    <p className="text-xs text-dz-text-secondary mt-1 leading-relaxed">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer details */}
      <Card padding="md">
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-3">
          Details du transfert
        </h3>

        <div className="space-y-3">
          {/* Amounts */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-secondary">Montant envoye</span>
            <span className="text-sm font-semibold text-dz-text">{MOCK_TRANSFER.amountSent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-secondary">Montant recu</span>
            <span className="text-sm font-bold text-dz-green">{MOCK_TRANSFER.amountReceived}</span>
          </div>
          <div className="h-px bg-dz-border/20" />

          {/* Rate and fee */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-secondary">Taux de change</span>
            <span className="text-sm text-dz-text">{MOCK_TRANSFER.rate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-secondary">Frais</span>
            <span className="text-sm text-dz-text">{MOCK_TRANSFER.fee}</span>
          </div>
          <div className="h-px bg-dz-border/20" />

          {/* Recipient */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-secondary">Destinataire</span>
            <div className="flex items-center gap-1.5">
              <FlagIcon countryCode={MOCK_TRANSFER.recipientCountry} size="sm" />
              <span className="text-sm font-medium text-dz-text">{MOCK_TRANSFER.recipientName}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-dz-text-secondary">Mode de livraison</span>
            <Badge color="gray">{MOCK_TRANSFER.deliveryMethod}</Badge>
          </div>
        </div>
      </Card>

      {/* Share on WhatsApp */}
      <Button
        fullWidth
        variant="secondary"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        }
      >
        Partager sur WhatsApp
      </Button>
    </div>
  );
}
