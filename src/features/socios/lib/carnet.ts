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
export function nombreDeArchivo(
  prefijo: string,
  numeroSocio: number,
  apellido: string,
  extension: string,
): string {
  const limpio = apellido
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();

  return `${prefijo}-cdi-${numeroSocio}-${limpio || "socio"}.${extension}`;
}

/**
 * Azul del código QR en el carnet impreso del club.
 *
 * Se usa en la tarjeta que reproduce ese carnet. El carnet para el celular
 * lleva el QR en negro, como el modelo del que salió.
 */
export const AZUL_QR = "#373dcd";

/**
 * Módulos blancos que se dejan alrededor del código al imprimirlo.
 *
 * No es decoración: un QR pegado contra otra tinta no engancha. La norma pide
 * cuatro módulos de margen y es el error más común al mandar un QR a imprenta.
 */
const MARGEN_MODULOS = 4;

/**
 * Lado del archivo que se manda a la imprenta, en milímetros, **margen
 * incluido**.
 *
 * Sale de las proporciones del carnet del club: el QR ocupa el 18,6 % del
 * ancho de la tarjeta, que en una tarjeta estándar (85,6 mm) son casi 16 mm.
 * Con los cuatro módulos de margen el archivo completo queda en 20 mm, y el
 * código adentro conserva esos 16 mm.
 */
export const MM_QR_IMPRENTA = 20;

/**
 * Arma el archivo del QR para mandar a imprimir, a partir del que ya está
 * dibujado en pantalla.
 *
 * Va en SVG y no en PNG porque es vectorial: la imprenta lo agranda o lo
 * achica al tamaño que necesite y los bordes siguen saliendo limpios, que es
 * justo de lo que depende que el lector lo enganche. Además lleva medidas en
 * milímetros, así entra en el diseño con el tamaño que le corresponde sin que
 * nadie tenga que calcularlo.
 */
export function svgDeQrParaImprenta(origen: SVGSVGElement): string {
  const [, , ancho] = (origen.getAttribute("viewBox") ?? "").split(" ");
  const modulos = Number(ancho);

  if (!Number.isFinite(modulos) || modulos <= 0) {
    throw new Error("El código QR dibujado no tiene un viewBox utilizable.");
  }

  // react-qr-code dibuja primero el fondo y después el código; acá el fondo
  // lo pone el <rect>, que además cubre el margen.
  const trazados = origen.querySelectorAll("path");
  const codigo = trazados[trazados.length - 1];

  if (!codigo) throw new Error("El código QR dibujado no tiene contenido.");

  const lado = modulos + MARGEN_MODULOS * 2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${MM_QR_IMPRENTA}mm" height="${MM_QR_IMPRENTA}mm" viewBox="0 0 ${lado} ${lado}" shape-rendering="crispEdges">`,
    `<rect width="${lado}" height="${lado}" fill="#FFFFFF"/>`,
    `<g transform="translate(${MARGEN_MODULOS} ${MARGEN_MODULOS})" fill="#000000">`,
    `<path d="${codigo.getAttribute("d") ?? ""}"/>`,
    `</g></svg>`,
  ].join("");
}
