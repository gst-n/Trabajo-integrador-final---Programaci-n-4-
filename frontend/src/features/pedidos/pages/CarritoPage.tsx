import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatMoney } from "../../../shared/utils/format";
import { useCartStore } from "../../../store/cartStore";

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos del catálogo para armar tu pedido."
        accion={
          <Link to="/" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
            Ver catálogo
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Tu carrito</h1>
        <Button variant="ghost" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="divide-y divide-stone-100">
          {items.map((item) => (
            <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatMoney(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Restar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                  {item.cantidad}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Sumar uno"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>
              <p className="w-28 text-right font-semibold text-stone-900">
                {formatMoney(item.precio_unitario * item.cantidad)}
              </p>
              <Button variant="ghost" size="sm" aria-label={`Quitar ${item.nombre}`} onClick={() => quitar(item.producto_id)}>
                ✕
              </Button>
            </div>
          ))}
        </Card>

        <Card className="h-fit p-5">
          <h2 className="font-semibold text-stone-900">Resumen</h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Ítems</dt>
              <dd>{items.reduce((suma, i) => suma + i.cantidad, 0)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-900">
              <dt>Total</dt>
              <dd>{formatMoney(total)}</dd>
            </div>
          </dl>
          <Button className="mt-5 w-full" onClick={() => navigate("/checkout")}>
            Confirmar pedido
          </Button>
          <Link to="/" className="mt-3 block text-center text-sm text-stone-500 hover:text-stone-800">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  );
}
