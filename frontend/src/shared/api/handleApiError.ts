import axios from "axios";

interface ErrorDeValidacion {
  msg?: unknown;
}

/** Convierte el `detail` de la API en un mensaje legible para la pantalla. */
export function handleApiError(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "No se pudo conectar con el servidor";
    const detail = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const mensajes = detail
        .map((d: ErrorDeValidacion) => (typeof d?.msg === "string" ? d.msg : ""))
        .filter((m) => m !== "");
      if (mensajes.length > 0) return mensajes.join(". ");
    }
  }
  return fallback;
}
