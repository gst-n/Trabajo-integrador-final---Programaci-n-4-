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
import { CategoriaForm } from "../components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaInput } from "../types";

type ModalEstado = { tipo: "crear" } | { tipo: "editar"; categoria: Categoria } | null;

export function AdminCategoriasPage() {
  const [modal, setModal] = useState<ModalEstado>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { header: "ID", cell: ({ row }) => <span className="text-stone-400">#{row.original.id}</span> },
      { header: "Nombre", cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span> },
      {
        header: "Descripción",
        cell: ({ row }) => <span className="text-stone-500">{row.original.descripcion ?? "—"}</span>,
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setErrorForm(null);
                setModal({ tipo: "editar", categoria: row.original });
              }}
            >
              Editar
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

  const guardar = async (input: CategoriaInput) => {
    setErrorForm(null);
    try {
      if (modal?.tipo === "editar") {
        await actualizar.mutateAsync({ id: modal.categoria.id, input });
      } else {
        await crear.mutateAsync(input);
      }
      setModal(null);
    } catch (e) {
      setErrorForm(handleApiError(e, "No se pudo guardar la categoría"));
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Categorías</h1>
        <Button
          onClick={() => {
            setErrorForm(null);
            setModal({ tipo: "crear" });
          }}
        >
          + Nueva categoría
        </Button>
      </div>

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No pudimos cargar las categorías." onReintentar={() => void refetch()} />
      ) : data && data.length === 0 ? (
        <EstadoVacio titulo="No hay categorías" descripcion="Creá la primera para organizar el catálogo." />
      ) : (
        data && <DataTable data={data} columns={columns} />
      )}

      {modal && (
        <Modal
          titulo={modal.tipo === "crear" ? "Nueva categoría" : "Editar categoría"}
          onClose={() => setModal(null)}
        >
          <CategoriaForm
            inicial={modal.tipo === "editar" ? modal.categoria : undefined}
            error={errorForm}
            onSubmit={guardar}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Dar de baja categoría"
          mensaje={`«${aEliminar.nombre}» dejará de mostrarse. Sus productos no se ocultan: darlos de baja es un paso aparte. El nombre seguirá reservado.`}
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
