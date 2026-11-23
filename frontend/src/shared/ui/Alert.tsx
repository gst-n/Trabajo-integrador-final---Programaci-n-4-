interface AlertProps {
  tipo?: "error" | "exito";
  children: string;
}

export function Alert({ tipo = "error", children }: AlertProps) {
  const estilo =
    tipo === "error" ? "bg-red-50 text-red-700 ring-red-200" : "bg-green-50 text-green-700 ring-green-200";
  return (
    <p role={tipo === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-sm ring-1 ${estilo}`}>
      {children}
    </p>
  );
}
