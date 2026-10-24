"use client";

import { useQuery } from "@tanstack/react-query";

import { obtenerMiPerfil } from "@/features/socios/api/perfil.api";

export const MI_PERFIL_QUERY_KEY = ["socios", "mi-perfil"] as const;

/**
 * HU-04. El `estadoCuota` lo calcula el backend contra la fecha actual, así que
 * se revalida al volver a la pestaña: si el socio deja la página abierta y
 * vence su vigencia, el estado se actualiza solo.
 */
export function useMiPerfil() {
  return useQuery({
    queryKey: MI_PERFIL_QUERY_KEY,
    queryFn: obtenerMiPerfil,
    refetchOnWindowFocus: true,
  });
}
