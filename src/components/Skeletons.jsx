export function ProductCardSkeleton() {
  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -translate-x-full" />
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-gray-100" />
        <div className="h-5 w-1/3 bg-gray-50" />
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="relative overflow-hidden flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-100">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -translate-x-full" />
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-48 bg-gray-100" />
        <div className="h-4 w-20 bg-gray-50" />
        <div className="h-4 w-16 bg-gray-50" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-6 w-24 bg-gray-100" />
        <div className="h-4 w-16 bg-gray-50" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden h-4 bg-gray-100 rounded"
          style={{ width: `${100 - i * 15}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -translate-x-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="relative overflow-hidden flex items-center gap-4 p-4 bg-white border border-gray-50 rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer -translate-x-full" />
          <div className="w-12 h-12 bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-gray-100" />
            <div className="h-3 w-24 bg-gray-50" />
          </div>
          <div className="h-4 w-16 bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
