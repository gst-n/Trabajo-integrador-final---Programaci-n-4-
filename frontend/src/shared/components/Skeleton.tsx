export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />;
}

/** Cuadrícula de tarjetas fantasma mientras carga el catálogo. */
export function SkeletonTarjetas({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Cargando productos"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
          <Skeleton className="h-40 rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Filas fantasma para tablas y listas. */
export function SkeletonFilas({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Cargando">
      {Array.from({ length: cantidad }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
