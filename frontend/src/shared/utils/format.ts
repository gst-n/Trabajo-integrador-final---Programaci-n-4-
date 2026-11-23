const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export function formatMoney(valor: number): string {
  return moneda.format(valor);
}

export function formatFecha(iso: string): string {
  // El backend guarda fechas UTC sin zona: se interpretan como UTC.
  const fecha = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return fecha.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}
