from typing import Optional, Sequence

from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Incluye las dadas de baja: la baja no libera el nombre único."""
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

    def get_activa(self, categoria_id: int) -> Optional[Categoria]:
        """Una categoría dada de baja se trata como inexistente."""
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def list_activas(self) -> Sequence[Categoria]:
        return self.session.exec(
            select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.id)
        ).all()
