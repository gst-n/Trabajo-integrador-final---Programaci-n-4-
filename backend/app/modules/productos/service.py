from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

__all__ = ["ProductoService", "ProductoNoEncontrado", "CategoriaNoEncontrada"]


class ProductoNoEncontrado(Exception):
    """Inexistente o dado de baja -> 404."""


class ProductoService:
    """Reglas de negocio. Abre el Unit of Work con `with self.uow as uow:` y devuelve
    el schema de salida DENTRO del bloque. Nunca llama a commit()."""

    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                skip=skip,
                limit=limit,
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._exigir_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("categoria_id") is not None:
                self._exigir_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                if valor is None and campo in {
                    "categoria_id",
                    "nombre",
                    "precio_base",
                    "stock",
                    "disponible",
                }:
                    continue  # campos obligatorios: no se pueden dejar en null
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica."""
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_activo(producto_id)
        if producto is None:
            raise ProductoNoEncontrado(f"Producto {producto_id} no encontrado")
        return producto

    @staticmethod
    def _exigir_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        if uow.categorias.get_activa(categoria_id) is None:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")
