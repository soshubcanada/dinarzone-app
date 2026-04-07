"use client";

import { useState } from "react";
import { CORRIDORS } from "@/lib/constants/corridors";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FlagIcon from "@/components/ui/FlagIcon";

// Get unique source and destination countries
const SOURCE_COUNTRIES = Array.from(
  new Map(
    CORRIDORS.filter((c) => c.isActive).map((c) => [
      c.sourceCountry,
      { code: c.sourceCountry, flag: c.sourceFlag, name: c.sourceCountryName.fr },
    ])
  ).values()
);

export default function StepCorridor() {
  const wizard = useTransferWizard();
  const [from, setFrom] = useState(wizard.sourceCountry || "CA");
  const [to, setTo] = useState(wizard.destinationCountry || "DZ");

  // Get available destinations for selected source
  const availableDestinations = CORRIDORS.filter(
    (c) => c.isActive && c.sourceCountry === from
  ).map((c) => ({
    code: c.destinationCountry,
    flag: c.destinationFlag,
    name: c.destinationCountryName.fr,
  }));

  // Auto-fix: if current "to" is not available for "from", pick first available
  const validTo = availableDestinations.find((d) => d.code === to)
    ? to
    : availableDestinations[0]?.code || "";

  const selectedCorridor = CORRIDORS.find(
    (c) => c.sourceCountry === from && c.destinationCountry === validTo && c.isActive
  );

  const handleContinue = () => {
    if (!selectedCorridor) return;
    wizard.setCorridorStep({
      sourceCountry: selectedCorridor.sourceCountry,
      destinationCountry: selectedCorridor.destinationCountry,
      corridorId: selectedCorridor.id,
      sendCurrency: selectedCorridor.sourceCurrency,
      receiveCurrency: selectedCorridor.destinationCurrency,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dz-text mb-1">
          Choisissez votre corridor
        </h2>
        <p className="text-sm text-dz-text-secondary">
          D&apos;ou envoyez-vous et vers ou?
        </p>
      </div>

      {/* From country */}
      <div>
        <label className="block text-sm font-semibold text-dz-text-secondary mb-2 uppercase tracking-wider">
          Vous envoyez depuis
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SOURCE_COUNTRIES.map((country) => (
            <Card
              key={country.code}
              hover
              padding="sm"
              onClick={() => setFrom(country.code)}
              className={`
                cursor-pointer transition-all
                ${
                  from === country.code
                    ? "border-dz-green ring-2 ring-dz-green/20 bg-dz-green/5"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-3">
                <FlagIcon countryCode={country.code} size="md" />
                <div>
                  <p className="font-semibold text-sm text-dz-text">
                    {country.name}
                  </p>
                  <p className="text-xs text-dz-text-muted">{country.code}</p>
                </div>
                {from === country.code && (
                  <svg
                    className="w-5 h-5 text-dz-green ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Arrow separator */}
      <div className="flex justify-center">
        <div className="w-10 h-10 rounded-full bg-dz-cream flex items-center justify-center">
          <svg className="w-5 h-5 text-dz-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* To country */}
      <div>
        <label className="block text-sm font-semibold text-dz-text-secondary mb-2 uppercase tracking-wider">
          Ils recoivent dans
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availableDestinations.map((country) => (
            <Card
              key={country.code}
              hover
              padding="sm"
              onClick={() => setTo(country.code)}
              className={`
                cursor-pointer transition-all
                ${
                  validTo === country.code
                    ? "border-dz-green ring-2 ring-dz-green/20 bg-dz-green/5"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-3">
                <FlagIcon countryCode={country.code} size="md" />
                <div>
                  <p className="font-semibold text-sm text-dz-text">
                    {country.name}
                  </p>
                  <p className="text-xs text-dz-text-muted">{country.code}</p>
                </div>
                {validTo === country.code && (
                  <svg
                    className="w-5 h-5 text-dz-green ml-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handleContinue}
        disabled={!selectedCorridor}
      >
        Continuer
      </Button>
    </div>
  );
}
