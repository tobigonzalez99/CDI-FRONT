"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listarCuentas,
  obtenerHistorialDeSocio,
  obtenerMisPagos,
  obtenerResumenCobranzas,
} from "@/features/pagos/api/pagos.api";

export const PAGOS_QUERY_KEY = ["pagos"] as const;

export function useMisPagos() {
  return useQuery({
    queryKey: [...PAGOS_QUERY_KEY, "mios"],
    queryFn: () => obtenerMisPagos(),
  });
}

export function useHistorialDeSocio(socioId: string | null) {
  return useQuery({
    queryKey: [...PAGOS_QUERY_KEY, "socio", socioId],
    queryFn: () => obtenerHistorialDeSocio(socioId!),
    enabled: Boolean(socioId),
  });
}

export function useResumenCobranzas(rango?: { desde?: string; hasta?: string }) {
  return useQuery({
    queryKey: [...PAGOS_QUERY_KEY, "resumen", rango?.desde ?? "", rango?.hasta ?? ""],
    queryFn: () => obtenerResumenCobranzas(rango),
  });
}

/** Cuentas activas para el selector de cobro. Cambian poco: se cachean más tiempo. */
export function useCuentasActivas() {
  return useQuery({
    queryKey: ["cuentas", "activas"],
    queryFn: () => listarCuentas(true),
    staleTime: 5 * 60_000,
  });
}
