"use client";

import React from "react";
import Link from "next/link";

interface PromoCarouselProps {
  locale?: string;
}

export default function PromoCarousel({ locale = "fr" }: PromoCarouselProps) {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 py-1 px-1 -mx-1">
      {/* Banner 1: Ramadan / Zero Fees */}
      <Link href={`/${locale}/send?to=DZ`} className="snap-center shrink-0 w-[280px] block">
        <div className="h-[140px] rounded-2xl bg-gradient-to-r from-[#004D26] to-[#002A14] relative overflow-hidden border border-[#006A33]/30 shadow-md card-press">
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M220 40 A 30 30 0 1 0 250 70 A 40 40 0 0 1 220 40 Z" fill="#B8923B" />
              <circle cx="180" cy="30" r="2" fill="white" className="animate-pulse" />
              <circle cx="260" cy="100" r="1.5" fill="white" className="animate-[pulse_3s_infinite]" />
            </svg>
          </div>
          <div className="relative z-10 p-5 flex flex-col justify-center h-full">
            <span className="bg-[#B8923B] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md w-max mb-2">
              Special Ramadan
            </span>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">0 Frais d&apos;envoi</h3>
            <p className="text-[#A1AECB] text-xs">Vers l&apos;Algerie et la Tunisie</p>
          </div>
        </div>
      </Link>

      {/* Banner 2: Referral Program */}
      <Link href={`/${locale}/profile`} className="snap-center shrink-0 w-[280px] block">
        <div className="h-[140px] rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] relative overflow-hidden border border-white/5 shadow-md card-press">
          <div className="absolute right-0 bottom-0 opacity-40 translate-x-4 translate-y-4">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#00A84D" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
            </svg>
          </div>
          <div className="relative z-10 p-5 flex flex-col justify-center h-full">
            <span className="bg-[#00873E] text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md w-max mb-2">
              Parrainage
            </span>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">Gagnez 20 CAD</h3>
            <p className="text-[#A1AECB] text-xs">Pour chaque ami invite</p>
          </div>
        </div>
      </Link>

      {/* Banner 3: Cash Pickup */}
      <Link href={`/${locale}/agents`} className="snap-center shrink-0 w-[280px] block">
        <div className="h-[140px] rounded-2xl bg-gradient-to-r from-[#3D2B0F] to-[#1A1207] relative overflow-hidden border border-[#B8923B]/20 shadow-md card-press">
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-15">
            <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#B8923B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="relative z-10 p-5 flex flex-col justify-center h-full">
            <span className="bg-[#B8923B]/80 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md w-max mb-2">
              Nouveau
            </span>
            <h3 className="text-white font-bold text-lg leading-tight mb-1">Cash Pickup</h3>
            <p className="text-[#A1AECB] text-xs">+200 points de retrait en DZ &amp; TN</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
