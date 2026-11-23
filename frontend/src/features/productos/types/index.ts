import type { Categoria } from "../../categorias/types";

export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria | null;
}

export interface ProductoInput {
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
}

export interface ProductoStockInput {
  stock: number;
  disponible: boolean;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface FiltrosProductos {
  search: string;
  categoria_id: number | null;
  /** Página base 0: skip = pagina × limite. */
  pagina: number;
  limite: number;
}
