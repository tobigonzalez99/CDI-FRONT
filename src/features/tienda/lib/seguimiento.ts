/**
 * El token de seguimiento de un pedido nunca va en la URL de la tienda: con
 * él cualquiera ve el pedido. Llega en el correo (`/tienda/pedido?token=…`)
 * o en la respuesta al confirmar, y mientras la pestaña está abierta se
 * guarda en `sessionStorage`, que se borra al cerrarla.
 */
const CLAVE = "cdi-tienda-seguimiento";

export function guardarTokenSeguimiento(token: string) {
  try {
    window.sessionStorage.setItem(CLAVE, token);
  } catch {
    // Sin almacenamiento, el pedido se ve con el enlace del correo.
  }
}

export function leerTokenSeguimiento(): string | null {
  try {
    return window.sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

/** El token tiene 256 bits; esto descarta lo que claramente no lo es. */
export function pareceToken(valor: string): boolean {
  return /^[A-Za-z0-9_-]{20,200}$/.test(valor);
}
