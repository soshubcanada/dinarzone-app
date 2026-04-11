"use client";

import React from "react";

interface HeroWelcomeCardProps {
  userName?: string;
  monthlyLimit?: number;
  monthlyUsed?: number;
  kycLabel?: string;
  onUpgrade?: () => void;
}

export default function HeroWelcomeCard({
  userName = "Patrick",
  monthlyLimit = 2000,
  monthlyUsed = 650,
  kycLabel = "Verifie",
  onUpgrade,
}: HeroWelcomeCardProps) {
  const usedPercent = (monthlyUsed / monthlyLimit) * 100;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#070B14] to-[#003A1C] p-6 shadow-2xl border border-white/10">
      {/* Background SVG Illustration - Geometric Islamic/Modern Tech Fusion */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-50 250C150 150 250 300 450 50"
          stroke="#00A84D"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="animate-[pulse_4s_ease-in-out_infinite]"
        />
        <circle cx="350" cy="50" r="80" fill="url(#grad_gold_hero)" opacity="0.1" />
        <path
          d="M0 200L50 150L100 200L150 150L200 200"
          stroke="#B8923B"
          strokeWidth="1"
          opacity="0.3"
        />
        <defs>
          <radialGradient
            id="grad_gold_hero"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(350 50) rotate(90) scale(80)"
          >
            <stop stopColor="#B8923B" />
            <stop offset="1" stopColor="#B8923B" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating Animated Coins / Transfer Nodes */}
      <div className="absolute top-4 right-8 w-12 h-12 bg-gradient-to-br from-[#00A84D] to-[#006A33] rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-[-10px] right-24 w-16 h-16 bg-[#B8923B] rounded-full blur-2xl opacity-40 animate-[pulse_6s_ease-in-out_infinite]" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-1">
              Bonjour, {userName}
            </h2>
            <p className="text-sm text-[#7B8DB5]">
              Pret a soutenir vos proches aujourd&apos;hui ?
            </p>
          </div>
          {/* User Avatar */}
          <div className="h-10 w-10 rounded-full bg-[#00873E] flex items-center justify-center border-2 border-[#00A84D] shadow-[0_0_15px_rgba(0,168,77,0.4)]">
            <span className="text-white font-bold text-sm">
              {userName.charAt(0)}
            </span>
          </div>
        </div>

        {/* KYC badge */}
        {kycLabel && (
          <div className="flex items-center gap-1.5 mb-4">
            <svg className="w-3.5 h-3.5 text-dz-gold" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[11px] font-semibold text-dz-gold tracking-wide uppercase">
              {kycLabel}
            </span>
          </div>
        )}

        {/* Action Button & Stats inside Hero */}
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
          <div>
            <p className="text-xs text-[#7B8DB5] uppercase tracking-wider mb-1">
              Limite mensuelle
            </p>
            <p className="text-white font-semibold">
              {monthlyUsed.toLocaleString("fr-CA")}{" "}
              <span className="text-white/40 text-sm font-normal">
                / {monthlyLimit.toLocaleString("fr-CA")} CAD
              </span>
            </p>
            {/* Mini progress bar */}
            <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-dz-gold to-dz-gold-light rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-[#B8923B] to-[#9A7A31] text-white text-sm font-bold py-2 px-5 rounded-xl hover:scale-105 transition-transform shadow-lg"
          >
            Augmenter
          </button>
        </div>
      </div>
    </div>
  );
}
