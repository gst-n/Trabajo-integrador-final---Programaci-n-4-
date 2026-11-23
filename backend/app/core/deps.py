from typing import Callable, Generator

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session, select

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"


def get_session() -> Generator[Session, None, None]:
    """Sesión de solo lectura para las dependencias de seguridad.
    Las reglas de negocio no la usan: pasan por el Unit of Work."""
    with session_factory() as session:
        yield session


def get_current_user(
    request: Request, session: Session = Depends(get_session)
) -> Usuario:
    """Lee la cookie HttpOnly, valida firma y expiración y carga el usuario (401)."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
    )
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_error
    payload = decode_access_token(token)
    if payload is None or not payload.get("sub"):
        raise credentials_error
    user = session.exec(
        select(Usuario).where(Usuario.username == payload["sub"])
    ).first()
    if user is None:
        raise credentials_error
    return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    """Rechaza cuentas desactivadas con 400."""
    if user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return user


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    """Fábrica de dependencias: 403 si el rol del usuario no está permitido."""

    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta operación",
            )
        return user

    return checker
