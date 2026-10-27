"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { actualizarMiPerfil } from "@/features/socios/api/perfil.api";
import { MI_PERFIL_QUERY_KEY } from "@/features/socios/hooks/use-mi-perfil";
import type { Socio } from "@/types/socio";

/**
 * Guarda los cambios del socio en su propia ficha.
 * La respuesta ya trae la ficha actualizada, así que se escribe directo en
 * la caché en lugar de volver a pedirla.
 */
export function useActualizarMiPerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: actualizarMiPerfil,
    onSuccess: (socio: Socio) => {
      queryClient.setQueryData(MI_PERFIL_QUERY_KEY, socio);
    },
  });
}
