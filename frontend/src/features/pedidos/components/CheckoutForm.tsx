import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { SelectField, TextAreaField, TextField, type OpcionSelect } from "../../../shared/ui/FormField";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types";

const FORMAS_PAGO: OpcionSelect<FormaPago>[] = [
  { value: "EFECTIVO", label: "Efectivo (al recibir)" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
];

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await crearPedido.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() === "" ? null : value.notas.trim(),
        });
        vaciar();
        navigate("/mis-pedidos");
      } catch (e) {
        setError(handleApiError(e, "No se pudo crear el pedido"));
      }
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "La dirección no puede superar los 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <TextField field={field} label="Dirección de entrega" placeholder="Calle, número, piso?" autoComplete="street-address" />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => <SelectField field={field} label="Forma de pago" opciones={FORMAS_PAGO} />}
      </form.Field>

      <form.Field name="notas">
        {(field) => <TextAreaField field={field} label="Notas (opcional)" placeholder="Dale algunos detalles al delivery man:) " />}
      </form.Field>

      {error && <Alert>{error}</Alert>}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <Button type="submit" className="w-full" disabled={enviando || items.length === 0}>
            {enviando ? "Confirmando…" : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
