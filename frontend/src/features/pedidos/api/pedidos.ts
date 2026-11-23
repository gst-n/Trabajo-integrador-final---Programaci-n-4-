import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types";

export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = {
    skip: filtros.pagina * filtros.limite,
    limit: filtros.limite,
  };
  if (filtros.estado !== null) params.estado = filtros.estado;
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", { params });
  return data;
}

export async function createPedido(input: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>("/pedidos", input);
  return data;
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}
