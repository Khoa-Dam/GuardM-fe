export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-[#e8edf2] animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-white/5 px-8 py-6">
        <div className="h-4 w-40 bg-white/10 rounded mb-2" />
        <div className="h-8 w-64 bg-white/10 rounded" />
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-white/5 bg-white/3 p-5 space-y-3">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-8 w-16 bg-white/10 rounded" />
              <div className="h-2 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg border border-white/5 bg-white/3 h-64" />
          <div className="rounded-lg border border-white/5 bg-white/3 h-64" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg border border-white/5 bg-white/3 p-6 space-y-3">
          <div className="h-4 w-32 bg-white/10 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-3 w-1/4 bg-white/8 rounded" />
              <div className="h-3 w-1/3 bg-white/8 rounded" />
              <div className="h-3 w-1/6 bg-white/8 rounded" />
              <div className="h-3 w-1/6 bg-white/8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
