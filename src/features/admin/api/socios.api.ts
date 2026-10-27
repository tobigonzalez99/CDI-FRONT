import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { Socio, SocioFilters, TipoSocio } from "@/types/socio";

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
