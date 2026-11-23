from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Repositorios de pedidos y de productos sobre LA MISMA sesión:
    así el descuento de stock y la creación del pedido van en una transacción."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _create_repositories(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
