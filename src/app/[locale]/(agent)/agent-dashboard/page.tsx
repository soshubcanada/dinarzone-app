"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Types ----------
type TerminalState = "idle" | "scanning" | "review" | "processing" | "success";

interface PendingPickup {
  reference: string;
  clientName: string;
  phone: string;
  amountDZD: number;
  amountCAD: number;
  method: string;
  senderCountry: string;
}

interface TodayTransaction {
  id: string;
  time: string;
  client: string;
  amount: number;
  status: "completed" | "pending";
}

// ---------- Mock data ----------
const MOCK_PICKUP: PendingPickup = {
  reference: "DZ-2025-04-7832",
  clientName: "Fatima Benali",
  phone: "+213 555 12 34 56",
  amountDZD: 49_750,
  amountCAD: 500,
  method: "Cash Pickup",
  senderCountry: "CA",
};

const MOCK_TODAY: TodayTransaction[] = [
  { id: "T-001", time: "09:12", client: "Ahmed K.", amount: 14_925, status: "completed" },
  { id: "T-002", time: "10:45", client: "Nour B.", amount: 29_850, status: "completed" },
  { id: "T-003", time: "13:30", client: "Yacine M.", amount: 9_950, status: "pending" },
];

const AGENT_NAME = "Superette El Baraka";
const INITIAL_LIQUIDITY = 450_000;

// ---------- Animations ----------
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// ---------- Sidebar Clock ----------
function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-mono text-dz-gold text-lg font-bold">{time}</span>;
}

// ---------- Format currency ----------
function fmtDZD(n: number) {
  return new Intl.NumberFormat("fr-DZ", { style: "decimal" }).format(n) + " DZD";
}

