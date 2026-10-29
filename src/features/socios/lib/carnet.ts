/**
 * Texto legal del carnet, tal como está impreso en el dorso del carnet
 * físico del club. Lo escribió el club: no se reescribe acá.
 */
export const LEYENDA_CARNET =
  "Este carnet es de uso personal e intransferible. Su uso indebido será penado y " +
  "habilita su retención. En caso de extravío se deberá abonar su reposición. En caso " +
  "de hallar este carnet devolverlo al Club Deportivo Independencia en España N°1, " +
  "7513, Adolfo G. Chaves";

/** Rojo de las etiquetas, tomado del diseño original del club. */
export const ROJO_CARNET = "#ed3137";

export function inicialesDe(nombre: string, apellido: string): string {
  return `${nombre.at(0) ?? ""}${apellido.at(0) ?? ""}`.toUpperCase();
}

/**
 * Nombre del archivo que se descarga.
 *
 * Va sin tildes ni eñes: el archivo viaja por WhatsApp y termina en teléfonos
 * y computadoras de cualquier tipo, donde un nombre con acentos se ve roto.
 */
export function nombreDeArchivo(numeroSocio: number, apellido: string): string {
  const limpio = apellido
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();

  return `carnet-cdi-${numeroSocio}-${limpio || "socio"}.png`;
}

/**
 * Azul del código QR en el carnet impreso del club.
 *
 * Se usa en la tarjeta que reproduce ese carnet. El carnet para el celular
 * lleva el QR en negro, como el modelo del que salió.
 */
export const AZUL_QR = "#373dcd";
