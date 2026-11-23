import { useState, type FormEvent } from "react";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { SkeletonTarjetas } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";
import type { FiltrosProductos } from "../types";

const LIMITE = 8;

export function CatalogoPage() {
  const [texto, setTexto] = useState("");
  const [filtros, setFiltros] = useState<FiltrosProductos>({
    search: "",
    categoria_id: null,
    pagina: 0,
    limite: LIMITE,
  });

  const { data, isLoading, isError, refetch, isFetching } = useProductos(filtros);
  const { data: categorias } = useCategorias();

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    setFiltros((f) => ({ ...f, search: texto, pagina: 0 }));
  };

  const elegirCategoria = (id: number | null) =>
    setFiltros((f) => ({ ...f, categoria_id: id, pagina: 0 }));

  const limpiar = () => {
    setTexto("");
    setFiltros({ search: "", categoria_id: null, pagina: 0, limite: LIMITE });
  };

  const hayFiltros = filtros.search !== "" || filtros.categoria_id !== null;

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 px-6 py-10 text-white shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight">¿Qué querés comer hoy?</h1>
        <p className="mt-1 max-w-xl text-violet-100">
          Armá tu pedido, elegí cómo pagar y lo preparamos para vos.
        </p>
        <form onSubmit={buscar} className="mt-5 flex max-w-lg gap-2" role="search">
          <Input
            type="search"
            aria-label="Buscar productos"
            placeholder="Buscar por nombre…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="text-stone-900"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoría">
        <button
          type="button"
          onClick={() => elegirCategoria(null)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
            filtros.categoria_id === null
              ? "bg-stone-900 text-white ring-stone-900"
              : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-100"
          }`}
        >
          Todas
        </button>
        {categorias?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => elegirCategoria(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
              filtros.categoria_id === c.id
                ? "bg-stone-900 text-white ring-stone-900"
                : "bg-white text-stone-600 ring-stone-300 hover:bg-stone-100"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonTarjetas cantidad={LIMITE} />
      ) : isError ? (
        <EstadoError mensaje="No pudimos cargar el catálogo." onReintentar={() => void refetch()} />
      ) : data && data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={hayFiltros ? "Probá con otra búsqueda o categoría." : "Todavía no hay productos cargados."}
          accion={
            hayFiltros ? (
              <Button variant="secondary" onClick={limpiar}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        data && (
          <>
            <div
              className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${isFetching ? "opacity-70" : ""}`}
            >
              {data.items.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
            <Paginacion
              pagina={filtros.pagina}
              total={data.total}
              limite={LIMITE}
              onCambiar={(pagina) => setFiltros((f) => ({ ...f, pagina }))}
            />
          </>
        )
      )}
    </div>
  );
}
