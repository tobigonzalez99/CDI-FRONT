import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { Socio, SocioFilters, TipoSocio, UpdateSocioInput } from "@/types/socio";

/** Descarta claves vacías para no mandar `?search=&estado=` al backend. */
function limpiarParams<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, valor]) => valor !== undefined && valor !== null && valor !== "",
    ),
  );
}

/** HU-08: padrón con búsqueda, filtros y paginación. */
export async function listarSocios(
  filtros: SocioFilters,
): Promise<PaginatedResponse<Socio>> {
  const { data } = await api.get<PaginatedResponse<Socio>>("/socios", {
    params: limpiarParams(filtros),
  });
  return data;
}

export async function obtenerSocio(id: string): Promise<Socio> {
  const { data } = await api.get<Socio>(`/socios/${id}`);
  return data;
}

export async function listarTiposSocio(soloActivos = true): Promise<TipoSocio[]> {
  const { data } = await api.get<TipoSocio[]>("/tipos-socio", {
    params: { soloActivos },
  });
  return data;
}

/**
 * Edita la ficha de un socio desde el panel.
 *
 * Va como JSON y no como `multipart/form-data`: con multipart el backend
 * recibiría todo convertido a texto y habría que serializar `vigencia` a
 * mano, porque multer no reconstruye objetos anidados. La foto queda fuera
 * por ahora; el día que se agregue, ese caso sí necesita multipart.
 */
export async function actualizarSocio(
  id: string,
  input: Omit<UpdateSocioInput, "foto">,
): Promise<Socio> {
  const { data } = await api.patch<Socio>(`/socios/${id}`, input);
  return data;
}
