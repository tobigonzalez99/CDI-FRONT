import { api } from "@/lib/api/client";
import type { EstadoPagoMpResponse } from "@/types/mercadopago";

/**
 * Cómo salió un pago, según el backend.
 *
 * Es la única fuente válida: Mercado Pago vuelve al sitio con sus propios
 * parámetros en la URL, pero cualquiera puede escribirlos a mano. Si el
 * estado local todavía está pendiente, el backend le pregunta a Mercado Pago
 * antes de responder.
 */
export async function consultarEstadoPago(ref: string): Promise<EstadoPagoMpResponse> {
  const { data } = await api.get<EstadoPagoMpResponse>(
    `/pagos/mercadopago/estado/${encodeURIComponent(ref)}`,
  );
  return data;
}
