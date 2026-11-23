import type { InputHTMLAttributes } from "react";

export const estiloCampo =
  "block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-violet-600 disabled:bg-stone-100";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${estiloCampo} ${className}`} {...props} />;
}
