"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  aprobarSolicitud,
  contarSolicitudesPendientes,
  enviarSolicitud,
  listarSolicitudes,
  listarTiposDisponibles,
  rechazarSolicitud,
} from "@/features/solicitudes/api/solicitudes.api";
import { SOCIOS_QUERY_KEY } from "@/features/admin/hooks/use-socios";
import type { AprobarSolicitudInput } from "@/types/solicitud";

export const SOLICITUDES_QUERY_KEY = ["solicitudes"] as const;

/** Categorías del formulario público. Cambian poco. */
export function useTiposDisponibles() {
  return useQuery({
    queryKey: ["tipos-socio", "disponibles"],
    queryFn: listarTiposDisponibles,
    staleTime: 5 * 60_000,
  });
}

export function useEnviarSolicitud() {
  return useMutation({ mutationFn: enviarSolicitud });
}

export function useSolicitudes() {
  return useQuery({
    queryKey: [...SOLICITUDES_QUERY_KEY, "listado"],
    queryFn: () => listarSolicitudes(),
  });
}

export function useSolicitudesPendientes() {
  return useQuery({
    queryKey: [...SOLICITUDES_QUERY_KEY, "pendientes"],
    queryFn: contarSolicitudesPendientes,
  });
}

/**
 * Aprobar crea el socio y borra la solicitud, así que invalida las dos
 * listas: la de solicitudes y el padrón, donde el socio nuevo ya aparece.
 */
export function useAprobarSolicitud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: AprobarSolicitudInput }) =>
      aprobarSolicitud(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SOCIOS_QUERY_KEY });
    },
  });
}

export function useRechazarSolicitud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rechazarSolicitud,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOLICITUDES_QUERY_KEY });
    },
  });
}