// ---------- Page ----------
export default function AgentDashboardPage() {
  const [terminalState, setTerminalState] = useState<TerminalState>("idle");
  const [idVerified, setIdVerified] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [agentLiquidity, setAgentLiquidity] = useState(INITIAL_LIQUIDITY);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
  }, []);

  // Simulate QR scan
  const handleScan = () => {
    triggerHaptic();
    setTerminalState("scanning");
    setTimeout(() => setTerminalState("review"), 2000);
  };

  // Manual reference lookup
  const handleManualLookup = () => {
    if (!manualRef.trim()) return;
    triggerHaptic();
    setTerminalState("review");
  };

  // Confirm cash handout
  const handleConfirmPayout = () => {
    if (!idVerified) return;
    triggerHaptic();
    setTerminalState("processing");
    setTimeout(() => {
      setAgentLiquidity((l) => l - MOCK_PICKUP.amountDZD);
      setTerminalState("success");
      // Auto-return to idle
      setTimeout(() => {
        setTerminalState("idle");
        setIdVerified(false);
        setManualRef("");
      }, 3500);
    }, 1500);
  };

  // Cancel / back
  const handleCancel = () => {
    triggerHaptic();
    setTerminalState("idle");
    setIdVerified(false);
    setManualRef("");
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ============ Left: Agent info panel (visible on lg+) ============ */}
      <aside className="w-72 border-r border-dz-border-subtle bg-dz-card hidden lg:flex flex-col flex-shrink-0">
        {/* Agent identity */}
        <div className="p-6 border-b border-dz-border-subtle">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-dz-gold/20 border border-dz-gold flex items-center justify-center">
              <svg className="w-5 h-5 text-dz-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm text-dz-fg">{AGENT_NAME}</p>
              <p className="text-[10px] text-dz-green font-bold uppercase tracking-wider">En ligne</p>
            </div>
          </div>
          <LiveClock />
        </div>

        {/* Liquidity */}
        <div className="p-6 border-b border-dz-border-subtle">
          <p className="text-[10px] font-bold text-dz-fg-muted uppercase tracking-widest mb-1">
            Liquidite disponible
          </p>
          <p className="text-2xl font-bold text-dz-fg font-mono">{fmtDZD(agentLiquidity)}</p>
          <div className="mt-3 flex gap-2">
            <button className="flex-1 text-xs font-bold bg-white/5 border border-dz-border-subtle py-2 rounded-lg hover:bg-white/10 transition-colors text-dz-fg">
              Deposer
            </button>
            <button className="flex-1 text-xs font-bold bg-white/5 border border-dz-border-subtle py-2 rounded-lg hover:bg-white/10 transition-colors text-dz-fg">
              Historique
            </button>
          </div>
        </div>

        {/* Today's transactions */}
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-[10px] font-bold text-dz-fg-muted uppercase tracking-widest mb-3">
            Transactions du jour
          </p>
          <div className="space-y-2">
            {MOCK_TODAY.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between bg-dz-bg p-3 rounded-xl border border-dz-border-subtle"
              >
                <div>
                  <p className="text-xs font-bold text-dz-fg">{tx.client}</p>
                  <p className="text-[10px] text-dz-fg-muted">{tx.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-dz-fg">{fmtDZD(tx.amount)}</p>
                  <p
                    className={`text-[10px] font-bold ${
                      tx.status === "completed" ? "text-dz-green" : "text-dz-gold"
                    }`}
                  >
                    {tx.status === "completed" ? "Termine" : "En attente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ============ Main terminal area ============ */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* ---- IDLE: scan or manual entry ---- */}
            {terminalState === "idle" && (
              <motion.div key="idle" {...fadeIn} className="space-y-6">
                {/* QR scan button */}
                <button
                  onClick={handleScan}
                  className="w-full bg-dz-card border border-dz-border-subtle rounded-3xl p-10 flex flex-col items-center gap-4 hover:border-dz-gold/50 transition-colors group"
                >
                  <div className="w-20 h-20 rounded-2xl bg-dz-gold/10 border border-dz-gold/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-10 h-10 text-dz-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-dz-fg">Scanner le QR du client</span>
                  <span className="text-xs text-dz-fg-muted">
                    Pointez la camera vers le code QR affiche sur le telephone du client
                  </span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-dz-border-subtle" />
                  <span className="text-[10px] font-bold text-dz-fg-muted uppercase">ou</span>
                  <div className="flex-1 h-px bg-dz-border-subtle" />
                </div>

                {/* Manual reference input */}
                <div className="bg-dz-card border border-dz-border-subtle rounded-2xl p-6">
                  <label className="text-xs font-bold text-dz-fg-muted uppercase block mb-2">
                    Reference manuelle
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                      placeholder="DZ-2025-04-XXXX"
                      className="flex-1 bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 outline-none focus:border-dz-gold transition-colors font-mono text-sm text-dz-fg placeholder:text-dz-fg-muted/50"
                      onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
                    />
                    <button
                      onClick={handleManualLookup}
                      disabled={!manualRef.trim()}
                      className={`px-5 rounded-xl font-bold text-sm transition-all ${
                        manualRef.trim()
                          ? "bg-gradient-to-r from-dz-gold to-[#9A7A31] text-dz-bg active:scale-95"
                          : "bg-white/5 text-dz-fg-muted cursor-not-allowed"
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- SCANNING: camera viewfinder ---- */}
            {terminalState === "scanning" && (
              <motion.div
                key="scanning"
                {...fadeIn}
                className="bg-dz-card border border-dz-border-subtle rounded-3xl p-8 flex flex-col items-center"
              >
                <div className="relative w-56 h-56 mb-6">
                  {/* Viewfinder corners */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-dz-gold rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-dz-gold rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-dz-gold rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-dz-gold rounded-br-lg" />

                  {/* Animated laser line */}
                  <motion.div
                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-dz-gold to-transparent"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Center QR icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-dz-fg-muted/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    </svg>
                  </div>
                </div>

                <p className="text-sm font-bold text-dz-fg mb-1">Recherche du code QR...</p>
                <p className="text-xs text-dz-fg-muted mb-4">
                  Positionnez le code dans le cadre dore
                </p>

                <button
                  onClick={handleCancel}
                  className="text-xs font-bold text-dz-fg-muted hover:text-dz-fg transition-colors"
                >
                  Annuler
                </button>
              </motion.div>
            )}

            {/* ---- REVIEW: client info + AML verification ---- */}
            {(terminalState === "review" || terminalState === "processing") && (
              <motion.div
                key="review"
                {...fadeIn}
                className="bg-dz-card border border-dz-border-subtle rounded-3xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-dz-gold/10 to-transparent p-6 border-b border-dz-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-dz-fg-muted uppercase tracking-widest">
                      Demande de retrait
                    </p>
                    <span className="text-[10px] font-mono text-dz-gold bg-dz-gold/10 px-2 py-0.5 rounded-full border border-dz-gold/20">
                      {MOCK_PICKUP.reference}
                    </span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-dz-fg">
                    {fmtDZD(MOCK_PICKUP.amountDZD)}
                  </p>
                  <p className="text-xs text-dz-fg-muted mt-1">
                    Equivalent: {MOCK_PICKUP.amountCAD} CAD &middot; {MOCK_PICKUP.method}
                  </p>
                </div>

                {/* Client info */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-dz-fg-muted uppercase">Client</p>
                      <p className="text-sm font-bold text-dz-fg">{MOCK_PICKUP.clientName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-dz-fg-muted uppercase">Telephone</p>
                      <p className="text-sm font-mono text-dz-fg">{MOCK_PICKUP.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-dz-fg-muted uppercase">Pays expediteur</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-4 h-3 rounded-sm bg-white/10 flex items-center justify-center text-[8px] font-bold text-dz-fg-muted">
                          {MOCK_PICKUP.senderCountry}
                        </div>
                        <p className="text-sm text-dz-fg">Canada</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-dz-fg-muted uppercase">Methode</p>
                      <p className="text-sm text-dz-fg">{MOCK_PICKUP.method}</p>
                    </div>
                  </div>

                  {/* AML verification */}
                  <div className="bg-dz-bg border border-dz-border-subtle rounded-xl p-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-dz-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                      <p className="text-xs font-bold text-dz-fg uppercase">
                        Verification AML obligatoire
                      </p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={idVerified}
                        onChange={(e) => setIdVerified(e.target.checked)}
                        disabled={terminalState === "processing"}
                        className="mt-0.5 w-5 h-5 accent-[#B8923B] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-xs text-dz-fg-muted group-hover:text-dz-fg transition-colors leading-relaxed">
                        Je confirme avoir physiquement verifie la piece d&apos;identite du client
                        (CNI, passeport ou permis de conduire) et que les informations correspondent.
                      </span>
                    </label>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCancel}
                      disabled={terminalState === "processing"}
                      className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-white/5 border border-dz-border-subtle hover:bg-white/10 transition-colors text-dz-fg disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirmPayout}
                      disabled={!idVerified || terminalState === "processing"}
                      className={`flex-[2] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        idVerified && terminalState !== "processing"
                          ? "bg-gradient-to-r from-dz-green to-emerald-600 text-white active:scale-[0.98]"
                          : "bg-white/5 text-dz-fg-muted cursor-not-allowed"
                      }`}
                    >
                      {terminalState === "processing" ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Traitement...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                          </svg>
                          Confirmer le retrait
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- SUCCESS ---- */}
            {terminalState === "success" && (
              <motion.div
                key="success"
                {...fadeIn}
                className="bg-dz-card border border-dz-green/30 rounded-3xl p-10 flex flex-col items-center text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" as const, bounce: 0.5 }}
                  className="w-24 h-24 bg-gradient-to-br from-dz-green to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)] mb-6"
                >
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </motion.div>

                <h2 className="text-2xl font-serif font-bold mb-2 text-dz-fg">Retrait confirme</h2>
                <p className="text-3xl font-bold font-mono text-dz-green mb-1">
                  {fmtDZD(MOCK_PICKUP.amountDZD)}
                </p>
                <p className="text-sm text-dz-fg-muted mb-4">
                  Remis a {MOCK_PICKUP.clientName}
                </p>

                <div className="bg-dz-bg border border-dz-border-subtle rounded-xl px-4 py-3 w-full">
                  <p className="text-[10px] font-bold text-dz-fg-muted uppercase mb-1">
                    Nouvelle liquidite
                  </p>
                  <p className="text-lg font-bold font-mono text-dz-fg">
                    {fmtDZD(agentLiquidity)}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
