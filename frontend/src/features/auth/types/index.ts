export type Rol = "user" | "admin";

/** Espeja UserPublic del backend (nunca incluye la contraseña). */
export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
