"use client";

import React, { useState } from "react";

interface Device {
  name: string;
  icon: string;
  isCurrent?: boolean;
  lastSeen?: string;
}

interface SecurityCenterProps {
  initialLimit?: number;
  devices?: Device[];
  onLimitChange?: (limit: number) => void;
  onRevokeDevice?: (deviceName: string) => void;
}

export default function SecurityCenter({
  initialLimit = 2000,
  devices = [
    { name: "iPhone 14 Pro", icon: "\u{1F34F}", isCurrent: true },
    { name: "Chrome sur macOS", icon: "\u{1F4BB}", lastSeen: "Derniere connexion hier" },
  ],
  onLimitChange,
  onRevokeDevice,
}: SecurityCenterProps) {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [internationalTransfers, setInternationalTransfers] = useState(true);
  const [transferLimit, setTransferLimit] = useState(initialLimit);

  const handleLimitChange = (value: number) => {
    setTransferLimit(value);
    onLimitChange?.(value);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">Securite</h2>
        <p className="text-[#7B8DB5]">Gerez vos limites et protegez votre compte.</p>
      </div>

      {/* Section : Transaction Controls */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
          Limites et Restrictions
        </h3>

        {/* Monthly Limit Slider */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-white">
              Plafond d&apos;envoi mensuel
            </label>
            <span className="text-sm font-bold text-[#B8923B] bg-[#B8923B]/10 px-3 py-1 rounded-lg">
              {transferLimit.toLocaleString("fr-CA")} CAD
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="10000"
            step="500"
            value={transferLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="w-full h-2 bg-[#070B14] rounded-lg appearance-none cursor-pointer accent-[#00A84D]"
          />
          <div className="flex justify-between text-xs text-[#7B8DB5] mt-2">
            <span>500</span>
            <span>10,000+</span>
          </div>
        </div>

        <hr className="border-white/10 mb-6" />

        {/* Security Toggles */}
        <div className="space-y-6">
          <ToggleRow
            title="Transferts Internationaux"
            description="Autoriser l'envoi de fonds vers l'etranger"
            enabled={internationalTransfers}
            onToggle={() => setInternationalTransfers(!internationalTransfers)}
          />
          <ToggleRow
            title="Connexion Biometrique"
            description="FaceID / TouchID pour acceder a l'app"
            enabled={biometricEnabled}
            onToggle={() => setBiometricEnabled(!biometricEnabled)}
          />
        </div>
      </div>

      {/* Section : Connected Devices */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#00A84D]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
            <path
              fillRule="evenodd"
              d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75C16.004 3 16.5 3.504 16.5 4.125v15.75c0 .621-.496 1.125-1.125 1.125h-6.75A1.125 1.125 0 017.5 19.875V4.125z"
              clipRule="evenodd"
            />
          </svg>
          Appareils Actifs
        </h3>

        <div className="space-y-4">
          {devices.map((device) => (
            <div
              key={device.name}
              className={`flex items-center justify-between p-4 rounded-2xl ${
                device.isCurrent
                  ? "bg-white/5 border border-[#00A84D]/30"
                  : "bg-transparent border border-white/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    device.isCurrent ? "bg-[#00873E]/20" : "bg-white/5 opacity-60"
                  }`}
                >
                  {device.icon}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{device.name}</p>
                  <p
                    className={`text-xs ${
                      device.isCurrent ? "text-[#00A84D]" : "text-[#7B8DB5]"
                    }`}
                  >
                    {device.isCurrent
                      ? "Cet appareil \u2022 En ligne"
                      : device.lastSeen}
                  </p>
                </div>
              </div>
              {!device.isCurrent && (
                <button
                  onClick={() => onRevokeDevice?.(device.name)}
                  className="text-xs font-bold text-[#D21034] hover:bg-[#D21034]/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Revoquer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="text-xs text-[#7B8DB5]">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          enabled ? "bg-[#00873E]" : "bg-white/20"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
