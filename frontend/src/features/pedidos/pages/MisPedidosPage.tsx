import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { SkeletonFilas } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { Modal } from "../../../shared/ui/Modal";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { PedidosTable } from "../components/PedidosTable";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types";

const LIMITE = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);

  const { data, isLoading, isError, refetch } = usePedidos({ estado: null, pagina, limite: LIMITE });
  const cancelar = useCancelarPedido();

  const verDetalle = useCallback((p: Pedido) => setDetalle(p), []);
  const pedirCancelar = useCallback((p: Pedido) => {
    cancelar.reset();
    setACancelar(p);
  }, [cancelar]);

  const renderAcciones = useCallback(
    (p: Pedido) =>
      p.estado === "PENDIENTE" ? (
        <Button size="sm" variant="danger" onClick={() => pedirCancelar(p)}>
          Cancelar
        </Button>
      ) : null,
    [pedirCancelar],
  );

  const confirmarCancelacion = () => {
    if (!aCancelar) return;
    cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Mis pedidos</h1>

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No pudimos cargar tus pedidos." onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          descripcion="Cuando confirmes uno, lo vas a ver acá."
          accion={
            <Link to="/" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
              Ver catálogo
            </Link>
          }
        />
      ) : (
        data && (
          <>
            <PedidosTable pedidos={data.items} onVer={verDetalle} renderAcciones={renderAcciones} paginar={false} />
            <Paginacion pagina={pagina} total={data.total} limite={LIMITE} onCambiar={setPagina} />
          </>
        )
      )}

      {detalle && (
        <Modal titulo={`Pedido #${detalle.id}`} onClose={() => setDetalle(null)} ancho="lg">
          <PedidoDetalle pedido={detalle} />
        </Modal>
      )}

      {aCancelar && (
        <ConfirmDialog
          titulo={`Cancelar pedido #${aCancelar.id}`}
          mensaje="Se cancelará el pedido y el stock de sus productos se restituirá. Esta acción no se puede deshacer."
          confirmar="Cancelar pedido"
          cargando={cancelar.isPending}
          error={cancelar.isError ? handleApiError(cancelar.error, "No se pudo cancelar el pedido") : null}
          onConfirm={confirmarCancelacion}
          onCancel={() => setACancelar(null)}
        />
      )}
    </div>
  );
}
