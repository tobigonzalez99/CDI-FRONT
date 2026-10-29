import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { Socio } from "@/types/socio";
import type {
  CreateSolicitudBajaInput,
  MiSolicitudBaja,
  SolicitudBaja,
  SolicitudBajaFilters,
} from "@/types/solicitud-baja";

/* --- Lado del socio --- */

/** Si el socio tiene un pedido de baja en curso. */
export async function obtenerMiSolicitudBaja(): Promise<MiSolicitudBaja> {
  const { data } = await api.get<MiSolicitudBaja>("/solicitudes-baja/mia");
  return data;
}

/**
 * El socio pide la baja. El motivo es opcional a propósito: no se le pone un
 * trámite a alguien para dejar de ser socio.
 *
 * Un segundo envío responde 409: el pedido ya está hecho.
 */
export async function pedirBaja(
  input: CreateSolicitudBajaInput = {},
): Promise<MiSolicitudBaja> {
  const { data } = await api.post<MiSolicitudBaja>("/solicitudes-baja", input);
  return data;
}

/** El socio se arrepiente antes de que el club resuelva. */
export async function cancelarMiSolicitudBaja(): Promise<void> {
  await api.delete("/solicitudes-baja/mia");
}

/* --- Lado del administrador --- */

export async function listarSolicitudesBaja(
  filtros?: SolicitudBajaFilters,
): Promise<PaginatedResponse<SolicitudBaja>> {
  const { data } = await api.get<PaginatedResponse<SolicitudBaja>>("/solicitudes-baja", {
    params: filtros,
  });
  return data;
}

export async function contarBajasPendientes(): Promise<number> {
  const { data } = await api.get<{ pendientes: number }>(
    "/solicitudes-baja/pendientes/total",
  );
  return data.pendientes;
}

/** "Dar de baja": el socio queda en estado BAJA y no puede volver a entrar. */
export async function aprobarBaja(id: string): Promise<Socio> {
  const { data } = await api.post<Socio>(`/solicitudes-baja/${id}/aprobar`);
  return data;
}

/** "Cancelar la baja": se borra el pedido y el socio sigue activo. */
export async function rechazarBaja(id: string): Promise<void> {
  await api.delete(`/solicitudes-baja/${id}`);
}
