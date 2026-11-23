from typing import Optional

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_activo(self, producto_id: int) -> Optional[Producto]:
        """Un producto dado de baja se trata como inexistente."""
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados y paginados. Devuelve (items, total)."""
        stmt = select(Producto).where(col(Producto.activo).is_(True))
        if search:
            stmt = stmt.where(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(stmt.subquery())
        ).one()
        items = self.session.exec(
            stmt.order_by(col(Producto.id)).offset(skip).limit(limit)
        ).all()
        return list(items), total
