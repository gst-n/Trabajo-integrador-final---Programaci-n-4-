import axios from "axios";

/**
 * Cliente HTTP único. La sesión viaja en una cookie HttpOnly que el navegador
 * adjunta solo (withCredentials): el frontend nunca lee ni guarda el token.
 */
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let onSessionLost: () => void = () => {};

/** El authStore registra aquí cómo limpiar la sesión (evita imports circulares). */
export function setSessionLostHandler(handler: () => void): void {
  onSessionLost = handler;
}

const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const url = error.config?.url ?? "";
      const esSondeoDeSesion = url.includes("/auth/token") || url.includes("/auth/me");
      const detail = (data as { detail?: unknown } | undefined)?.detail;
      const sesionVencida = status === 401 && !esSondeoDeSesion;
      const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA;
      if (sesionVencida || cuentaDesactivada) {
        onSessionLost(); // ProtectedRoute redirige a /login al quedar sin usuario
      }
    }
    return Promise.reject(error);
  },
);
