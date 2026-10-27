"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import {
  listarSocios,
  listarTiposSocio,
  obtenerSocio,
} from "@/features/admin/api/socios.api";
import type { SocioFilters } from "@/types/socio";

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
