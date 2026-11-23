import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { useAuthStore } from "../../../store/authStore";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { TextField } from "../../../shared/ui/FormField";

const requerido = (etiqueta: string) => ({ value }: { value: string }) =>
  value.trim() === "" ? `${etiqueta} es obligatorio` : undefined;

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const desde = (location.state as { from?: string } | null)?.from;

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username.trim(), value.password);
        const rol = useAuthStore.getState().usuario?.role;
        navigate(desde ?? (rol === "admin" ? "/admin/resumen" : "/"), { replace: true });
      } catch (e) {
        setError(handleApiError(e, "No se pudo iniciar sesión"));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-stone-900">Ingresar</h1>
        <p className="mt-1 text-sm text-stone-500">Accedé para confirmar pedidos y seguirlos.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="username" validators={{ onChange: requerido("El usuario") }}>
            {(field) => <TextField field={field} label="Usuario" autoComplete="username" />}
          </form.Field>
          <form.Field name="password" validators={{ onChange: requerido("La contraseña") }}>
            {(field) => (
              <TextField field={field} label="Contraseña" type="password" autoComplete="current-password" />
            )}
          </form.Field>

          {error && <Alert>{error}</Alert>}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(enviando) => (
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Ingresando…" : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-violet-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
