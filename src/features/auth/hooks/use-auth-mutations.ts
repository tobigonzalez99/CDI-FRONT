"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cambiarPassword,
  cambiarPasswordInicial,
  login,
  logout,
} from "@/features/auth/api/auth.api";
import { SESSION_QUERY_KEY, escribirSesion } from "@/features/auth/hooks/use-session";
import { destinoTrasLogin, ROUTES } from "@/lib/routes";
import type { Session } from "@/types/auth";

/** HU-02: login y redirección según rol y contraseña pendiente. */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      escribirSesion(queryClient, data);
      router.replace(destinoTrasLogin(data.user));
      // El layout del destino se renderiza en el servidor y lee la cookie:
      // sin esto podría servirse una versión cacheada sin sesión.
      router.refresh();
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    // Pase lo que pase en el servidor, localmente la sesión se termina.
    onSettled: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.clear();
      router.replace(ROUTES.home);
      router.refresh();
    },
  });
}

/** HU-03: cambio obligatorio en el primer ingreso. */
export function useCambiarPasswordInicial() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cambiarPasswordInicial,
    onSuccess: (session: Session) => {
      escribirSesion(queryClient, session);
      router.replace(destinoTrasLogin(session.user));
      router.refresh();
    },
  });
}

/** HU-05: cambio voluntario desde el perfil. No redirige. */
export function useCambiarPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cambiarPassword,
    onSuccess: (session: Session) => escribirSesion(queryClient, session),
  });
}
