import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  createPedido,
  getPedidos,
  getResumenPedidos,
} from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types";

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", "lista", filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: getResumenPedidos });
}

/** Crear o cancelar un pedido cambia el stock: se invalidan también los productos. */
function useInvalidarPedidosYStock() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["pedidos"] }),
      qc.invalidateQueries({ queryKey: ["productos"] }),
    ]);
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: (input: PedidoCreate) => createPedido(input),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYStock();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  });
}
