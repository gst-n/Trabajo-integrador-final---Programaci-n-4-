from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utcnow

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

ROL_USER = "user"
ROL_ADMIN = "admin"


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default=ROL_USER)  # "user" | "admin"
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=utcnow)

    pedidos: List["Pedido"] = Relationship(back_populates="usuario")
