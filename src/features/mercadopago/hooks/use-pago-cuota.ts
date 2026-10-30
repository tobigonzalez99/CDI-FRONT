"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { cotizarCuota, iniciarPagoCuota } from "@/features/mercadopago/api/mercadopago.api";

/**
 * Total a pagar por la cantidad de meses elegida. Mantiene el anterior
 * mientras llega el nuevo, para que el número no parpadee al cambiar.
 */
export function useCotizacionCuota(meses: number) {
  return useQuery({
    queryKey: ["mercadopago", "cotizacion", meses],
    queryFn: () => cotizarCuota(meses),
    placeholderData: keepPreviousData,
  });
}

export function useIniciarPagoCuota() {
  return useMutation({ mutationFn: iniciarPagoCuota });
}
