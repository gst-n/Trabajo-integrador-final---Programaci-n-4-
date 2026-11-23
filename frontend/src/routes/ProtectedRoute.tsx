import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "../features/auth/types";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  /** Roles permitidos. Sin `roles`, basta con tener sesión. */
  roles?: Rol[];
}

/**
 * Protege rutas: sin sesión redirige a /login; sin el rol, a /unauthorized.
 * La protección real está en el backend (require_role): ocultar una pantalla
 * no reemplaza a la autorización de la API.
 */
export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <p role="status" className="py-20 text-center text-sm text-stone-500">
        Verificando sesión…
      </p>
    );
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
