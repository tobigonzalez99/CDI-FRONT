/**
 * Precio de un socio con su porcentaje, como lo calcula la API: en centavos,
 * redondeado con medio centavo hacia arriba. Es solo para mostrar: el precio
 * de un pedido lo calcula siempre la API.
 */
export function precioConDescuento(precio: number, porcentaje: number): number {
  const centavos = Math.round(precio * 100);
  const basisPoints = Math.round(porcentaje * 100);
  return Math.round((centavos * (10000 - basisPoints)) / 10000) / 100;
}
