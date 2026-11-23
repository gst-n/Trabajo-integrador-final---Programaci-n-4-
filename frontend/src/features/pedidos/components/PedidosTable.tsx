import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, type ReactNode } from "react";
import { DataTable } from "../../../shared/components/DataTable";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { formatFecha, formatMoney } from "../../../shared/utils/format";
import type { Pedido } from "../types";

interface PedidosTableProps {
  pedidos: Pedido[];
  onVer: (pedido: Pedido) => void;
  renderAcciones?: (pedido: Pedido) => ReactNode;
  mostrarCliente?: boolean;
  /** Paginación del lado del cliente. Desactivarla cuando el servidor ya pagina. */
  paginar?: boolean;
}

export function PedidosTable({
  pedidos,
  onVer,
  renderAcciones,
  mostrarCliente = false,
  paginar = true,
}: PedidosTableProps) {
  const columns = useMemo<ColumnDef<Pedido>[]>(() => {
    const cols: ColumnDef<Pedido>[] = [
      { header: "Pedido", cell: ({ row }) => <span className="font-semibold">#{row.original.id}</span> },
      { header: "Fecha", cell: ({ row }) => formatFecha(row.original.created_at) },
    ];
    if (mostrarCliente) {
      cols.push({ header: "Cliente", cell: ({ row }) => `Usuario #${row.original.usuario_id}` });
    }
    cols.push(
      {
        header: "Pago",
        cell: ({ row }) => (row.original.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"),
      },
      {
        header: "Total",
        cell: ({ row }) => <span className="font-medium">{formatMoney(row.original.total)}</span>,
      },
      { header: "Estado", cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="secondary" onClick={() => onVer(row.original)}>
              Ver detalle
            </Button>
            {renderAcciones?.(row.original)}
          </div>
        ),
      },
    );
    return cols;
  }, [mostrarCliente, onVer, renderAcciones]);

  return <DataTable data={pedidos} columns={columns} paginar={paginar} />;
}
