"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ---------- Types ----------
interface TicketData {
  amount: string;
  currency: string;
  recipient: string;
  reference: string;
  agentName: string;
  date: string;
}

// ---------- Mock data (TODO: fetch from API via transfer ID) ----------
const MOCK_TICKET: TicketData = {
  amount: "248,750",
  currency: "DZD",
  recipient: "Sarah Benali",
  reference: "DZ-B4N9-5V2C",
  agentName: "Superette El Baraka",
  date: "09 Avril 2026",
};

const QR_EXPIRY_SECONDS = 180; // 3 minutes

// ---------- QR placeholder grid ----------
function QRPlaceholder() {
  return (
    <div className="w-48 h-48 bg-white p-2 grid grid-cols-7 grid-rows-7 gap-[2px]">
      {Array.from({ length: 49 }).map((_, i) => {
        // Create a deterministic QR-like pattern
        const row = Math.floor(i / 7);
        const col = i % 7;
        const isCorner =
          (row < 3 && col < 3) ||
          (row < 3 && col > 3) ||
          (row > 3 && col < 3);
        const isCenter = row === 3 && col === 3;
        const isFill = isCorner || isCenter || (i * 7 + 3) % 5 < 2;
        return (
          <div
            key={i}
            className={`rounded-[1px] ${isFill ? "bg-black" : "bg-white"}`}
          />
        );
      })}
    </div>
  );
}

// ---------- Page ----------
export default function WithdrawalTicketPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_SECONDS);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen bg-dz-bg flex flex-col items-center pt-12 px-4 pb-12 font-sans text-dz-fg">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <button
          onClick={() => router.push(`/${loc}/dashboard`)}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-dz-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-dz-fg">Billet de Retrait</h1>
        <div className="w-10 h-10" />
      </div>

      {/* Brightness warning */}
      <div className="w-full max-w-md mb-6 flex items-center justify-center gap-2 text-dz-gold bg-dz-gold/10 py-2 px-4 rounded-full text-xs font-bold">
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
        Augmentez la luminosite pour le scan
      </div>

      {/* Apple Wallet-style ticket */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-gradient-to-b from-[#0F1523] to-[#1A2235] border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
      >
        {/* Top accent bar */}
        <div className="h-2 w-full bg-gradient-to-r from-dz-green to-dz-gold" />

        <div className="p-8 flex flex-col items-center">
          <p className="text-sm font-bold text-dz-fg-muted uppercase tracking-widest mb-2">
            Montant a retirer
          </p>
          <h2 className="text-4xl font-bold tabular-nums text-dz-fg mb-8">
            {MOCK_TICKET.amount}{" "}
            <span className="text-xl text-dz-green">{MOCK_TICKET.currency}</span>
          </h2>

          {/* QR Code zone (white background for IR scanners) */}
          <div className="bg-white p-4 rounded-3xl shadow-inner mb-6 relative overflow-hidden">
            {/* TODO: Replace with <QRCodeSVG> from qrcode.react */}
            <QRPlaceholder />

            {/* Animated scan line */}
            {!isExpired && (
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute left-0 right-0 h-0.5 bg-dz-green shadow-[0_0_15px_rgba(0,168,77,0.8)] z-10"
              />
            )}

            {/* Expired overlay */}
            {isExpired && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-3xl">
                <svg className="w-10 h-10 text-red-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-xs font-bold text-red-500">Code expire</p>
              </div>
            )}
          </div>

          {/* Security countdown */}
          <div className="flex items-center gap-2 mb-8">
            <span
              className={`w-2 h-2 rounded-full ${
                isExpired ? "bg-red-500" : "bg-dz-green animate-pulse"
              }`}
            />
            <p className="text-xs font-bold text-dz-fg-muted">
              {isExpired ? (
                <span className="text-red-400">Code expire — demandez un nouveau</span>
              ) : (
                <>
                  Code valide pour{" "}
                  <span className="text-dz-fg font-mono">
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Transaction details */}
          <div className="w-full space-y-4 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dz-fg-muted">Beneficiaire</span>
              <span className="text-sm font-bold text-dz-fg">{MOCK_TICKET.recipient}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-dz-fg-muted">Reference</span>
              <span className="text-sm font-mono font-bold text-dz-fg">{MOCK_TICKET.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-dz-fg-muted">Point de retrait</span>
              <span className="text-sm font-bold text-dz-gold">{MOCK_TICKET.agentName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-dz-fg-muted">Date</span>
              <span className="text-sm text-dz-fg">{MOCK_TICKET.date}</span>
            </div>
          </div>
        </div>

        {/* Ticket notches */}
        <div className="absolute top-[62%] -left-4 w-8 h-8 bg-dz-bg rounded-full" />
        <div className="absolute top-[62%] -right-4 w-8 h-8 bg-dz-bg rounded-full" />
        <div className="absolute top-[62%] left-4 right-4 border-t-2 border-dashed border-white/10" />
      </motion.div>

      {/* Instructions */}
      <p className="text-center text-dz-fg-muted text-xs mt-8 px-8 max-w-sm">
        Presentez ce code a l&apos;agent DinarZone avec une{" "}
        <span className="font-bold text-dz-fg">piece d&apos;identite valide</span>{" "}
        pour recuperer vos fonds.
      </p>
    </div>
  );
}
