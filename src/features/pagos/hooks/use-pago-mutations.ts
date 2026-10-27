"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { anularPago, registrarPago } from "@/features/pagos/api/pagos.api";
import { PAGOS_QUERY_KEY } from "@/features/pagos/hooks/use-pagos";
import { SOCIOS_QUERY_KEY } from "@/features/admin/hooks/use-socios";
import type { AnularPagoInput } from "@/types/pago";

/**
 * Registrar el cobro también extiende la vigencia del socio, así que además
 * de los pagos hay que invalidar el padrón: el estado de cuota cambia.
 */
export function useRegistrarPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarPago,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAGOS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: SOCIOS_QUERY_KEY });
    },
  });
}

export function useAnularPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AnularPagoInput }) =>
      anularPago(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PAGOS_QUERY_KEY });
    },
  });
}
