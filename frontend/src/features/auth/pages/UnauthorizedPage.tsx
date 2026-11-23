import { Link } from "react-router-dom";
import { Card } from "../../../shared/ui/Card";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8 text-center">
        <span className="text-4xl" aria-hidden="true">
          🔒
        </span>
        <h1 className="mt-3 text-xl font-bold text-stone-900">Sin permiso</h1>
        <p className="mt-1 text-sm text-stone-500">No tenés permisos para ver esta pantalla.</p>
        <Link to="/" className="mt-5 inline-block text-sm font-medium text-violet-600 hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}
