"""Carga datos iniciales

python -m app.db.seed
"""
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import ROL_ADMIN, Usuario

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Bebidas", "Gaseosas, jugos y aguas"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Hamburguesas", "Clasica", "Carne, lechuga, tomate y cheddar", 6500.0, 30),
    ("Hamburguesas", "Doble Cheddar", "Doble carne y doble cheddar", 8200.0, 25),
    ("Hamburguesas", "Veggie", "Medallon de legumbres y rúcula", 6900.0, 20),
    ("Bebidas", "Pepsi 500 ml", "Cola", 1800.0, 60),
    ("Bebidas", "Agua mineral", "Sin gas, 500 ml", 1200.0, 80),
    ("Bebidas", "Limonada", "Limonada natural con menta", 2400.0, 40),
    ("Postres", "Brownie", "Brownie con helado de crema", 3800.0, 15),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3200.0, 18),
]


def run() -> None:
    create_all_tables()
    # El seed es un script, no un Service: puede abrir su propia sesion y hacer commit.
    with session_factory() as session:
        if session.exec(select(Usuario).where(Usuario.username == "admin")).first() is None:
            session.add(
                Usuario(
                    username="admin",
                    full_name="Admin Food Store",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role=ROL_ADMIN,
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(cat)
            categorias[nombre] = cat
        session.flush()  # asigna los id de las categorías nuevas

        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[cat_nombre].id, 
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=f"https://picsum.photos/seed/{nombre.replace(' ', '')}/400/300",
                        stock=stock,
                    )
                )
        session.commit()
    print("Seed completado (usuario admin / Admin1234!).")


if __name__ == "__main__":
    run()
