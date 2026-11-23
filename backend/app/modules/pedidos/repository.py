from datetime import datetime
from typing import Optional

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _paginar(
        self, stmt, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        total = self.session.exec(
            select(func.count()).select_from(stmt.subquery())
        ).one()
        items = self.session.exec(
            stmt.order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def list_by_usuario(
        self,
        usuario_id: int,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Pedido], int]:
        stmt = select(Pedido).where(Pedido.usuario_id == usuario_id)
        if estado:
            stmt = stmt.where(Pedido.estado == estado)
        return self._paginar(stmt, skip, limit)

    def list_all(
        self, estado: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> tuple[list[Pedido], int]:
        stmt = select(Pedido)
        if estado:
            stmt = stmt.where(Pedido.estado == estado)
        return self._paginar(stmt, skip, limit)

    # --- consultas para el resumen del panel (ResumenPedidos) ---
    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sum_total_by_estado(self, estado: str) -> float:
        return float(
            self.session.exec(
                select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
                    Pedido.estado == estado
                )
            ).one()
        )
