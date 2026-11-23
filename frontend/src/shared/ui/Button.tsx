import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "ghost";
type Tamano = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
  size?: Tamano;
}

const variantes: Record<Variante, string> = {
  primary: "bg-violet-600 text-white hover:bg-violet-600 focus-visible:outline-violet-600",
  secondary: "bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-100",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  ghost: "text-stone-600 hover:bg-stone-100",
};

const tamanos: Record<Tamano, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variant]} ${tamanos[size]} ${className}`}
      {...props}
    />
  );
}
