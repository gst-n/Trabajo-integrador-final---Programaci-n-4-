import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../ui/Button";

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-violet-100 text-violet-600" : "text-stone-600 hover:bg-stone-100"
  }`;

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-stone-900">
          <span aria-hidden="true">🍔</span> Food Store
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1" aria-label="Principal">
          <NavLink to="/" end className={enlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={enlace}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-1.5 rounded-full bg-violet-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                {cantidad}
              </span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={enlace}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === "admin" && (
            <NavLink to="/admin/resumen" className={enlace}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-medium text-stone-800">{usuario.full_name}</p>
                <p className="text-xs text-stone-500">{usuario.role === "admin" ? "Administrador" : "Cliente"}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
