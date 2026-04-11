"use client";

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

interface OtpInputProps {
  phone?: string;
  length?: number;
  onComplete?: (code: string) => void;
  onResend?: () => void;
}

export default function OtpInput({
  phone = "+974 •••• 4827",
  length = 6,
  onComplete,
  onResend,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [countdown, setCountdown] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Fire onComplete when all digits entered
  const checkComplete = useCallback(
    (newOtp: string[]) => {
      const code = newOtp.join("");
      if (code.length === length && newOtp.every((d) => d !== "")) {
        onComplete?.(code);
      }
    },
    [length, onComplete]
  );

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    checkComplete(newOtp);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length)
      .split("");
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[
      pastedData.length < length ? pastedData.length : length - 1
    ]?.focus();

    checkComplete(newOtp);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(59);
    setOtp(Array(length).fill(""));
    inputRefs.current[0]?.focus();
    onResend?.();
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <p className="text-sm text-dz-text-muted">
          Entrez le code a {length} chiffres envoy&eacute; au {phone}
        </p>
      </div>

      <div
        className="flex justify-between gap-2 mb-8"
        role="group"
        aria-label={`Saisie du code a ${length} chiffres`}
        onPaste={handlePaste}
      >
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            aria-label={`Chiffre ${index + 1} sur ${length}`}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-14 text-center text-2xl font-bold text-dz-text bg-dz-cream border border-dz-border rounded-xl focus:border-dz-green focus:ring-1 focus:ring-dz-green/30 transition-all outline-none"
          />
        ))}
      </div>

      <button
        onClick={() => onComplete?.(otp.join(""))}
        className="w-full bg-gradient-to-r from-[#00873E] to-[#006A33] text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,168,77,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Confirmer
      </button>

      <p
        onClick={handleResend}
        className={`text-center text-sm mt-6 transition-colors ${
          countdown > 0
            ? "text-dz-text-muted cursor-default"
            : "text-dz-text-muted cursor-pointer hover:text-dz-text"
        }`}
      >
        {countdown > 0 ? (
          <>
            Renvoyer le code dans{" "}
            <span className="text-[#B8923B]">
              00:{countdown.toString().padStart(2, "0")}
            </span>
          </>
        ) : (
          <span className="text-dz-green font-semibold">
            Renvoyer le code
          </span>
        )}
      </p>
    </div>
  );
}
