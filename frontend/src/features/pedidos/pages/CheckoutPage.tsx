import { Link } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Card } from "../../../shared/ui/Card";
import { formatMoney } from "../../../shared/utils/format";
import { useCartStore } from "../../../store/cartStore";
import { CheckoutForm } from "../components/CheckoutForm";

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío."
        accion={
          <Link to="/" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <CheckoutForm />
        </Card>
        <Card className="h-fit p-5">
          <h2 className="font-semibold text-stone-900">Tu pedido</h2>
          <ul className="mt-3 divide-y divide-stone-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3 py-2">
                <span className="text-stone-600">
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="font-medium">{formatMoney(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-base font-bold text-stone-900">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </p>
          <p className="mt-2 text-xs text-stone-400">
            El precio final queda fijado al confirmar el pedido.
          </p>
        </Card>
      </div>
    </div>
  );
}
