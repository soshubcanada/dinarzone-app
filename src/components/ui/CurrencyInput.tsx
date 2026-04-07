"use client";

import { useState, useCallback } from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  currency: string;
  flag: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

function formatNumber(num: number): string {
  if (num === 0) return "";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function CurrencyInput({
  value,
  onChange,
  currency,
  flag,
  label,
  disabled = false,
  className = "",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value > 0 ? formatNumber(value) : ""
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, "");

      // Prevent multiple dots
      const parts = raw.split(".");
      const sanitized =
        parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;

      // Limit to 2 decimals
      const dotIndex = sanitized.indexOf(".");
      const limited =
        dotIndex !== -1
          ? sanitized.slice(0, dotIndex + 3)
          : sanitized;

      setDisplayValue(limited);

      const numericValue = parseFloat(limited) || 0;
      onChange(numericValue);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    if (value > 0) {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const handleFocus = useCallback(() => {
    if (value > 0) {
      setDisplayValue(String(value));
    }
  }, [value]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-dz-text-muted uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div
        className={`
          flex items-center h-[72px] rounded-2xl border-[1.5px] bg-white
          transition-all duration-200
          focus-within:ring-3 focus-within:ring-dz-green/12 focus-within:border-dz-green
          card-elevated
          ${disabled ? "bg-dz-cream-light/60 border-dz-border/30" : "border-dz-border/50"}
        `}
      >
        {/* Flag + Currency pill */}
        <div className="flex items-center gap-2 ml-3 px-3 py-2 rounded-xl bg-dz-cream/60">
          <span className="text-2xl leading-none">{flag}</span>
          <span className="text-sm font-bold text-dz-text">
            {currency}
          </span>
          {!disabled && (
            <svg className="w-3.5 h-3.5 text-dz-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          inputMode="decimal"
          value={disabled ? (value > 0 ? formatNumber(value) : "") : displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder="0.00"
          className="
            flex-1 h-full px-4 text-3xl font-bold text-dz-text text-right
            bg-transparent border-none outline-none
            placeholder:text-dz-text-muted/30 placeholder:font-light
            disabled:cursor-not-allowed disabled:text-dz-text-secondary
          "
        />
      </div>
    </div>
  );
}
