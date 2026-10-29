import { api } from "@/lib/api/client";
import type { CarnetPublico } from "@/types/carnet";

/**
 * Lo que se consulta al escanear el QR de un carnet.
 *
 * Es público a propósito: quien cobra la entrada en la cancha no es socio ni
 * tiene sesión, apunta la cámara y listo.
 */
export async function consultarCarnet(codigo: string): Promise<CarnetPublico> {
  const { data } = await api.get<CarnetPublico>(`/carnet/${encodeURIComponent(codigo)}`);
  return data;
}
