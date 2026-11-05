/**
 * Tipos de talle del panel. El tipo no se guarda: se deduce de los talles
 * cargados, que son texto libre porque cada marca usa los suyos. Elegir un
 * tipo solo propone los nombres, y se pueden corregir uno por uno.
 */
export const TIPOS_TALLE = [
  { valor: "LETRAS", etiqueta: "Letras", sugeridos: ["S", "M", "L", "XL", "XXL"] },
  { valor: "NUMEROS", etiqueta: "Números", sugeridos: ["38", "40", "42", "44", "46"] },
  { valor: "OTRO", etiqueta: "A medida", sugeridos: [] },
] as const;

export type TipoTalle = (typeof TIPOS_TALLE)[number]["valor"];

export const TALLES_SUGERIDOS: readonly string[] = TIPOS_TALLE[0].sugeridos;

const ES_LETRA = /^(X{0,4}S|M|X{0,5}L)$/;
const ES_NUMERO = /^\d+([.,]\d+)?$/;

export function tipoDeTalles(talles: string[]): TipoTalle {
  const cargados = talles.map((talle) => talle.trim().toUpperCase()).filter(Boolean);
  if (cargados.length === 0) return "OTRO";
  if (cargados.every((talle) => ES_LETRA.test(talle))) return "LETRAS";
  if (cargados.every((talle) => ES_NUMERO.test(talle))) return "NUMEROS";
  return "OTRO";
}

/**
 * Renombra las filas en orden con los talles del tipo elegido y suma las que
 * falten. El stock de cada fila no cambia.
 */
export function aplicarTipoTalle<T extends { talle: string }>(
  filas: T[],
  tipo: TipoTalle,
  crearFila: (talle: string) => T,
): T[] {
  const sugeridos: readonly string[] = TIPOS_TALLE.find((item) => item.valor === tipo)?.sugeridos ?? [];
  const renombradas = filas.map((fila, indice) => ({ ...fila, talle: sugeridos[indice] ?? "" }));
  return [...renombradas, ...sugeridos.slice(filas.length).map(crearFila)];
}
