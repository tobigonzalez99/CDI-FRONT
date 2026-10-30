import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type {
  CreateSocioInput,
  CreateSocioResponse,
  GenerarQrResponse,
  Socio,
  SocioFilters,
  TipoSocio,
  UpdateSocioInput,
} from "@/types/socio";

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

/**
 * Alta manual desde el panel. La respuesta trae `passwordInicial` **una
 * única vez**.
 *
 * Sin foto va como JSON. Con foto va como `multipart/form-data`, y ahí la
 * vigencia o el cobro viajan serializados en un solo campo, porque multer no
 * reconstruye objetos anidados.
 */
export async function crearSocio(input: CreateSocioInput): Promise<CreateSocioResponse> {
  const { foto, ...campos } = input;

  if (!foto) {
    const { data } = await api.post<CreateSocioResponse>("/socios", campos);
    return data;
  }

  const formData = new FormData();
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor === undefined) continue;
    formData.append(clave, typeof valor === "object" ? JSON.stringify(valor) : String(valor));
  }
  formData.append("foto", foto);

  const { data } = await api.post<CreateSocioResponse>("/socios", formData);
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

/**
 * "Reactivar": devuelve al socio al estado ALTA.
 *
 * La baja no borra nada —es un estado—, así que reactivar le devuelve su
 * ficha, su vigencia y su historial tal como estaban, y vuelve a poder
 * iniciar sesión.
 */
export async function reactivarSocio(id: string): Promise<Socio> {
  const { data } = await api.patch<Socio>(`/socios/${id}/alta`);
  return data;
}

/**
 * Asigna el código de carnet a los socios activos que todavía no lo tienen.
 *
 * A los que ya lo tienen **no los toca**, y eso no es una optimización: el
 * carnet ya está repartido por WhatsApp y guardado en el teléfono del socio.
 * Cambiarle el código lo dejaría sin servir sin que nadie se entere hasta la
 * puerta de la cancha.
 */
export async function generarCodigosDeCarnet(): Promise<GenerarQrResponse> {
  const { data } = await api.post<GenerarQrResponse>("/socios/generar-qr");
  return data;
}
