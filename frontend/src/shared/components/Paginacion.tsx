import { Button } from "../ui/Button";

interface PaginacionProps {
  /** Página actual, base 0 (skip = pagina × limit). */
  pagina: number;
  total: number;
  limite: number;
  onCambiar: (pagina: number) => void;
}

export function Paginacion({ pagina, total, limite, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  if (total <= limite) return null;
  return (
    <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-3">
      <Button variant="secondary" size="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span className="text-sm text-stone-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={pagina + 1 >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </Button>
    </nav>
  );
}
