import type { ReactNode } from "react";
import { estiloCampo } from "./Input";

/** Forma mínima de un campo de TanStack Form: evita acoplar los componentes a sus genéricos. */
export interface FieldLike<T> {
  name: string;
  state: { value: T; meta: { errors: unknown[]; isTouched: boolean } };
  handleChange: (value: T) => void;
  handleBlur: () => void;
}

function Envoltorio<T>({
  field,
  label,
  children,
}: {
  field: FieldLike<T>;
  label: string;
  children: ReactNode;
}) {
  const errores = field.state.meta.isTouched
    ? field.state.meta.errors.filter((e) => typeof e === "string" && e !== "").map(String)
    : [];
  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {errores.length > 0 && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {errores.join(". ")}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps {
  field: FieldLike<string>;
  label: string;
  type?: "text" | "password" | "email" | "number" | "url";
  placeholder?: string;
  autoComplete?: string;
  step?: string;
  min?: string;
}

export function TextField({ field, label, type = "text", ...rest }: TextFieldProps) {
  return (
    <Envoltorio field={field} label={label}>
      <input
        id={field.name}
        name={field.name}
        type={type}
        className={estiloCampo}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        {...rest}
      />
    </Envoltorio>
  );
}

export function TextAreaField({
  field,
  label,
  placeholder,
}: {
  field: FieldLike<string>;
  label: string;
  placeholder?: string;
}) {
  return (
    <Envoltorio field={field} label={label}>
      <textarea
        id={field.name}
        name={field.name}
        rows={3}
        className={estiloCampo}
        placeholder={placeholder}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
    </Envoltorio>
  );
}

export interface OpcionSelect<T extends string> {
  value: T;
  label: string;
}

export function SelectField<T extends string>({
  field,
  label,
  opciones,
}: {
  field: FieldLike<T>;
  label: string;
  opciones: OpcionSelect<T>[];
}) {
  return (
    <Envoltorio field={field} label={label}>
      <select
        id={field.name}
        name={field.name}
        className={estiloCampo}
        value={field.state.value}
        onChange={(e) => {
          const elegida = opciones.find((o) => o.value === e.target.value);
          if (elegida) field.handleChange(elegida.value);
        }}
        onBlur={field.handleBlur}
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Envoltorio>
  );
}

export function CheckboxField({ field, label }: { field: FieldLike<boolean>; label: string }) {
  return (
    <label htmlFor={field.name} className="flex items-center gap-2 text-sm font-medium text-stone-700">
      <input
        id={field.name}
        name={field.name}
        type="checkbox"
        className="size-4 rounded border-stone-300 text-violet-600 focus:ring-violet-600"
        checked={field.state.value}
        onChange={(e) => field.handleChange(e.target.checked)}
        onBlur={field.handleBlur}
      />
      {label}
    </label>
  );
}
