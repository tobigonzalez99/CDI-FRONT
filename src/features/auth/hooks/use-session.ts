"use client";

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { obtenerSesion } from "@/features/auth/api/auth.api";
import { esApiError } from "@/lib/api/errors";
import type { Session } from "@/types/auth";

export const SESSION_QUERY_KEY = ["auth", "session"] as const;

/**
 * Sesión actual, consultada al backend.
 *
 * `null` significa "no hay sesión" y es un estado válido, no un error: por eso
 * un 401 se traduce a `null` en lugar de dejar la query en estado de fallo.
 */
export function useSession() {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async (): Promise<Session | null> => {
      try {
        return await obtenerSesion();
      } catch (error) {
        if (esApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
    // Sin reintentos ante 401: no hay nada que reintentar.
    retry: (intentos, error) =>
      esApiError(error) && error.status >= 500 ? intentos < 2 : false,
    staleTime: 60_000,
  });

  return {
    ...query,
    session: query.data ?? null,
    user: query.data?.user ?? null,
    estaAutenticado: Boolean(query.data),
  };
}

/** Guarda la sesión recién obtenida (login o cambio de clave) sin re-consultar. */
export function escribirSesion(queryClient: QueryClient, session: Session): void {
  queryClient.setQueryData(SESSION_QUERY_KEY, session);
}

export function useEscribirSesion() {
  const queryClient = useQueryClient();
  return (session: Session) => escribirSesion(queryClient, session);
}
