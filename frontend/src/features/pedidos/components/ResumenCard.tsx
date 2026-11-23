import { Card } from "../../../shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string;
  icono: string;
  acento?: string;
}

export function ResumenCard({ titulo, valor, icono, acento = "bg-stone-100" }: ResumenCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className={`flex size-12 items-center justify-center rounded-xl text-2xl ${acento}`} aria-hidden="true">
        {icono}
      </span>
      <div>
        <p className="text-sm text-stone-500">{titulo}</p>
        <p className="text-2xl font-bold text-stone-900">{valor}</p>
      </div>
    </Card>
  );
}
