"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarSocio,
  generarCodigosDeCarnet,
  listarSocios,
  listarTiposSocio,
  obtenerSocio,
  reactivarSocio,
} from "@/features/admin/api/socios.api";
import type { Socio, SocioFilters, UpdateSocioInput } from "@/types/socio";

export const SOCIOS_QUERY_KEY = ["socios"] as const;

/**
 * Padrón paginado. `keepPreviousData` evita que la tabla parpadee en blanco
 * al cambiar de página o de filtro: se mantiene la anterior hasta que llega
 * la nueva.
 */
export function useSocios(filtros: SocioFilters) {
  return useQuery({
    queryKey: [...SOCIOS_QUERY_KEY, "listado", filtros],
    queryFn: () => listarSocios(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useSocio(id: string | null) {
  return useQuery({
    queryKey: [...SOCIOS_QUERY_KEY, "detalle", id],
    queryFn: () => obtenerSocio(id!),
    enabled: Boolean(id),
  });
}

export function useTiposSocio(soloActivos = true) {
  return useQuery({
    queryKey: ["tipos-socio", soloActivos],
    queryFn: () => listarTiposSocio(soloActivos),
    staleTime: 5 * 60_000,
  });
}

/**
 * Guarda los cambios de la ficha de un socio.
 *
 * La respuesta ya trae la ficha actualizada con su `estadoCuota` recalculado,
 * así que se escribe directo en la caché del detalle. El padrón sí se
 * invalida: tocar la categoría o la vigencia cambia lo que muestra la tabla.
 */
export function useActualizarSocio(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<UpdateSocioInput, "foto">) => actualizarSocio(id, input),
    onSuccess: (socio: Socio) => {
      queryClient.setQueryData([...SOCIOS_QUERY_KEY, "detalle", socio.id], socio);
      void queryClient.invalidateQueries({
        queryKey: [...SOCIOS_QUERY_KEY, "listado"],
      });
    },
  });
}

export function useReactivarSocio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivarSocio,
    onSuccess: (socio: Socio) => {
      queryClient.setQueryData([...SOCIOS_QUERY_KEY, "detalle", socio.id], socio);
      void queryClient.invalidateQueries({
        queryKey: [...SOCIOS_QUERY_KEY, "listado"],
      });
    },
  });
}

/**
 * Genera los códigos de carnet que falten.
 *
 * Invalida todo lo que cuelga de `socios` porque la respuesta solo trae el
 * resumen: cuáles fichas cambiaron hay que volver a pedirlas.
 */
export function useGenerarCodigosDeCarnet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generarCodigosDeCarnet,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SOCIOS_QUERY_KEY });
    },
  });
}
