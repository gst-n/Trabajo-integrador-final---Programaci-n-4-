import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { SkeletonFilas } from "../../../shared/components/Skeleton";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import type { UserPublic } from "../../auth/types";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";

export function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario);
  const { data, isLoading, isError, refetch } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const pendiente = activar.isPending || desactivar.isPending;

  const columns = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      { header: "Usuario", cell: ({ row }) => <span className="font-medium">{row.original.username}</span> },
      { header: "Nombre", cell: ({ row }) => row.original.full_name },
      { header: "Email", cell: ({ row }) => <span className="text-stone-500">{row.original.email}</span> },
      {
        header: "Rol",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.original.role === "admin" ? "bg-violet-100 text-violet-600" : "bg-stone-100 text-stone-600"
            }`}
          >
            {row.original.role === "admin" ? "Admin" : "Cliente"}
          </span>
        ),
      },
      {
        header: "Estado",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              row.original.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-800"
            }`}
          >
            {row.original.disabled ? "Desactivado" : "Activo"}
          </span>
        ),
      },
      {
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          const esYo = sesion?.id === u.id;
          return (
            <div className="flex gap-1.5">
              {u.disabled && (
                <Button size="sm" variant="secondary" disabled={pendiente} onClick={() => activar.mutate(u.id)}>
                  Activar
                </Button>
              )}
              {/* El botón Desactivar no se muestra en la fila del usuario de la sesión */}
              {!u.disabled && !esYo && (
                <Button size="sm" variant="danger" disabled={pendiente} onClick={() => desactivar.mutate(u.id)}>
                  Desactivar
                </Button>
              )}
              {esYo && <span className="text-xs text-stone-400">Sos vos</span>}
            </div>
          );
        },
      },
    ],
    [sesion?.id, pendiente, activar, desactivar],
  );

  const errorAccion = activar.error ?? desactivar.error;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Usuarios</h1>

      {errorAccion && (
        <div className="mb-4">
          <Alert>{handleApiError(errorAccion, "No se pudo actualizar el usuario")}</Alert>
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje="No pudimos cargar los usuarios." onReintentar={() => void refetch()} />
      ) : (
        data && <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
