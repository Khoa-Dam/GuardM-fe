export default function ReportsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header card */}
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted/60 rounded" />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-7 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Reports table */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-8 w-48 bg-muted rounded" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
              <div className="h-3 w-3 rounded-full bg-muted flex-shrink-0" />
              <div className="h-3 flex-1 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted/60 rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
          ))}
        </div>

        {/* My reports */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
              <div className="h-3 flex-1 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
