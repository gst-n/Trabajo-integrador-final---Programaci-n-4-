import { useForm } from "@tanstack/react-form";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { CheckboxField, TextField } from "../../../shared/ui/FormField";
import type { Producto, ProductoStockInput } from "../types";

interface StockFormProps {
  producto: Producto;
  error: string | null;
  onSubmit: (input: ProductoStockInput) => Promise<void>;
  onCancel: () => void;
}

export function StockForm({ producto, error, onSubmit, onCancel }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      await onSubmit({ stock: Number(value.stock), disponible: value.disponible });
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
      <p className="text-sm text-stone-500">
        Producto: <span className="font-medium text-stone-800">{producto.nombre}</span>
      </p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            value.trim() === "" || !Number.isInteger(Number(value)) || Number(value) < 0
              ? "El stock debe ser un entero mayor o igual a 0"
              : undefined,
        }}
      >
        {(field) => <TextField field={field} label="Stock" type="number" step="1" min="0" />}
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
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : "Guardar stock"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
