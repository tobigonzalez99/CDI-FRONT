import { api } from "@/lib/api/client";
import type { Socio, UpdateMiPerfilInput } from "@/types/socio";

/** HU-04: ficha del socio autenticado, con el estado de su cuota. */
export async function obtenerMiPerfil(): Promise<Socio> {
  const { data } = await api.get<Socio>("/perfil/me");
  return data;
}

/**
 * Edita los únicos campos que el socio controla de su ficha.
 *
 * Con foto va como `multipart/form-data`; sin foto, como JSON. Mandar siempre
 * multipart obligaría al backend a reconstruir los tipos desde strings sin
 * ninguna necesidad.
 */
export async function actualizarMiPerfil(input: UpdateMiPerfilInput): Promise<Socio> {
  const { foto, ...campos } = input;

  if (!foto) {
    const { data } = await api.patch<Socio>("/perfil/me", campos);
    return data;
  }

  const formData = new FormData();
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor !== undefined) formData.append(clave, valor);
  }
  formData.append("foto", foto);

  const { data } = await api.patch<Socio>("/perfil/me", formData);
  return data;
}
