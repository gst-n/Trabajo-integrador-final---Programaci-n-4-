import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { formatFecha, formatMoney } from "../../../shared/utils/format";
import type { Pedido } from "../types";

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-stone-500">Creado el {formatFecha(pedido.created_at)}</span>
      </div>

      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-400">Dirección</dt>
          <dd className="font-medium text-stone-800">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-400">Forma de pago</dt>
          <dd className="font-medium text-stone-800">
            {pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
          </dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-stone-400">Notas</dt>
            <dd className="text-stone-700">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
            <th className="pb-2 font-medium">Producto</th>
            <th className="pb-2 text-right font-medium">Cant.</th>
            <th className="pb-2 text-right font-medium">Precio</th>
            <th className="pb-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2 text-stone-800">{item.nombre_producto}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatMoney(item.precio_unitario)}</td>
              <td className="py-2 text-right font-medium">{formatMoney(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200">
            <td colSpan={3} className="pt-3 text-right font-semibold">
              Total
            </td>
            <td className="pt-3 text-right text-base font-bold">{formatMoney(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
