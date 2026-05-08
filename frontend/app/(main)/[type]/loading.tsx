export default function TypePageLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/5" />
          <div className="h-9 w-48 rounded-xl bg-white/5" />
        </div>
        <div className="h-5 w-80 rounded-lg bg-white/5" />
      </div>

      {/* FilterBar skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="h-11 w-full rounded-xl bg-white/5" />
      </div>

      {/* Review card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-white/5 overflow-hidden"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Cover placeholder */}
            <div className="h-44 bg-white/5" />
            {/* Content */}
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-white/5" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
