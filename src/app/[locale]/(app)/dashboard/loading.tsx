export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-pulse w-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-32 bg-white/10 rounded-lg" />
        <div className="h-10 w-10 bg-white/10 rounded-full" />
      </div>

      {/* Hero Welcome Card Skeleton */}
      <div className="w-full h-48 bg-gradient-to-r from-white/5 to-white/10 rounded-3xl border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute top-6 left-6 h-8 w-48 bg-white/10 rounded-md" />
        <div className="absolute bottom-6 left-6 h-12 w-32 bg-white/10 rounded-xl" />
        <div className="absolute bottom-6 right-6 h-12 w-32 bg-white/10 rounded-xl" />
      </div>

      {/* Quick Actions Grid Skeleton */}
      <div className="grid grid-cols-4 gap-4 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 bg-white/10 rounded-full" />
            <div className="h-3 w-16 bg-white/10 rounded-md" />
          </div>
        ))}
      </div>

      {/* Live Rates Skeleton */}
      <div className="mt-4">
        <div className="h-6 w-40 bg-white/10 rounded-md mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[160px] h-20 bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="h-4 w-20 bg-white/10 rounded-md mb-2" />
              <div className="h-6 w-24 bg-white/10 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
