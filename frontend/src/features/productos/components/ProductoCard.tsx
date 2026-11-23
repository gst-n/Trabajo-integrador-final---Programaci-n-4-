import { useState } from "react";
import { formatMoney } from "../../../shared/utils/format";
import { Button } from "../../../shared/ui/Button";
import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const [imagenRota, setImagenRota] = useState(false);
  const [recienAgregado, setRecienAgregado] = useState(false);

  const sinStock = producto.stock <= 0;
  const noVendible = !producto.disponible || sinStock;
  const alcanzoElStock = enCarrito >= producto.stock;

  const onAgregar = () => {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
    });
    setRecienAgregado(true);
    setTimeout(() => setRecienAgregado(false), 1200);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-stone-200 transition-shadow hover:shadow-md">
      <div className="relative h-40 bg-stone-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl" aria-hidden="true">
            🍽️
          </div>
        )}
        {noVendible && (
          <span className="absolute left-2 top-2 rounded-full bg-stone-900/80 px-2.5 py-0.5 text-xs font-medium text-white">
            {sinStock ? "Sin stock" : "No disponible"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {producto.categoria && (
          <span className="text-xs font-medium uppercase tracking-wide text-violet-600">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="mt-0.5 font-semibold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-stone-900">{formatMoney(producto.precio_base)}</span>
          <Button size="sm" onClick={onAgregar} disabled={noVendible || alcanzoElStock}>
            {recienAgregado ? "¡Agregado!" : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </article>
  );
}
