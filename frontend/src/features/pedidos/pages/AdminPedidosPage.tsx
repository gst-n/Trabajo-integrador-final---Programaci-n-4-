import { useCallback, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonFilas } from "../../../shared/components/Skeleton";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { estiloCampo } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { PedidosTable } from "../components/PedidosTable";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, TRANSICIONES, type EstadoPedido, type Pedido } from "../types";

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);

  // El panel pide limit=100 y pagina del lado del cliente con TanStack Table.
  const { data, isLoading, isError, refetch } = usePedidos({ estado, pagina: 0, limite: 100 });
  const cambiarEstado = useCambiarEstadoPedido();

  const verDetalle = useCallback((p: Pedido) => setDetalle(p), []);

  const avanzar = useCallback(
    (p: Pedido, nuevo: EstadoPedido) => {
      if (nuevo === "CANCELADO") {
        cambiarEstado.reset();
        setACancelar(p);
        return;
      }
      cambiarEstado.mutate({ id: p.id, estado: nuevo });
    },
    [cambiarEstado],
  );

  const renderAcciones = useCallback(
    (p: Pedido) =>
      TRANSICIONES[p.estado].map((siguiente) => (
        <Button
          key={siguiente}
          size="sm"
          variant={siguiente === "CANCELADO" ? "danger" : "primary"}
          disabled={cambiarEstado.isPending}
          onClick={() => avanzar(p, siguiente)}
        >
          {ETIQUETA_ACCION[siguiente]}
        </Button>
      )),
    [avanzar, cambiarEstado.isPending],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-stone-900">Pedidos</h1>
        <div>
          <label htmlFor="filtro-estado" className="mb-1 block text-xs font-medium text-stone-500">
            Filtrar por estado
          </label>
          <select
            id="filtro-estado"
            className={`${estiloCampo} w-52`}
            value={estado ?? ""}
            onChange={(e) => setEstado(ESTADOS.find((s) => s === e.target.value) ?? null)}
          >
            <option value="">Todos</option>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cambiarEstado.isError && !aCancelar && (
        <div className="mb-4">
          <Alert>{handleApiError(cambiarEstado.error, "No se pudo cambiar el estado")}</Alert>
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No pudimos cargar los pedidos." onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos" descripcion="No hay pedidos con ese filtro." />
      ) : (
        data && <PedidosTable pedidos={data.items} onVer={verDetalle} renderAcciones={renderAcciones} mostrarCliente />
      )}

      {detalle && (
        <Modal titulo={`Pedido #${detalle.id}`} onClose={() => setDetalle(null)} ancho="lg">
          <PedidoDetalle pedido={detalle} />
        </Modal>
      )}

      {aCancelar && (
        <ConfirmDialog
          titulo={`Cancelar pedido #${aCancelar.id}`}
          mensaje="Se cancelará el pedido y se restituirá el stock de cada línea. Esta acción no se puede deshacer."
          confirmar="Cancelar pedido"
          cargando={cambiarEstado.isPending}
          error={cambiarEstado.isError ? handleApiError(cambiarEstado.error, "No se pudo cancelar") : null}
          onConfirm={() =>
            cambiarEstado.mutate({ id: aCancelar.id, estado: "CANCELADO" }, { onSuccess: () => setACancelar(null) })
          }
          onCancel={() => setACancelar(null)}
        />
      )}
    </div>
  );
}
