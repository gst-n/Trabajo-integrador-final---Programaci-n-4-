import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  titulo: string;
  mensaje: string;
  confirmar: string;
  cargando?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  titulo,
  mensaje,
  confirmar,
  cargando = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal titulo={titulo} onClose={onCancel}>
      <p className="text-sm text-stone-600">{mensaje}</p>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={cargando}>
          Volver
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={cargando}>
          {cargando ? "Procesando…" : confirmar}
        </Button>
      </div>
    </Modal>
  );
}
