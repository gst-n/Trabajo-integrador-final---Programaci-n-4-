from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Importar TODOS los modelos aca garantiza que SQLAlchemy resuelva las relaciones
from app.modules.categorias import models as _categorias
from app.modules.pedidos import models as _pedidos
from app.modules.productos import models as _productos
from app.modules.usuarios import models as _usuarios

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=_connect_args)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el UnitOfWork en __enter__."""
    return Session(engine, expire_on_commit=False)
