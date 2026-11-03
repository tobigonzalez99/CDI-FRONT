"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activarDebito,
  cancelarDebito,
  obtenerDebito,
} from "@/features/mercadopago/api/mercadopago.api";

export const DEBITO_QUERY_KEY = ["mercadopago", "debito"] as const;

/**
 * Estado del débito automático. Se vuelve a pedir al volver a la pestaña,
 * porque el socio confirma la suscripción en Mercado Pago y vuelve a mano; y
 * mientras está pendiente se consulta cada medio minuto, porque el backend
 * lo actualiza solo cada dos minutos.
 */
export function useDebito(habilitado = true) {
  return useQuery({
    queryKey: DEBITO_QUERY_KEY,
    queryFn: obtenerDebito,
    enabled: habilitado,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => (query.state.data?.estado === "PENDIENTE" ? 30_000 : false),
  });
}

export function useActivarDebito() {
  return useMutation({ mutationFn: activarDebito });
}

export function useCancelarDebito() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelarDebito,
    onSettled: () => void queryClient.invalidateQueries({ queryKey: DEBITO_QUERY_KEY }),
  });
}
