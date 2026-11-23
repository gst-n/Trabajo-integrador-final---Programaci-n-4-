import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  ProductoStockInput,
} from "../types";

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const params: Record<string, string | number> = {
    skip: filtros.pagina * filtros.limite,
    limit: filtros.limite,
  };
  if (filtros.search.trim() !== "") params.search = filtros.search.trim();
  if (filtros.categoria_id !== null) params.categoria_id = filtros.categoria_id;
  const { data } = await axiosInstance.get<ProductosPaginados>("/productos", { params });
  return data;
}

export async function createProducto(input: ProductoInput): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>("/productos", input);
  return data;
}

export async function updateProducto(id: number, input: ProductoInput): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, input);
  return data;
}

export async function updateStock(id: number, input: ProductoStockInput): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, input);
  return data;
}

export async function deleteProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}
