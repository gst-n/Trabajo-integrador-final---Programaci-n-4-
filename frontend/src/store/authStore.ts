import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, logoutRequest, meRequest } from "../features/auth/api/auth";
import type { Rol, UserPublic } from "../features/auth/types";
import { setSessionLostHandler } from "../shared/api/axiosInstance";

export interface SesionUsuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
}

interface AuthState {
  usuario: SesionUsuario | null;
  /** true hasta que checkSession confirma (o descarta) la sesión al montar la app. */
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

function aSesion(u: UserPublic): SesionUsuario {
  return { id: u.id, username: u.username, full_name: u.full_name, email: u.email, role: u.role };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password); // el JWT queda en la cookie HttpOnly
        const perfil = await meRequest();
        set({ usuario: aSesion(perfil), cargando: false });
      },

      logout: async () => {
        try {
          await logoutRequest(); // el backend borra la cookie
        } finally {
          set({ usuario: null });
        }
      },

      checkSession: async () => {
        try {
          const perfil = await meRequest();
          set({ usuario: aSesion(perfil), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => set({ usuario: null }),
    }),
    {
      name: "food-store-auth",
      // Solo se guarda el usuario para evitar parpadeos: NUNCA el token.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);

// Si la API responde 401 (sesión vencida) o "cuenta desactivada", se limpia la sesión.
setSessionLostHandler(() => useAuthStore.getState().limpiarSesion());
