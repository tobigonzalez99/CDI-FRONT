"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/features/auth/hooks/use-session";
import {
  cotizarCarrito,
  crearPedido,
  listarCategorias,
  listarMisPedidos,
  listarTalles,
  obtenerMiPedido,
  seguirPedido,
  listarProductos,
  obtenerConfiguracion,
  obtenerMiDescuento,
  obtenerProducto,
} from "@/features/tienda/api/tienda.api";
import type { FiltrosCatalogo, ItemCarritoInput } from "@/types/tienda";

export const TIENDA_QUERY_KEY = ["tienda"] as const;

export function useCategoriasTienda() {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "categorias"],
    queryFn: listarCategorias,
    staleTime: 5 * 60_000,
  });
}

export function useTallesTienda() {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "talles"],
    queryFn: listarTalles,
    staleTime: 60_000,
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

/**
 * Cotización del carrito. Se pide cada vez que se mira el carrito o la
 * compra, así se ven los cambios de precio y de stock. Depende de la sesión:
 * el socio la recibe con su descuento.
 */
export function useCotizacion(items: ItemCarritoInput[], habilitada = true) {
  const { user } = useSession();

  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "cotizacion", user?.id ?? null, items],
    queryFn: () => cotizarCarrito(items),
    enabled: habilitada && items.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    // El stock cambió: la grilla y las fichas tienen que volver a pedirse.
    onSettled: () => void queryClient.invalidateQueries({ queryKey: TIENDA_QUERY_KEY }),
  });
}

export function useSeguimientoPedido(token: string | null) {
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "seguimiento", token],
    queryFn: () => seguirPedido(token!),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useMisPedidos(page: number) {
  const { user } = useSession();
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "mis-pedidos", user?.id, page],
    queryFn: () => listarMisPedidos({ page, pageSize: 10 }),
    enabled: user?.rol === "SOCIO",
    placeholderData: keepPreviousData,
  });
}

export function useMiPedido(codigo: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: [...TIENDA_QUERY_KEY, "mi-pedido", user?.id, codigo],
    queryFn: () => obtenerMiPedido(codigo),
    enabled: user?.rol === "SOCIO",
    retry: false,
  });
}
