from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)  # 2..100: se valida en el schema
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True)  # baja lógica

    productos: List["Producto"] = Relationship(back_populates="categoria")
