"use client";

import { useTransferStore } from "@/store/useTransferStore";

export default function SendError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const resetStore = useTransferStore((s) => s.reset);

  const handleReset = () => {
    resetStore();
    reset();
  };

  return (
    <div className="bg-dz-card border border-dz-border-subtle rounded-3xl p-6 shadow-xl text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-dz-fg mb-2">
        Erreur lors du transfert
      </h2>
      <p className="text-sm text-dz-fg-muted mb-6">
        Vos fonds n&apos;ont pas ete debites. Veuillez reessayer.
      </p>
      <button
        onClick={handleReset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00873E] to-[#006A33] text-white font-semibold text-sm"
      >
        Recommencer le transfert
      </button>
    </div>
  );
}
