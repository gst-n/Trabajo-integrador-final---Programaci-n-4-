import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from "../api/productos";
import type { FiltrosProductos, ProductoInput, ProductoStockInput } from "../types";

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // evita parpadeos al paginar
  });
}

function useInvalidarProductos() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (input: ProductoInput) => createProducto(input),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductoInput }) => updateProducto(id, input),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductoStockInput }) => updateStock(id, input),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: invalidar,
  });
}
