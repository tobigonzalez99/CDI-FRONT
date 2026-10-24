import { api } from "@/lib/api/client";
import type { Socio } from "@/types/socio";

/** HU-04: ficha del socio autenticado, con el estado de su cuota. */
export async function obtenerMiPerfil(): Promise<Socio> {
  const { data } = await api.get<Socio>("/perfil/me");
  return data;
}
