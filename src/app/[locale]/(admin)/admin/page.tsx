"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Types ----------
interface Transaction {
  id: string;
  date: string;
  client: string;
  recipient: string;
  rip: string;
  send: string;
  receive: string;
  status: "PENDING_PAYMENT" | "PAID_CAD" | "COMPLETED" | "FAILED";
}

type TabFilter = "pending" | "all";

// ---------- KPI data ----------
const KPIS = [
  { label: "Volume (24h)", value: "14 250 CAD", trend: "+12%", color: "text-dz-fg" },
  { label: "Virements a traiter", value: "8", trend: "Action requise", color: "text-dz-gold" },
  { label: "Revenu Frais (24h)", value: "142,50 CAD", trend: "+5%", color: "text-dz-green" },
];

// ---------- Mock transactions ----------
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "DZ-A8F2-9K4P", date: "2026-04-09 10:30", client: "Nabila Dahmani", recipient: "Fatima Khelifi", rip: "007 99999 0000000000 12", send: "1 000,00 CAD", receive: "99 500 DZD", status: "PAID_CAD" },
  { id: "DZ-X7M1-2L9Q", date: "2026-04-09 09:15", client: "Karim Yelles", recipient: "Amine Yelles", rip: "007 88888 1111111111 34", send: "500,00 CAD", receive: "49 750 DZD", status: "COMPLETED" },
  { id: "DZ-B4N9-5V2C", date: "2026-04-09 08:45", client: "Sarah Benali", recipient: "Mehdi Benali", rip: "007 77777 2222222222 56", send: "2 500,00 CAD", receive: "248 750 DZD", status: "PAID_CAD" },
  { id: "DZ-P2W8-7T4R", date: "2026-04-08 22:10", client: "Yanis Lounes", recipient: "Agence Oran Centre", rip: "Retrait Especes", send: "300,00 CAD", receive: "29 850 DZD", status: "PENDING_PAYMENT" },
];

// ---------- Status badge ----------
function StatusBadge({ status }: { status: Transaction["status"] }) {
  const config = {
    PAID_CAD: {
      bg: "bg-dz-gold/10 border-dz-gold/30",
      text: "text-dz-gold",
      dot: "bg-dz-gold",
      label: "A Traiter",
      pulse: true,
    },
    COMPLETED: {
      bg: "bg-dz-green/10 border-[#00A84D]/30",
      text: "text-dz-green",
      dot: "bg-dz-green",
      label: "Livre",
      pulse: false,
    },
    PENDING_PAYMENT: {
      bg: "bg-white/5 border-white/10",
      text: "text-dz-fg-muted",
      dot: "bg-dz-fg-muted",
      label: "Attente Paiement",
      pulse: false,
    },
    FAILED: {
      bg: "bg-dz-red/10 border-dz-red/30",
      text: "text-dz-red",
      dot: "bg-dz-red",
      label: "Echoue",
      pulse: false,
    },
  }[status];

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} ${config.pulse ? "animate-pulse" : ""}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ---------- Page ----------
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabFilter>("pending");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const handleProcessPayout = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: "COMPLETED" as const } : tx))
    );
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([15, 50, 20]);
    }
  }, []);

  const pendingCount = transactions.filter((t) => t.status === "PAID_CAD").length;

  const filteredTx = transactions.filter((tx) => {
    const matchesTab = activeTab === "all" || tx.status === "PAID_CAD";
    if (!matchesTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tx.id.toLowerCase().includes(q) ||
      tx.client.toLowerCase().includes(q) ||
      tx.recipient.toLowerCase().includes(q) ||
      tx.rip.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Top header */}
      <header className="h-20 border-b border-dz-border-subtle px-8 flex items-center justify-between bg-dz-bg/80 backdrop-blur-md flex-shrink-0">
        <h1 className="text-xl font-serif font-bold text-dz-fg">
          File d&apos;attente BaridiMob
        </h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white/5 border border-dz-border-subtle rounded-lg text-sm font-bold text-dz-fg-muted hover:text-dz-fg transition-colors">
            Exporter CSV
          </button>
          <div className="px-4 py-2 bg-dz-green/10 border border-[#00A84D]/30 rounded-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dz-green animate-pulse" />
            <span className="text-xs font-bold text-dz-green">Systeme en ligne</span>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-dz-card border border-dz-border-subtle p-6 rounded-2xl shadow-lg"
            >
              <p className="text-sm font-bold text-dz-fg-muted mb-2">{kpi.label}</p>
              <div className="flex items-end justify-between">
                <h3 className={`text-3xl font-bold tabular-nums ${kpi.color}`}>
                  {kpi.value}
                </h3>
                <span className="text-xs font-bold text-dz-fg-muted/50">{kpi.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction table */}
        <div className="bg-dz-card border border-dz-border-subtle rounded-2xl shadow-xl flex flex-col">
          {/* Tabs + search */}
          <div className="p-4 border-b border-dz-border-subtle flex items-center justify-between">
            <div className="flex bg-dz-bg p-1 rounded-lg border border-dz-border-subtle">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  activeTab === "pending"
                    ? "bg-dz-gold/20 text-dz-gold border border-dz-gold/30"
                    : "text-dz-fg-muted hover:text-dz-fg"
                }`}
              >
                A Traiter ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-white/10 text-dz-fg border border-dz-border-subtle"
                    : "text-dz-fg-muted hover:text-dz-fg"
                }`}
              >
                Toutes
              </button>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (Nom, Code, RIP)..."
              className="bg-dz-bg border border-dz-border-subtle rounded-lg px-4 py-2 text-sm outline-none focus:border-dz-green transition-colors w-64 text-dz-fg placeholder:text-dz-fg-muted/50"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dz-bg/50 text-dz-fg-muted text-xs uppercase tracking-wider border-b border-dz-border-subtle">
                  <th className="p-4 font-bold">Ref &amp; Date</th>
                  <th className="p-4 font-bold">Expediteur</th>
                  <th className="p-4 font-bold">Destinataire (Algerie)</th>
                  <th className="p-4 font-bold text-right">Montants</th>
                  <th className="p-4 font-bold text-center">Statut</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredTx.map((tx) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-dz-border-subtle hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-mono text-sm font-bold text-dz-fg">{tx.id}</p>
                        <p className="text-xs text-dz-fg-muted">{tx.date}</p>
                      </td>
                      <td className="p-4 font-bold text-sm text-dz-fg">{tx.client}</td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-dz-fg">{tx.recipient}</p>
                        <p className="text-xs font-mono text-dz-green">{tx.rip}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-bold text-sm text-dz-green tabular-nums">
                          {tx.receive}
                        </p>
                        <p className="text-xs text-dz-fg-muted tabular-nums">{tx.send}</p>
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="p-4 text-right">
                        {tx.status === "PAID_CAD" ? (
                          <button
                            onClick={() => handleProcessPayout(tx.id)}
                            className="px-4 py-2 bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-bg text-xs font-bold rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                          >
                            Marquer Livre
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-dz-fg-muted">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-dz-fg-muted">
                      Aucune transaction a afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
