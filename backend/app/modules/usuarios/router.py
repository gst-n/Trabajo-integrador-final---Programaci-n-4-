from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import ROL_ADMIN, Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("/usuarios", response_model=list[UserPublic])
def listar_usuarios(
    _: Usuario = Depends(require_role([ROL_ADMIN])),
    service: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return service.listar()


@router.post("/usuarios/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    _: Usuario = Depends(require_role([ROL_ADMIN])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/usuarios/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_role([ROL_ADMIN])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return service.desactivar(usuario_id, admin_id=admin.id)  # type: ignore[arg-type]
