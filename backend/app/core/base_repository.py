from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """CRUD genérico. Sin reglas de negocio y sin commit, de eso se ocupa el UnitOfWork."""

    def __init__(self, session: Session, model: Type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> Optional[T]:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        stmt = select(self.model).offset(skip).limit(limit)
        return self.session.exec(stmt).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()  # asigna el id sin cerrar la transaccion
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
