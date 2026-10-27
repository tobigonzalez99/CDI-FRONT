import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { CreateSocioResponse, TipoSocio } from "@/types/socio";
import type {
  AprobarSolicitudInput,
  CreateSolicitudInput,
  SolicitudEnviadaResponse,
  SolicitudFilters,
  SolicitudSocio,
} from "@/types/solicitud";

/** Categorías activas para el formulario público. No requiere sesión. */
export async function listarTiposDisponibles(): Promise<TipoSocio[]> {
  const { data } = await api.get<TipoSocio[]>("/tipos-socio/disponibles");
  return data;
}

/**
 * Envío público del formulario "Hacete socio".
 * Va como `multipart/form-data` porque la foto es obligatoria.
 */
export async function enviarSolicitud(
  input: CreateSolicitudInput,
): Promise<SolicitudEnviadaResponse> {
  const formData = new FormData();

  for (const [clave, valor] of Object.entries(input)) {
    if (valor === undefined || valor === null || valor === "") continue;
    formData.append(clave, valor as string | Blob);
  }

  const { data } = await api.post<SolicitudEnviadaResponse>("/solicitudes", formData);
  return data;
}

export async function listarSolicitudes(
  filtros?: SolicitudFilters,
): Promise<PaginatedResponse<SolicitudSocio>> {
  const { data } = await api.get<PaginatedResponse<SolicitudSocio>>("/solicitudes", {
    params: filtros,
  });
  return data;
}

export async function contarSolicitudesPendientes(): Promise<number> {
  const { data } = await api.get<{ pendientes: number }>(
    "/solicitudes/pendientes/total",
  );
  return data.pendientes;
}

/**
 * "Dar de alta": crea el socio y borra la solicitud.
 * La respuesta trae `passwordInicial` una única vez.
 */
export async function aprobarSolicitud(
  id: string,
  input?: AprobarSolicitudInput,
): Promise<CreateSocioResponse> {
  const { data } = await api.post<CreateSocioResponse>(
    `/solicitudes/${id}/aprobar`,
    input ?? {},
  );
  return data;
}

/** "Rechazar solicitud": borra los datos y la foto. No se puede deshacer. */
export async function rechazarSolicitud(id: string): Promise<void> {
  await api.delete(`/solicitudes/${id}`);
}
