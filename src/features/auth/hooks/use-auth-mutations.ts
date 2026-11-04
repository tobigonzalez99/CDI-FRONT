"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cambiarPassword,
  cambiarPasswordInicial,
  elegirPasswordConEnlace,
  login,
  logout,
  pedirRecuperacion,
} from "@/features/auth/api/auth.api";
import { SESSION_QUERY_KEY, escribirSesion } from "@/features/auth/hooks/use-session";
import { destinoTrasLogin, destinoTrasLoginEnTienda, ROUTES } from "@/lib/routes";
import type { Session } from "@/types/auth";

/**
 * HU-02: login y redirección según rol y contraseña pendiente.
 *
 * `enLaTienda`: el comprador se queda en la página en la que estaba (ver
 * `destinoTrasLoginEnTienda`).
 */
export function useLogin({ enLaTienda = false }: { enLaTienda?: boolean } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      escribirSesion(queryClient, data);
      const destino = enLaTienda
        ? destinoTrasLoginEnTienda(data.user)
        : destinoTrasLogin(data.user);
      if (destino) router.replace(destino);
      // El layout del destino se renderiza en el servidor y lee la cookie:
      // sin esto podría servirse una versión cacheada sin sesión.
      router.refresh();
    },
  });
}

/** `destino`: adonde va después; desde la tienda, el inicio de la tienda. */
export function useLogout({ destino = ROUTES.home }: { destino?: string } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    // Pase lo que pase en el servidor, localmente la sesión se termina.
    onSettled: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      queryClient.clear();
      router.replace(destino);
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

/** "Olvidé mi contraseña": pide el enlace por correo. */
export function usePedirRecuperacion() {
  return useMutation({ mutationFn: pedirRecuperacion });
}

/**
 * Elegir la contraseña desde el enlace del correo. El backend deja la sesión
 * iniciada, así que se lleva a la persona directo a su sección.
 */
export function useElegirPasswordConEnlace() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: elegirPasswordConEnlace,
    onSuccess: (session: Session) => {
      escribirSesion(queryClient, session);
      router.replace(destinoTrasLogin(session.user));
      router.refresh();
    },
  });
}
