import { useForm } from "@tanstack/react-form";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import {
  CheckboxField,
  SelectField,
  TextAreaField,
  TextField,
  type OpcionSelect,
} from "../../../shared/ui/FormField";
import type { Categoria } from "../../categorias/types";
import type { Producto, ProductoInput } from "../types";

interface ProductoFormProps {
  inicial?: Producto;
  categorias: Categoria[];
  error: string | null;
  onSubmit: (input: ProductoInput) => Promise<void>;
  onCancel: () => void;
}

const esNumero = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));

export function ProductoForm({ inicial, categorias, error, onSubmit, onCancel }: ProductoFormProps) {
  const opciones: OpcionSelect<string>[] = categorias.map((c) => ({ value: String(c.id), label: c.nombre }));

  const form = useForm({
    defaultValues: {
      categoria_id: String(inicial?.categoria_id ?? categorias[0]?.id ?? ""),
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
      precio_base: String(inicial?.precio_base ?? ""),
      imagen_url: inicial?.imagen_url ?? "",
      stock: String(inicial?.stock ?? 0),
      disponible: inicial?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() === "" ? null : value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() === "" ? null : value.imagen_url.trim(),
        stock: Number(value.stock),
        disponible: value.disponible,
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
        validators={{ onChange: ({ value }) => (value.trim() === "" ? "El nombre es obligatorio" : undefined) }}
      >
        {(field) => <TextField field={field} label="Nombre" />}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value === "" ? "Elegí una categoría" : undefined) }}
      >
        {(field) => <SelectField field={field} label="Categoría" opciones={opciones} />}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => <TextAreaField field={field} label="Descripción (opcional)" />}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              !esNumero(value) || Number(value) < 0 ? "Ingresá un precio mayor o igual a 0" : undefined,
          }}
        >
          {(field) => <TextField field={field} label="Precio" type="number" step="0.01" min="0" />}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) =>
              !esNumero(value) || Number(value) < 0 || !Number.isInteger(Number(value))
                ? "El stock debe ser un entero mayor o igual a 0"
                : undefined,
          }}
        >
          {(field) => <TextField field={field} label="Stock" type="number" step="1" min="0" />}
        </form.Field>
      </div>

      <form.Field name="imagen_url">
        {(field) => <TextField field={field} label="URL de la imagen (opcional)" type="url" placeholder="https://…" />}
      </form.Field>

      <form.Field name="disponible">
        {(field) => <CheckboxField field={field} label="Disponible para la venta" />}
      </form.Field>

      {error && <Alert>{error}</Alert>}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" disabled={enviando || categorias.length === 0}>
              {enviando ? "Guardando…" : "Guardar"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
