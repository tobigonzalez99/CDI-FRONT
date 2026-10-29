"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  aprobarBaja,
  cancelarMiSolicitudBaja,
  contarBajasPendientes,
  listarSolicitudesBaja,
  obtenerMiSolicitudBaja,
  pedirBaja,
  rechazarBaja,
} from "@/features/solicitudes/api/bajas.api";
import { SOCIOS_QUERY_KEY } from "@/features/admin/hooks/use-socios";
import { MI_PERFIL_QUERY_KEY } from "@/features/socios/hooks/use-mi-perfil";
import type { MiSolicitudBaja } from "@/types/solicitud-baja";

export const BAJAS_QUERY_KEY = ["solicitudes-baja"] as const;

/* --- Lado del socio --- */

export function useMiSolicitudBaja(habilitada = true) {
  return useQuery({
    queryKey: [...BAJAS_QUERY_KEY, "mia"],
    queryFn: obtenerMiSolicitudBaja,
    enabled: habilitada,
  });
}

/** La respuesta ya trae el estado nuevo, así que se escribe directo. */
export function usePedirBaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pedirBaja,
    onSuccess: (estado: MiSolicitudBaja) => {
      queryClient.setQueryData([...BAJAS_QUERY_KEY, "mia"], estado);
    },
  });
}

export function useCancelarMiSolicitudBaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelarMiSolicitudBaja,
    onSuccess: () => {
      queryClient.setQueryData([...BAJAS_QUERY_KEY, "mia"], {
        pendiente: false,
        solicitadaEn: null,
        motivo: null,
      } satisfies MiSolicitudBaja);
    },
  });
}

/* --- Lado del administrador --- */

export function useSolicitudesBaja() {
  return useQuery({
    queryKey: [...BAJAS_QUERY_KEY, "listado"],
    queryFn: () => listarSolicitudesBaja(),
  });
}

export function useBajasPendientes() {
  return useQuery({
    queryKey: [...BAJAS_QUERY_KEY, "pendientes"],
    queryFn: contarBajasPendientes,
  });
}

/**
 * Aprobar cambia el estado del socio y borra el pedido, así que se invalidan
 * las dos listas: la bandeja de bajas y el padrón, donde el socio pasa a
 * figurar como dado de baja.
 */
export function useAprobarBaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aprobarBaja,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BAJAS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SOCIOS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MI_PERFIL_QUERY_KEY });
    },
  });
}

export function useRechazarBaja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rechazarBaja,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BAJAS_QUERY_KEY });
    },
  });
}
