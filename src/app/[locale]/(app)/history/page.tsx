"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ---------- Mock data ----------
const MOCK_TRANSACTIONS = [
  {
    id: "TRX-2026-0041",
    recipientName: "Fatima Benali",
    country: "DZ",
    amountSent: "$500 CAD",
    amountReceived: "49,750 DZD",
    status: "delivered" as const,
    date: "5 avr. 2026",
    method: "Baridimob",
  },
  {
    id: "TRX-2026-0040",
    recipientName: "Mohamed Trabelsi",
    country: "TN",
    amountSent: "$500 CAD",
    amountReceived: "1,140 TND",
    status: "processing" as const,
    date: "4 avr. 2026",
    method: "Virement bancaire",
  },
  {
    id: "TRX-2026-0039",
    recipientName: "Ahmed Khelifi",
    country: "DZ",
    amountSent: "$150 CAD",
    amountReceived: "14,925 DZD",
    status: "delivered" as const,
    date: "28 mars 2026",
    method: "CCP",
  },
  {
    id: "TRX-2026-0038",
    recipientName: "Yasmine Boudiaf",
    country: "DZ",
    amountSent: "$200 CAD",
    amountReceived: "19,900 DZD",
    status: "delivered" as const,
    date: "22 mars 2026",
    method: "Agent cash",
  },
  {
    id: "TRX-2026-0037",
    recipientName: "Salma Gharbi",
    country: "TN",
    amountSent: "$300 CAD",
    amountReceived: "684 TND",
    status: "failed" as const,
    date: "18 mars 2026",
    method: "Virement bancaire",
  },
  {
    id: "TRX-2026-0036",
    recipientName: "Rachid Bouzid",
    country: "DZ",
    amountSent: "$100 CAD",
    amountReceived: "9,950 DZD",
    status: "delivered" as const,
    date: "12 mars 2026",
    method: "Baridimob",
  },
  {
    id: "TRX-2026-0035",
    recipientName: "Nadia Mansouri",
    country: "DZ",
    amountSent: "$750 CAD",
    amountReceived: "74,625 DZD",
    status: "delivered" as const,
    date: "5 mars 2026",
    method: "CCP",
  },
  {
    id: "TRX-2026-0034",
    recipientName: "Karim Ait-Ahmed",
    country: "DZ",
    amountSent: "$1,000 CAD",
    amountReceived: "99,500 DZD",
    status: "processing" as const,
    date: "1 mars 2026",
    method: "Agent cash",
  },
];

const STATUS_MAP: Record<string, { label: string; color: "green" | "gold" | "red" | "gray" }> = {
  delivered: { label: "Livre", color: "green" },
  processing: { label: "En cours", color: "gold" },
  failed: { label: "Echoue", color: "red" },
  cancelled: { label: "Annule", color: "red" },
  draft: { label: "Brouillon", color: "gray" },
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "delivered", label: "Livre" },
  { value: "processing", label: "En cours" },
  { value: "failed", label: "Echoue" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function HistoryPage() {
  const { locale } = useParams<{ locale: string }>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered =
    statusFilter === "all"
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.status === statusFilter);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-dz-text">Historique</h1>
        <p className="text-sm text-dz-text-muted mt-0.5">
          Tous vos transferts
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        {/* Status filter */}
        <div className="relative flex-1">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setVisibleCount(6);
            }}
            className="w-full h-10 pl-9 pr-4 bg-white border border-dz-border/40 rounded-xl text-sm font-medium text-dz-text appearance-none focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green/40 transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Filter icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            />
          </svg>
          {/* Chevron */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {/* Transaction count */}
        <span className="text-xs text-dz-text-muted whitespace-nowrap">
          {filtered.length} transfert{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Transaction list */}
      {filtered.length === 0 ? (
        /* Empty state */
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dz-cream flex items-center justify-center">
            <svg
              className="w-8 h-8 text-dz-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-dz-text mb-1">Aucun transfert</h3>
          <p className="text-sm text-dz-text-muted mb-4">
            Vos transferts apparaitront ici une fois effectues.
          </p>
          <Link href={`/${locale}/send`}>
            <Button size="sm">Envoyer de l&apos;argent</Button>
          </Link>
        </Card>
      ) : (
        <Card padding="none">
          {visible.map((transfer, index) => {
            const statusInfo = STATUS_MAP[transfer.status];
            const initials = getInitials(transfer.recipientName);
            const isLast = index === visible.length - 1;

            return (
              <Link
                key={transfer.id}
                href={`/${locale}/track/${transfer.id}`}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-dz-cream/40 transition-colors cursor-pointer ${
                    !isLast ? "border-b border-dz-border/20" : ""
                  } animate-stagger-in stagger-${Math.min(index + 1, 5)}`}
                >
                  {/* Initials circle */}
                  <div className="w-10 h-10 rounded-full bg-dz-green/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-dz-green">
                      {initials}
                    </span>
                  </div>

                  {/* Name and meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-dz-text truncate">
                      {transfer.recipientName}
                    </p>
                    <p className="text-xs text-dz-text-muted">
                      {transfer.date} &middot; {transfer.amountSent}
                    </p>
                  </div>

                  {/* Amount and status */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-dz-text">
                      {transfer.amountReceived}
                    </p>
                    <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </Card>
      )}

      {/* Load more */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVisibleCount((c) => c + 6)}
            icon={
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            }
          >
            Voir plus
          </Button>
        </div>
      )}
    </div>
  );
}
