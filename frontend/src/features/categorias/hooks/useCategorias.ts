import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from "../api/categorias";
import type { CategoriaInput } from "../types";

export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
}

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoriaInput) => createCategoria(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
  });
}

export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoriaInput }) => updateCategoria(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categorias"] });
      void qc.invalidateQueries({ queryKey: ["productos"] }); // el producto muestra su categoría
    },
  });
}

export function useEliminarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
  });
}
