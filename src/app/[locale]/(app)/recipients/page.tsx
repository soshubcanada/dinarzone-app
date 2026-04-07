"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import FlagIcon from "@/components/ui/FlagIcon";
import Button from "@/components/ui/Button";

// ---------- Mock data ----------
interface Recipient {
  id: string;
  name: string;
  country: string;
  deliveryMethod: string;
  lastUsed: string;
  accountHint: string;
}

const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: "r1",
    name: "Fatima Benali",
    country: "DZ",
    deliveryMethod: "Baridimob",
    lastUsed: "5 avr. 2026",
    accountHint: "***4521",
  },
  {
    id: "r2",
    name: "Ahmed Khelifi",
    country: "DZ",
    deliveryMethod: "CCP",
    lastUsed: "28 mars 2026",
    accountHint: "***7890",
  },
  {
    id: "r3",
    name: "Mohamed Trabelsi",
    country: "TN",
    deliveryMethod: "Virement bancaire",
    lastUsed: "4 avr. 2026",
    accountHint: "***3344",
  },
  {
    id: "r4",
    name: "Yasmine Boudiaf",
    country: "DZ",
    deliveryMethod: "Agent cash",
    lastUsed: "22 mars 2026",
    accountHint: "",
  },
  {
    id: "r5",
    name: "Salma Gharbi",
    country: "TN",
    deliveryMethod: "Virement bancaire",
    lastUsed: "18 mars 2026",
    accountHint: "***5566",
  },
];

const METHOD_ICONS: Record<string, React.ReactNode> = {
  Baridimob: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  CCP: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  ),
  "Virement bancaire": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
    </svg>
  ),
  "Agent cash": (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function RecipientsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");

  const filtered = MOCK_RECIPIENTS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-dz-text">Destinataires</h1>
        <p className="text-sm text-dz-text-muted mt-0.5">
          Vos contacts enregistres
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dz-text-muted pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un destinataire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 bg-white border border-dz-border/40 rounded-xl text-sm text-dz-text placeholder:text-dz-text-muted/60 focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green/40 transition-colors"
        />
      </div>

      {/* Recipient list */}
      {filtered.length === 0 ? (
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
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-dz-text mb-1">
            {search ? "Aucun resultat" : "Aucun destinataire"}
          </h3>
          <p className="text-sm text-dz-text-muted mb-4">
            {search
              ? "Essayez un autre nom."
              : "Ajoutez un destinataire pour envoyer de l'argent rapidement."}
          </p>
        </Card>
      ) : (
        <Card padding="none">
          {filtered.map((recipient, index) => {
            const initials = getInitials(recipient.name);
            const isLast = index === filtered.length - 1;
            const methodIcon = METHOD_ICONS[recipient.deliveryMethod] || null;

            return (
              <Link
                key={recipient.id}
                href={`/${locale}/send?recipient=${recipient.id}`}
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

                  {/* Name, country, method */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-dz-text truncate">
                        {recipient.name}
                      </p>
                      <FlagIcon countryCode={recipient.country} size="sm" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {methodIcon && (
                        <span className="text-dz-text-muted">{methodIcon}</span>
                      )}
                      <span className="text-xs text-dz-text-muted">
                        {recipient.deliveryMethod}
                        {recipient.accountHint ? ` ${recipient.accountHint}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Last used + chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-dz-text-muted hidden sm:block">
                      {recipient.lastUsed}
                    </span>
                    <svg
                      className="w-4 h-4 text-dz-text-muted"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </Card>
      )}

      {/* Floating action button - Add recipient */}
      <div className="fixed bottom-24 right-5 z-30">
        <button
          className="w-14 h-14 rounded-full btn-gradient flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          aria-label="Ajouter un destinataire"
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
