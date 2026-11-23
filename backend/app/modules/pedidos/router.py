from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.models import EstadoPedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROL_ADMIN, Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(data, usuario.id)  # type: ignore[arg-type]
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ReglaDeNegocio as exc:  # stock insuficiente, no disponible, repetido
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[EstadoPedido] = None,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar(usuario, estado, skip, limit)


# Se declara ANTES de /{pedido_id}: si no, resumen se interpretaria como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _: Usuario = Depends(require_role([ROL_ADMIN])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except PedidoAjeno as exc:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail=str(exc))


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    _: Usuario = Depends(require_role([ROL_ADMIN])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ReglaDeNegocio as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))
    except PedidoAjeno as exc:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ReglaDeNegocio as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))
