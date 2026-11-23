import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { TextField } from "../../../shared/ui/FormField";
import { useAuthStore } from "../../../store/authStore";
import { registerRequest } from "../api/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const login = useAuthStore((s) => s.login);
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await registerRequest({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        await login(value.username.trim(), value.password); // entra directo tras registrarse
        navigate("/", { replace: true });
      } catch (e) {
        setError(handleApiError(e, "No se pudo completar el registro"));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-stone-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">Registrate para hacer tus pedidos.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3 ? "El usuario debe tener al menos 3 caracteres" : undefined,
            }}
          >
            {(field) => <TextField field={field} label="Usuario" autoComplete="username" />}
          </form.Field>
          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => (value.trim() === "" ? "El nombre es obligatorio" : undefined),
            }}
          >
            {(field) => <TextField field={field} label="Nombre completo" autoComplete="name" />}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (EMAIL.test(value.trim()) ? undefined : "Ingresá un email válido"),
            }}
          >
            {(field) => <TextField field={field} label="Email" type="email" autoComplete="email" />}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8 ? "La contraseña debe tener al menos 8 caracteres" : undefined,
            }}
          >
            {(field) => <TextField field={field} label="Contraseña" type="password" autoComplete="new-password" />}
          </form.Field>
          <form.Field
            name="confirmar"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden" : undefined,
            }}
          >
            {(field) => (
              <TextField field={field} label="Repetir contraseña" type="password" autoComplete="new-password" />
            )}
          </form.Field>

          {error && <Alert>{error}</Alert>}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(enviando) => (
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Creando cuenta…" : "Registrarme"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-violet-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  );
}
