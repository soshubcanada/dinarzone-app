export default function AuthLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="h-5 w-28 skeleton rounded" />
      </div>
      <div className="h-7 w-48 skeleton rounded" />
      <div className="h-4 w-64 skeleton rounded" />
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 skeleton rounded" />
            <div className="h-12 w-full skeleton rounded-xl" />
          </div>
        ))}
        <div className="h-12 w-full skeleton rounded-2xl mt-4" />
      </div>
    </div>
  );
}
