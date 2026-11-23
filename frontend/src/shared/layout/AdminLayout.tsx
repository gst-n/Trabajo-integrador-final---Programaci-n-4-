import { NavLink, Outlet } from "react-router-dom";

const secciones = [
  { to: "/admin/resumen", etiqueta: "Resumen" },
  { to: "/admin/pedidos", etiqueta: "Pedidos" },
  { to: "/admin/productos", etiqueta: "Productos" },
  { to: "/admin/categorias", etiqueta: "Categorías" },
  { to: "/admin/usuarios", etiqueta: "Usuarios" },
];

export function AdminLayout() {
  return (
    <div>
      <nav aria-label="Panel de administración" className="mb-6 flex flex-wrap gap-1 border-b border-stone-200">
        {secciones.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`
            }
          >
            {s.etiqueta}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
