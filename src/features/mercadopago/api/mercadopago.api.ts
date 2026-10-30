import { api } from "@/lib/api/client";
import type {
  CotizacionCuota,
  EstadoPagoMpResponse,
  IniciarPagoCuotaInput,
  IniciarPagoCuotaResponse,
} from "@/types/mercadopago";

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

/** Cuánto sale pagar `meses` cuotas. El front nunca calcula importes. */
export async function cotizarCuota(meses: number): Promise<CotizacionCuota> {
  const { data } = await api.get<CotizacionCuota>("/pagos/mercadopago/cotizacion", {
    params: { meses },
  });
  return data;
}

/**
 * Crea el cobro en Mercado Pago. Si ya hay uno abierto por los mismos meses
 * e importe, devuelve ese: apretar "Pagar" dos veces no crea dos cobros.
 */
export async function iniciarPagoCuota(
  input: IniciarPagoCuotaInput,
): Promise<IniciarPagoCuotaResponse> {
  const { data } = await api.post<IniciarPagoCuotaResponse>("/pagos/mercadopago/cuota", input);
  return data;
}
