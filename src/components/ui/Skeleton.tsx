import React from "react";

export function CardSkeleton() {
  return (
    <div className="w-full rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <div className="h-6 w-32 bg-white/10 rounded-md" />
          <div className="h-4 w-48 bg-white/10 rounded-md" />
        </div>
        <div className="h-10 w-10 rounded-full bg-white/10" />
      </div>

      <div className="h-16 w-full bg-white/10 rounded-2xl mt-8" />
    </div>
  );
}

export function PromoSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="shrink-0 w-[280px] h-[140px] rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-24 bg-white/10 rounded-md" />
            <div className="h-5 w-36 bg-white/10 rounded-md" />
            <div className="h-3 w-44 bg-white/10 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RateCardSkeleton() {
  return (
    <div className="flex gap-2.5 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="shrink-0 w-[150px] rounded-2xl bg-white border border-dz-border/30 p-3.5 relative overflow-hidden"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-black/5 to-transparent" />
          <div className="space-y-2">
            <div className="flex gap-1.5">
              <div className="h-5 w-5 rounded-full bg-gray-100" />
              <div className="h-5 w-5 rounded-full bg-gray-100" />
            </div>
            <div className="h-3 w-12 bg-gray-100 rounded" />
            <div className="h-6 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-10 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransferRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-dz-border/15">
      <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 bg-gray-100 rounded" />
        <div className="h-3 w-40 bg-gray-100 rounded" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-4 w-20 bg-gray-100 rounded ml-auto" />
        <div className="h-4 w-14 bg-gray-100 rounded ml-auto" />
      </div>
    </div>
  );
}
