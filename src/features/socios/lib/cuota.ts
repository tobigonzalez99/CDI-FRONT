import { formatearVigencia } from "@/lib/formato";
import type { Socio, TipoSocio } from "@/types/socio";

/**
 * Si la categoría paga cuota. Juvenil y Campeón no: el backend los da siempre
 * por al día (salvo la baja), no les registra cobros y no les manda avisos.
 *
 * No hay un campo aparte: todo sale de que `montoCuota` sea `null`, así una
 * categoría nueva sin cuota se comporta igual sin tocar código.
 */
export function pagaCuota(tipo: Pick<TipoSocio, "montoCuota">): boolean {
  return tipo.montoCuota !== null;
}

/** Lo que se muestra donde va la vigencia. */
export const SIN_CUOTA = "Sin cuota";

/**
 * La vigencia como texto, o "Sin cuota". En un socio sin cuota la fecha la
 * guarda el backend solo porque la columna la exige, y mostrarla haría pensar
 * que se le puede vencer.
 */
export function textoVigencia(socio: Pick<Socio, "tipoSocio" | "vigencia">): string {
  return pagaCuota(socio.tipoSocio)
    ? formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)
    : SIN_CUOTA;
}

/** Para la categoría elegida en un formulario, cuando solo se tiene el id. */
export const AVISO_SIN_CUOTA = "Esta categoría no paga cuota: queda siempre al día.";
