import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { formatMoney } from "../../../shared/utils/format";
import { ResumenCard } from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export function AdminResumenPage() {
  const { data, isLoading, isError, refetch } = useResumenPedidos();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Resumen del negocio</h1>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Cargando indicadores">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError || !data ? (
        <EstadoError mensaje="No pudimos cargar el resumen." onReintentar={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos pendientes" valor={String(data.pendientes)} icono="⏳" acento="bg-amber-100" />
          <ResumenCard titulo="En preparación" valor={String(data.en_preparacion)} icono="👨‍🍳" acento="bg-sky-100" />
          <ResumenCard titulo="Entregados" valor={String(data.entregados)} icono="✅" acento="bg-green-100" />
          <ResumenCard titulo="Cancelados" valor={String(data.cancelados)} icono="🚫" acento="bg-stone-200" />
          <ResumenCard titulo="Pedidos de hoy" valor={String(data.pedidos_hoy)} icono="📅" acento="bg-violet-100" />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={formatMoney(data.ingresos_entregados)}
            icono="💰"
            acento="bg-emerald-100"
          />
        </div>
      )}
    </div>
  );
}
