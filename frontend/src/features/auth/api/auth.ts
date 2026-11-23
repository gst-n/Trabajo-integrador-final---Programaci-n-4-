import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { RegisterPayload, UserPublic } from "../types";

export async function loginRequest(username: string, password: string): Promise<void> {
  // El login es un formulario OAuth2 (application/x-www-form-urlencoded).
  const form = new URLSearchParams({ username, password });
  await axiosInstance.post("/auth/token", form);
}

export async function registerRequest(data: RegisterPayload): Promise<UserPublic> {
  const { data: usuario } = await axiosInstance.post<UserPublic>("/auth/register", data);
  return usuario;
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

export async function meRequest(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>("/auth/me");
  return data;
}
