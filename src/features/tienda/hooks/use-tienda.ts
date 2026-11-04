"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useSession } from "@/features/auth/hooks/use-session";
import {
  listarCategorias,
  listarProductos,
  obtenerConfiguracion,
  obtenerMiDescuento,
  obtenerProducto,
} from "@/features/tienda/api/tienda.api";
import type { FiltrosCatalogo } from "@/types/tienda";

export const TIENDA_QUERY_KEY = ["tienda"] as const;

export function useCategoriasTienda() {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "categorias"],
    queryFn: listarCategorias,
    staleTime: 5 * 60_000,
  });
}

export function useProductosTienda(filtros: FiltrosCatalogo) {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "productos", filtros],
    queryFn: () => listarProductos(filtros),
    // Al cambiar un filtro se ve la grilla anterior hasta que llega la nueva.
    placeholderData: keepPreviousData,
  });
}

export function useProductoTienda(slug: string) {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "producto", slug],
    queryFn: () => obtenerProducto(slug),
  });
}

export function useConfiguracionTienda() {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "configuracion"],
    queryFn: obtenerConfiguracion,
    staleTime: 5 * 60_000,
  });
}

/** Solo se pide con un socio en sesión; para el resto no existe. */
export function useMiDescuento() {
  const { user } = useSession();
  const esSocio = user?.rol === "SOCIO";

  const query = useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "mi-descuento", user?.id],
    queryFn: obtenerMiDescuento,
    enabled: esSocio,
  });

  return { ...query, esSocio, descuento: esSocio ? (query.data ?? null) : null };
}
