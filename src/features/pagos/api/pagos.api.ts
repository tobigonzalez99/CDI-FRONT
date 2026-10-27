import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  AnulacionResponse,
  AnularPagoInput,
  CreatePagoInput,
  Cuenta,
  HistorialDeSocio,
  Pago,
  PagoFilters,
  ResumenCobranzas,
  VistaAnulacion,
} from "@/types/pago";

/** Descarta claves vacías para no mandar `?search=&estado=` al backend. */
function limpiarParams<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, valor]) => valor !== undefined && valor !== null && valor !== "",
    ),
  );
}

/**
 * Historial del socio autenticado.
 *
 * Pide `anulacion: "todos"` a propósito: el backend por defecto deja fuera los
 * anulados, pero el socio tiene que poder ver que un cobro suyo fue dado de
 * baja y por qué. Esconderlo haría desaparecer un movimiento de su cuenta.
 */
export async function obtenerMisPagos(
  anulacion: VistaAnulacion = "todos",
): Promise<PaginatedResponse<Pago>> {
  const { data } = await api.get<PaginatedResponse<Pago>>("/pagos/mios", {
    params: { anulacion },
  });
  return data;
}

export async function listarPagos(
  filtros: PagoFilters,
): Promise<PaginatedResponse<Pago>> {
  const { data } = await api.get<PaginatedResponse<Pago>>("/pagos", {
    params: limpiarParams(filtros),
  });
  return data;
}

/** Historial de un socio con sus totales ya calculados por el backend. */
export async function obtenerHistorialDeSocio(
  socioId: string,
  anulacion: VistaAnulacion = "todos",
): Promise<HistorialDeSocio> {
  const { data } = await api.get<HistorialDeSocio>(`/pagos/socio/${socioId}`, {
    params: { anulacion },
  });
  return data;
}

export async function obtenerResumenCobranzas(rango?: {
  desde?: string;
  hasta?: string;
}): Promise<ResumenCobranzas> {
  const { data } = await api.get<ResumenCobranzas>("/pagos/resumen", {
    params: rango ? limpiarParams(rango) : undefined,
  });
  return data;
}

/** Registrar el cobro extiende la vigencia del socio en la misma transacción. */
export async function registrarPago(input: CreatePagoInput): Promise<Pago> {
  const { data } = await api.post<Pago>("/pagos", input);
  return data;
}

/**
 * Un pago no se borra: se anula con motivo y queda auditable.
 * Si la respuesta trae `requiereRevisarVigencia`, la vigencia del socio se
 * apoyaba en ese cobro y hay que revisarla a mano.
 */
export async function anularPago(
  id: string,
  input: AnularPagoInput,
): Promise<AnulacionResponse> {
  const { data } = await api.patch<AnulacionResponse>(`/pagos/${id}/anular`, input);
  return data;
}

export async function listarCuentas(soloActivas = true): Promise<Cuenta[]> {
  const { data } = await api.get<Cuenta[]>("/cuentas", {
    params: { soloActivas },
  });
  return data;
}
