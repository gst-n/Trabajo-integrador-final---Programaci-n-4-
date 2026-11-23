import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonFilas } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { Modal } from "../../../shared/ui/Modal";
import { formatMoney } from "../../../shared/utils/format";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoForm } from "../components/ProductoForm";
import { StockForm } from "../components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoInput, ProductoStockInput } from "../types";

type ModalEstado =
  | { tipo: "crear" }
  | { tipo: "editar"; producto: Producto }
  | { tipo: "stock"; producto: Producto }
  | null;

export function AdminProductosPage() {
  const [modal, setModal] = useState<ModalEstado>(null);
  const [aEliminar, setAEliminar] = useState<Producto | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // El panel pide limit=100 y pagina del lado del cliente.
  const { data, isLoading, isError, refetch } = useProductos({
    search: "",
    categoria_id: null,
    pagina: 0,
    limite: 100,
  });
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const abrir = (estado: ModalEstado) => {
    setErrorForm(null);
    setModal(estado);
  };

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        header: "Producto",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.imagen_url ? (
              <img src={row.original.imagen_url} alt="" className="size-10 rounded-lg object-cover" loading="lazy" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-lg bg-stone-100" aria-hidden="true">
                🍽️
              </span>
            )}
            <span className="font-medium">{row.original.nombre}</span>
          </div>
        ),
      },
      { header: "Categoría", cell: ({ row }) => row.original.categoria?.nombre ?? "—" },
      { header: "Precio", cell: ({ row }) => formatMoney(row.original.precio_base) },
      {
        header: "Stock",
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? "font-semibold text-red-600" : ""}>{row.original.stock}</span>
        ),
      },
      {
        header: "Disponible",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.original.disponible ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
            }`}
          >
            {row.original.disponible ? "Sí" : "No"}
          </span>
        ),
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => abrir({ tipo: "editar", producto: row.original })}>
              Editar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => abrir({ tipo: "stock", producto: row.original })}>
              Stock
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                eliminar.reset();
                setAEliminar(row.original);
              }}
            >
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [eliminar],
  );

  const guardarProducto = async (input: ProductoInput) => {
    setErrorForm(null);
    try {
      if (modal?.tipo === "editar") {
        await actualizar.mutateAsync({ id: modal.producto.id, input });
      } else {
        await crear.mutateAsync(input);
      }
      setModal(null);
    } catch (e) {
      setErrorForm(handleApiError(e, "No se pudo guardar el producto"));
    }
  };

  const guardarStock = async (input: ProductoStockInput) => {
    if (modal?.tipo !== "stock") return;
    setErrorForm(null);
    try {
      await actualizarStock.mutateAsync({ id: modal.producto.id, input });
      setModal(null);
    } catch (e) {
      setErrorForm(handleApiError(e, "No se pudo actualizar el stock"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Productos</h1>
        <Button onClick={() => abrir({ tipo: "crear" })}>+ Nuevo producto</Button>
      </div>

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No pudimos cargar los productos." onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio titulo="No hay productos" descripcion="Creá el primero para empezar a vender." />
      ) : (
        data && <DataTable data={data.items} columns={columns} />
      )}

      {modal && (modal.tipo === "crear" || modal.tipo === "editar") && (
        <Modal
          titulo={modal.tipo === "crear" ? "Nuevo producto" : "Editar producto"}
          onClose={() => setModal(null)}
          ancho="lg"
        >
          <ProductoForm
            inicial={modal.tipo === "editar" ? modal.producto : undefined}
            categorias={categorias}
            error={errorForm}
            onSubmit={guardarProducto}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.tipo === "stock" && (
        <Modal titulo="Stock y disponibilidad" onClose={() => setModal(null)}>
          <StockForm producto={modal.producto} error={errorForm} onSubmit={guardarStock} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Dar de baja producto"
          mensaje={`«${aEliminar.nombre}» dejará de mostrarse en el catálogo. Los pedidos existentes conservan su copia.`}
          confirmar="Dar de baja"
          cargando={eliminar.isPending}
          error={eliminar.isError ? handleApiError(eliminar.error, "No se pudo dar de baja") : null}
          onConfirm={() => eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
