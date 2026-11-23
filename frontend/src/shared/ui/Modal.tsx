import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  ancho?: "md" | "lg";
}

export function Modal({ titulo, onClose, children, ancho = "md" }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={onClose}
    >
      <div
        className={`w-full ${ancho === "lg" ? "max-w-2xl" : "max-w-md"} rounded-2xl bg-white p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
