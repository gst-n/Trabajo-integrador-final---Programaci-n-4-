import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activarUsuario, desactivarUsuario, getUsuarios } from "../api/usuarios";

export function useUsuarios() {
  return useQuery({ queryKey: ["usuarios"], queryFn: getUsuarios });
}

export function useActivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}

export function useDesactivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}
