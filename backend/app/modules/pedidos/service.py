from typing import Optional

from app.core.utils import utcnow
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROL_ADMIN, Usuario


# ---------------- excepciones de dominio ----------------
class PedidoNoEncontrado(Exception):
    """-> 404"""


class ProductoNoEncontrado(Exception):
    """Producto inexistente o inactivo -> 404"""


class PedidoAjeno(Exception):
    """El pedido pertenece a otro usuario -> 403"""


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio incumplidas -> 400"""


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


# ---------------- maquina de estados---------------
P = EstadoPedido.PENDIENTE.value
E = EstadoPedido.EN_PREPARACION.value
D = EstadoPedido.ENTREGADO.value
C = EstadoPedido.CANCELADO.value

TRANSICIONES: dict[str, list[str]] = {
    P: [E, C],
    E: [D, C],
    D: [],  # terminal
    C: [],  # terminal
}


class PedidoService:
    """Reglas de negocio de pedidos. Todo ocurre dentro de `with self.uow`: el commit o el
    rollback los hace el Unit of Work en __exit__. Nunca se llama a session.commit()."""

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- crear pedido ----------
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("Un producto no puede repetirse entre los ítems")

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_activo(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de '{producto.nombre}' "
                        f"(disponible: {producto.stock}, pedido: {item.cantidad})"
                    )
                # En la misma iteración: se descuenta y se crea la línea con la COPIA
                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)
        # Si algo lanzó una excepción, __exit__ hizo rollback: no se persiste nada.

    # ---------- lecturas ----------
    def listar(
        self, usuario: Usuario, estado: Optional[EstadoPedido], skip: int, limit: int
    ) -> PedidosPaginados:
        estado_valor = estado.value if estado else None
        with self.uow as uow:
            if usuario.role == ROL_ADMIN:
                items, total = uow.pedidos.list_all(estado_valor, skip, limit)
            else:
                items, total = uow.pedidos.list_by_usuario(
                    usuario.id, estado_valor, skip, limit  # type: ignore[arg-type]
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if usuario.role != ROL_ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ---------- RN-02 / RN-03: cambio de estado (admin) ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado.value)
            return PedidoRead.model_validate(pedido)

    # ---------- RN-03 / RN-04: cancelar (dueño) ----------
    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida("Solo se puede cancelar un pedido en PENDIENTE")
            self._aplicar_transicion(uow, pedido, EstadoPedido.CANCELADO.value)
            return PedidoRead.model_validate(pedido)

    # ---------- resumen del panel ----------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(P, 0),
                en_preparacion=por_estado.get(E, 0),
                entregados=por_estado.get(D, 0),
                cancelados=por_estado.get(C, 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.sum_total_by_estado(D),
            )

    # ---------- internos ----------
    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        # La transición se valida ANTES de modificar nada (RN-02).
        if nuevo not in TRANSICIONES.get(pedido.estado, []):
            raise TransicionInvalida(
                f"Transición inválida: {pedido.estado} -> {nuevo}"
            )
        if nuevo == EstadoPedido.CANCELADO.value:
            # RN-03: restituir el stock en la misma transacción que cambia el estado.
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
        pedido.estado = nuevo
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)
