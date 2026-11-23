from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """Inexistente o dada de baja -> 404."""


class NombreDuplicado(Exception):
    """El nombre de la categoría ya existe -> 409."""


class CategoriaService:
    """Reglas de negocio. Abre el Unit of Work con `with self.uow as uow:` y devuelve
    el schema de salida DENTRO del bloque. Nunca llama a commit()."""

    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            # La baja lógica NO libera el nombre único: se busca entre todas.
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")
            categoria = uow.categorias.add(
                Categoria(nombre=data.nombre, descripcion=data.descripcion)
            )
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None and nuevo_nombre != categoria.nombre:
                if uow.categorias.get_by_nombre(nuevo_nombre) is not None:
                    raise NombreDuplicado(
                        f"Ya existe una categoría con el nombre '{nuevo_nombre}'"
                    )
            for campo, valor in cambios.items():
                if campo == "nombre" and valor is None:
                    continue  # el nombre es obligatorio: no se puede dejar en null
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica. No oculta sus productos (se dan de baja por separado)."""
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_activa(categoria_id)
        if categoria is None:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")
        return categoria
