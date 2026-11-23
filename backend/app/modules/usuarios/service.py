from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestión de usuarios por el admin. En este módulo se admite HTTPException."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all(skip=0, limit=1000)
            return [UserPublic.model_validate(u) for u in usuarios]

    def _cambiar_estado(self, usuario_id: int, disabled: bool) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
                )
            usuario.disabled = disabled  # idempotente: 200 aunque no cambie
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def activar(self, usuario_id: int) -> UserPublic:
        return self._cambiar_estado(usuario_id, False)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un administrador no puede desactivarse a sí mismo",
            )
        return self._cambiar_estado(usuario_id, True)
