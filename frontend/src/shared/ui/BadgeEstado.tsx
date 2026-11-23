import type { EstadoPedido } from "../../features/pedidos/types";

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 ring-amber-200",
  EN_PREPARACION: "bg-sky-100 text-sky-800 ring-sky-200",
  ENTREGADO: "bg-green-100 text-green-800 ring-green-200",
  CANCELADO: "bg-stone-200 text-stone-600 ring-stone-300",
};

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estilos[estado]}`}>
      {etiquetas[estado]}
    </span>
  );
}
