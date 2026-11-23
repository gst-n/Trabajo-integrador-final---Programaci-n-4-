# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador · Programación IV

Aplicación web completa para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago. El negocio administra categorías, productos, stock, pedidos y usuarios desde un panel de administración.

- **Repositorio:** ` https://github.com/gst-n/Trabajo-integrador-final---Programaci-n-4-.git`
- **Video YT:** `  https://youtu.be/I3ohHw4tU8A`   


## Estructura

```
/
├── backend/    API REST (FastAPI + SQLModel + PostgreSQL)
├── frontend/   Aplicación web (React + TypeScript + Vite + Tailwind)
└── README.md
```

## Backend

Todos los comandos se ejecutan dentro de `backend/`.

### 1. Instalación


cd backend
python -m venv venv
source venv/bin/activate         # venv\Scripts\activate
pip install -r requirements.txt     

Las versiones están fijadas, incluidas `passlib[bcrypt]==1.7.4` y `bcrypt==4.0.1` (Passlib falla con bcrypt 5).

### 2. Variables de entorno


cp .env       

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

Con PostgreSQL, crear antes la base vacía (`createdb foodstore_db`). Para probar rápido sin PostgreSQL, usar `DATABASE_URL=sqlite:///./foodstore.db`.

### 3. Datos iniciales (seed)


| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `Admin1234!` | admin |

### 4. Ejecución

```bash
uvicorn app.main:app --reload
```

- API: <http://localhost:8000/api/v1>
- Documentación interactiva: <http://localhost:8000/docs> y <http://localhost:8000/redoc>

## Frontend

Todos los comandos se ejecutan dentro de `frontend/`.


cd frontend
cp .env.example .env         
pnpm install
pnpm dev                          # http://localhost:5173

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API (con prefijo `/api/v1`) | `http://localhost:8000/api/v1` |


Hay qe levantar primero el backend y luego el frontend. El origen del frontend debe coincidir con `FRONTEND_ORIGIN` del backend, porque la sesión viaja en una cookie y CORS solo admite un origen explícito cuando hay credenciales.

## Cómo probarlo (recorrido sugerido)

1. Abrir <http://localhost:5173>, buscar y filtrar el catálogo, agregar productos al carrito.
2. Registrarse, confirmar el pedido en `/checkout` y verlo en **Mis pedidos**.
3. Cancelar un pedido en estado `PENDIENTE` y comprobar que el stock se restituye.
4. Ingresar como `admin` y recorrer el panel: resumen, pedidos (avanzar de estado o cancelar), productos, categorías y usuarios.

## Arquitectura

### Backend (`backend/app`)

Módulos por dominio (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con la cadena **Router → Service → Unit of Work → Repository → Model**. El flujo de dependencias es unidireccional.

- `core/`: configuración (`pydantic-settings`), base de datos, seguridad (bcrypt + JWT), dependencias de sesión y rol, `UnitOfWork` base y `BaseRepository[T]`.
- **Unit of Work:** el commit, el rollback y el close ocurren en `__exit__`. Ningún Service ni Router llama a `session.commit()`. El Service abre `with self.uow as uow:` y devuelve el schema de salida dentro del bloque.
- **Autenticación:** el login entrega el JWT únicamente en la cookie HttpOnly `access_token`; el cuerpo de la respuesta no lo incluye.
- **Reglas de negocio (`pedidos`):** creación transaccional con descuento de stock y copia de nombre y precio en cada línea (RN-01), máquina de estados (RN-02), cancelación con restitución de stock (RN-03), permisos por dueño y rol (RN-04), inmutabilidad de líneas y total (RN-05) y validación de forma de pago y dirección (RN-06).
- **Baja lógica** en usuarios (`disabled`), categorías y productos (`activo`). Los pedidos no se borran: se cancelan.

### Frontend (`frontend/src`)

Organizado por **features** que espejan los módulos del backend (`pages`, `components`, `hooks`, `api`, `types`), con lo transversal en `shared/`, el estado global en `store/` y las rutas en `routes/`.

- **Estado del servidor:** TanStack Query (`useQuery`, `useMutation`, invalidación).
- **Estado del cliente:** Zustand con `persist` — `authStore` (solo guarda el usuario, nunca el token) y `cartStore` (el carrito sobrevive a recargar).
- **Formularios y tablas:** TanStack Form y TanStack Table.
- **HTTP:** una única instancia de Axios con `withCredentials: true` e interceptor de 401.
- **Rutas:** `ProtectedRoute` por sesión y por rol. La protección real está en el backend (`require_role`).

## Endpoints principales

| Método | Ruta | Acceso |
| --- | --- | --- |
| POST | `/auth/register`, `/auth/token`, `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/admin/usuarios` · POST `/admin/usuarios/{id}/activar` · `/desactivar` | admin |
| GET | `/categorias`, `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | admin |
| GET | `/productos` (paginado: `skip`, `limit`, `search`, `categoria_id`, `disponible`), `/productos/{id}` | Público |
| POST · PUT · PATCH `/{id}/stock` · DELETE | `/productos` | admin |
| POST · GET | `/pedidos` | Sesión |
| GET | `/pedidos/resumen` | admin |
| GET | `/pedidos/{id}` | Dueño o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| PATCH | `/pedidos/{id}/cancelar` | Dueño (solo `PENDIENTE`) |
