"use client";

import React from "react";

interface Perk {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface UserStatusTierProps {
  tierName?: string;
  nextTierName?: string;
  currentVolume?: number;
  nextTierVolume?: number;
  perks?: Perk[];
  onViewDetails?: () => void;
}

const DEFAULT_PERKS: Perk[] = [
  {
    icon: (
      <svg className="w-5 h-5 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
      </svg>
    ),
    title: "Priorite de Traitement",
    description: "Vos transferts sont traites en priorite sur le reseau.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
      </svg>
    ),
    title: "Support Dedie 24/7",
    description: "Acces prioritaire au service client via WhatsApp.",
  },
];

export default function UserStatusTier({
  tierName = "DinarZone Plus",
  nextTierName = "Prestige",
  currentVolume = 3500,
  nextTierVolume = 5000,
  perks = DEFAULT_PERKS,
  onViewDetails,
}: UserStatusTierProps) {
  const progressPercentage = Math.min(
    (currentVolume / nextTierVolume) * 100,
    100
  );
  const remaining = nextTierVolume - currentVolume;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          Mon Statut
        </h2>
        <p className="text-[#7B8DB5]">
          Debloquez des avantages exclusifs a chaque palier.
        </p>
      </div>

      {/* Current Tier Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#004D26] to-[#070B14] border border-[#00A84D]/30 rounded-3xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A84D] rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[#00A84D] text-xs font-bold tracking-widest uppercase mb-1">
                Niveau Actuel
              </p>
              <h3 className="text-3xl font-serif font-bold text-white">
                {tierName}
              </h3>
            </div>
            <div className="bg-[#00873E]/20 border border-[#00A84D]/50 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00A84D] animate-pulse" />
              <span className="text-[#00A84D] text-xs font-bold">Actif</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white font-medium">
                {currentVolume.toLocaleString("fr-CA")} CAD envoyes
              </span>
              <span className="text-[#B8923B] font-bold">
                Objectif : {nextTierVolume.toLocaleString("fr-CA")} CAD
              </span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00A84D] to-[#B8923B] rounded-full relative transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white blur-sm opacity-50" />
              </div>
            </div>
            {remaining > 0 && (
              <p className="text-xs text-[#7B8DB5] mt-3">
                Plus que{" "}
                <span className="text-white font-bold">
                  {remaining.toLocaleString("fr-CA")} CAD
                </span>{" "}
                pour debloquer le statut {nextTierName}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Perks */}
      <h3 className="text-lg font-bold text-white mt-8 mb-4">
        Vos Avantages Actuels
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {perks.map((perk) => (
          <div
            key={perk.title}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 bg-[#00873E]/20 rounded-xl flex items-center justify-center mb-3">
              {perk.icon}
            </div>
            <h4 className="text-white font-bold text-sm mb-1">{perk.title}</h4>
            <p className="text-xs text-[#7B8DB5]">{perk.description}</p>
          </div>
        ))}
      </div>

      {/* Next Tier Teaser */}
      <div className="mt-8 bg-gradient-to-r from-[#B8923B]/10 to-transparent border border-[#B8923B]/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h4 className="text-[#B8923B] font-bold text-sm mb-1 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a.75.75 0 00.085-1.234L6.585 9.59a60.642 60.642 0 00-4.953-1.87.75.75 0 01-.231-1.337A60.65 60.65 0 0111.7 2.805z" />
              <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
              <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
            </svg>
            Prochain Niveau : {nextTierName}
          </h4>
          <p className="text-xs text-[#7B8DB5]">
            Debloque 0% de frais le week-end et des taux de change VIP.
          </p>
        </div>
        <button
          onClick={onViewDetails}
          className="text-xs font-bold bg-[#B8923B] text-black px-4 py-2 rounded-lg hover:scale-105 transition-transform flex-shrink-0"
        >
          Voir les details
        </button>
      </div>
    </div>
  );
}
