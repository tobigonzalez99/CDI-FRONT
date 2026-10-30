"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { consultarEstadoPago } from "@/features/mercadopago/api/mercadopago.api";

/**
 * Esperas entre consultas mientras el pago siga pendiente: 1, 2, 4, 8 y 16
 * segundos. Son unos 30 segundos en total, que alcanzan de sobra para que
 * llegue la confirmación de un pago con tarjeta o con dinero en cuenta.
 */
const ESPERAS_MS = [1_000, 2_000, 4_000, 8_000, 16_000];

/**
 * Estado del pago al volver de Mercado Pago, reintentando mientras siga
 * pendiente. Cuando se agotan las esperas, `agotado` pasa a `true` y la
 * pantalla deja de decir "estamos confirmando" para decir "se está
 * procesando, te avisamos por correo".
 */
export function useEstadoPago(ref: string) {
  const queryClient = useQueryClient();
  const queryKey = ["mercadopago", "estado", ref];

  const consulta = useQuery({
    queryKey,
    queryFn: () => consultarEstadoPago(ref),
    enabled: Boolean(ref),
    staleTime: 0,
    refetchInterval: (query) => {
      if (query.state.data?.estado !== "PENDIENTE") return false;
      // Después de la primera respuesta, `dataUpdateCount` vale 1.
      return ESPERAS_MS[query.state.dataUpdateCount - 1] ?? false;
    },
  });

  // Cuántas respuestas llegaron: está en el estado de la consulta, no en el
  // resultado del hook. Se lee en cada render, que ocurre con cada respuesta.
  const respuestas = queryClient.getQueryState(queryKey)?.dataUpdateCount ?? 0;
  const agotado = consulta.data?.estado === "PENDIENTE" && respuestas > ESPERAS_MS.length;

  return { ...consulta, agotado };
}
