import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "../ui/Button";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Paginación del lado del cliente (el panel pide limit=100 al servidor). */
  paginar?: boolean;
  tamanoPagina?: number;
}

export function DataTable<T>({ data, columns, paginar = true, tamanoPagina = 10 }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: paginar ? getPaginationRowModel() : undefined,
    initialState: { pagination: { pageIndex: 0, pageSize: paginar ? tamanoPagina : Math.max(data.length, 1) } },
    autoResetPageIndex: false,
  });

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginar && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3">
          <span className="text-xs text-stone-500">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} · {data.length} registros
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
              Anterior
            </Button>
            <Button variant="secondary" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
