import { useForm } from "@tanstack/react-form";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { TextAreaField, TextField } from "../../../shared/ui/FormField";
import type { Categoria, CategoriaInput } from "../types";

interface CategoriaFormProps {
  inicial?: Categoria;
  error: string | null;
  onSubmit: (input: CategoriaInput) => Promise<void>;
  onCancel: () => void;
}

export function CategoriaForm({ inicial, error, onSubmit, onCancel }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? "", descripcion: inicial?.descripcion ?? "" },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() === "" ? null : value.descripcion.trim(),
      });
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            return largo < 2 || largo > 100 ? "El nombre debe tener entre 2 y 100 caracteres" : undefined;
          },
        }}
      >
        {(field) => <TextField field={field} label="Nombre" />}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => <TextAreaField field={field} label="Descripción (opcional)" />}
      </form.Field>

      {error && <Alert>{error}</Alert>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
