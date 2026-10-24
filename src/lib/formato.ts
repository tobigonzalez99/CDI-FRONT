import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import type { ISODateString } from "@/types/api";

/**
 * Fechas sin hora (`2026-10-16`). Se parsean con `parseISO`, que las
 * interpreta en la zona local: usar `new Date("2026-10-16")` las trataría
 * como UTC y podría mostrar el día anterior.
 */
export function formatearFecha(fecha: ISODateString): string {
  return format(parseISO(fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatearFechaCorta(fecha: ISODateString): string {
  return format(parseISO(fecha), "dd/MM/yyyy");
}

/** Rango de vigencia tal como lo nombra el club: "16/09 al 16/10". */
export function formatearVigencia(desde: ISODateString, hasta: ISODateString): string {
  return `${formatearFechaCorta(desde)} al ${formatearFechaCorta(hasta)}`;
}

const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearMonto(monto: number): string {
  return formatoPesos.format(monto);
}

/** Días que faltan para una fecha; negativo si ya pasó. */
export function diasHasta(fecha: ISODateString, hoy = new Date()): number {
  const objetivo = parseISO(fecha);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  return Math.round((objetivo.getTime() - inicioHoy.getTime()) / MS_POR_DIA);
}
