from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Una transacción por bloque `with`.

    - __enter__: abre la sesión y crea los repositorios (hook `_create_repositories`).
    - __exit__: sin excepción -> commit; con excepción -> rollback; siempre close.

    Ningún Service ni Router llama a session.commit().
    """

    session: Session

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory

    def __enter__(self):
        self.session = self._factory()
        self._create_repositories()
        return self

    def _create_repositories(self) -> None:
        """Las subclases crean aquí sus repositorios sobre self.session."""

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        try:
            if exc_type is None:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False  # no traga la excepcion: el Router la traduce a HTTp
