export default function AppLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome card skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-dz-green-darkest/80 to-dz-dark-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full skeleton opacity-20" />
          <div className="space-y-2">
            <div className="h-3 w-16 skeleton opacity-20 rounded" />
            <div className="h-5 w-28 skeleton opacity-20 rounded" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-24 skeleton opacity-20 rounded" />
            <div className="h-3 w-32 skeleton opacity-20 rounded" />
          </div>
          <div className="h-1.5 w-full skeleton opacity-20 rounded-full" />
        </div>
      </div>

      {/* Quick send cards skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-dz-border/40 bg-white p-4">
            <div className="w-10 h-10 rounded-xl skeleton mb-3" />
            <div className="h-4 w-16 skeleton rounded mb-2" />
            <div className="h-3 w-24 skeleton rounded" />
          </div>
        ))}
      </div>
      <div className="h-12 w-full skeleton rounded-2xl" />

      {/* Rates skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-24 skeleton rounded" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[170px] rounded-2xl border border-dz-border/40 bg-white p-4">
              <div className="flex gap-2 mb-3">
                <div className="w-6 h-6 rounded-full skeleton" />
                <div className="w-6 h-6 rounded-full skeleton" />
              </div>
              <div className="h-3 w-14 skeleton rounded mb-2" />
              <div className="h-6 w-20 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent transfers skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-28 skeleton rounded" />
        <div className="rounded-2xl border border-dz-border/40 bg-white overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-dz-border/10 last:border-0">
              <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 skeleton rounded" />
                <div className="h-3 w-36 skeleton rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 skeleton rounded" />
                <div className="h-5 w-14 skeleton rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
