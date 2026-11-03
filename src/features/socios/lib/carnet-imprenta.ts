import qrcode from "qrcode-generator";

import {
  AZUL_QR,
  LEYENDA_CARNET,
  pngConResolucion,
  ROJO_CARNET,
} from "@/features/socios/lib/carnet";
import type { CarnetSocio } from "@/types/socio";

/**
 * Archivo del dorso para la imprenta.
 *
 * La imprenta ya imprime el fondo de las dos caras (la banda y la textura);
 * lo que se le manda es solo lo que va encima, en la zona blanca: foto,
 * nombre, apellido, categoría, QR y leyenda. Sale del tamaño del carnet
 * completo y con el resto transparente, así lo apoyan sobre su diseño sin
 * mover nada.
 *
 * Todas las medidas están tomadas del dorso original del club (DORSOS.png,
 * 1993 × 1107 px a 562 dpi, o sea un carnet de 90 × 50 mm), en sus mismos
 * píxeles. Por eso van como números fijos y no derivadas de la tarjeta de
 * pantalla: lo que importa es que caigan exactamente donde caían ahí.
 */
const DISEÑO = {
  ancho: 1993,
  alto: 1107,
  /** El mismo que trae el archivo original: 22126 puntos por metro. */
  dpi: 562,
  foto: { x: 148, y: 382, lado: 477, radio: 20 },
  textos: {
    x: 688,
    /** Hasta dónde puede llegar un nombre antes del margen blanco del QR. */
    anchoMaximo: 790,
    etiqueta: 54,
    dato: 93,
    /** Líneas de base de cada renglón. */
    lineas: { nombre: 430, valorNombre: 517, apellido: 607, valorApellido: 711, categoria: 808 },
  },
  qr: { x: 1549, y: 468, lado: 311, margenModulos: 4 },
  leyenda: { x: 150, primeraLinea: 974, interlineado: 49.5, cuerpo: 37, anchoMaximo: 1715 },
} as const;

const FAMILIA = "CdiCarnetImprenta";

/** Open Sans Bold, la tipografía del carnet. Viene con el sitio, en /public/fonts. */
const FUENTES = [
  {
    url: "/fonts/open-sans-latin-700-normal.woff2",
    rango:
      "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
  },
  {
    url: "/fonts/open-sans-latin-ext-700-normal.woff2",
    rango:
      "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
  },
];

let fuentesCargadas: Promise<void> | null = null;

/**
 * Sin la fuente cargada, el lienzo dibuja con la del sistema y los textos
 * cambian de ancho: se carga una vez y se reusa.
 */
function cargarFuentes(): Promise<void> {
  fuentesCargadas ??= Promise.all(
    FUENTES.map(async ({ url, rango }) => {
      const fuente = new FontFace(FAMILIA, `url(${url})`, {
        weight: "700",
        unicodeRange: rango,
      });
      await fuente.load();
      document.fonts.add(fuente);
    }),
  ).then(() => undefined);

  return fuentesCargadas.catch((error) => {
    fuentesCargadas = null;
    throw error;
  });
}

function fuente(cuerpo: number): string {
  return `700 ${cuerpo}px ${FAMILIA}`;
}

/** Achica el cuerpo lo justo para que un nombre largo no invada el QR. */
function cuerpoQueEntra(ctx: CanvasRenderingContext2D, texto: string): number {
  const { dato, anchoMaximo } = DISEÑO.textos;
  ctx.font = fuente(dato);
  const ancho = ctx.measureText(texto).width;
  return ancho <= anchoMaximo ? dato : Math.floor((dato * anchoMaximo) / ancho);
}

/** Corta la leyenda en renglones del ancho del diseño. */
function renglones(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const resultado: string[] = [];
  let actual = "";

  for (const palabra of texto.split(/\s+/)) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (actual && ctx.measureText(prueba).width > ancho) {
      resultado.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) resultado.push(actual);

  return resultado;
}

/**
 * La foto se trae como datos y no con un <img> suelto: así el lienzo no
 * queda "contaminado" por venir de otro origen y se puede exportar.
 */
async function cargarFoto(url: string): Promise<ImageBitmap> {
  const respuesta = await fetch(url, { cache: "no-store" });
  if (!respuesta.ok) throw new Error(`No se pudo bajar la foto (${respuesta.status}).`);
  return createImageBitmap(await respuesta.blob());
}

/** Recorta al centro para llenar el cuadrado, como `object-fit: cover`. */
function dibujarFoto(ctx: CanvasRenderingContext2D, foto: ImageBitmap) {
  const { x, y, lado, radio } = DISEÑO.foto;
  const escala = Math.max(lado / foto.width, lado / foto.height);
  const ancho = foto.width * escala;
  const alto = foto.height * escala;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, lado, lado, radio);
  ctx.clip();
  ctx.drawImage(foto, x + (lado - ancho) / 2, y + (lado - alto) / 2, ancho, alto);
  ctx.restore();
}

/**
 * El mismo código que dibuja react-qr-code en el carnet de pantalla (usa
 * esta misma librería con el mismo nivel), en el lugar y el tamaño del
 * diseño. Lleva su margen blanco de cuatro módulos: sobre la textura, sin
 * ese margen, el lector no engancha.
 */
function dibujarQr(ctx: CanvasRenderingContext2D, valor: string) {
  const codigo = qrcode(0, "M");
  codigo.addData(valor);
  codigo.make();

  const modulos = codigo.getModuleCount();
  const { x, y, lado, margenModulos } = DISEÑO.qr;
  const modulo = lado / modulos;
  const margen = modulo * margenModulos;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x - margen, y - margen, lado + margen * 2, lado + margen * 2);

  ctx.fillStyle = AZUL_QR;
  for (let fila = 0; fila < modulos; fila++) {
    for (let columna = 0; columna < modulos; columna++) {
      if (!codigo.isDark(fila, columna)) continue;
      // Se redondea a píxel entero para que no queden rayas finas entre módulos.
      const x0 = Math.round(x + columna * modulo);
      const y0 = Math.round(y + fila * modulo);
      ctx.fillRect(
        x0,
        y0,
        Math.round(x + (columna + 1) * modulo) - x0,
        Math.round(y + (fila + 1) * modulo) - y0,
      );
    }
  }
}

/** Arma el PNG del dorso de un socio para mandar a la imprenta. */
export async function generarDorsoParaImprenta(
  socio: Pick<CarnetSocio, "nombre" | "apellido" | "tipoSocio" | "fotoUrl"> & {
    carnetUrl: string;
  },
): Promise<Blob> {
  const [, foto] = await Promise.all([
    cargarFuentes(),
    socio.fotoUrl ? cargarFoto(socio.fotoUrl) : Promise.resolve(null),
  ]);

  const lienzo = document.createElement("canvas");
  lienzo.width = DISEÑO.ancho;
  lienzo.height = DISEÑO.alto;

  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("El navegador no pudo crear el lienzo.");

  if (foto) dibujarFoto(ctx, foto);

  const { x, etiqueta, lineas } = DISEÑO.textos;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = ROJO_CARNET;
  ctx.font = fuente(etiqueta);
  ctx.fillText("NOMBRE", x, lineas.nombre);
  ctx.fillText("APELLIDO", x, lineas.apellido);
  ctx.fillText(socio.tipoSocio.nombre.toUpperCase(), x, lineas.categoria);

  ctx.fillStyle = "#000000";
  for (const [texto, linea] of [
    [socio.nombre, lineas.valorNombre],
    [socio.apellido, lineas.valorApellido],
  ] as const) {
    ctx.font = fuente(cuerpoQueEntra(ctx, texto));
    ctx.fillText(texto, x, linea);
  }

  dibujarQr(ctx, socio.carnetUrl);

  const { leyenda } = DISEÑO;
  ctx.fillStyle = "#000000";
  ctx.font = fuente(leyenda.cuerpo);
  renglones(ctx, LEYENDA_CARNET, leyenda.anchoMaximo).forEach((renglon, indice) => {
    ctx.fillText(renglon, leyenda.x, leyenda.primeraLinea + indice * leyenda.interlineado);
  });

  const png = await new Promise<Blob>((listo, fallo) =>
    lienzo.toBlob(
      (blob) => (blob ? listo(blob) : fallo(new Error("No se pudo generar la imagen."))),
      "image/png",
    ),
  );

  return pngConResolucion(png, DISEÑO.dpi);
}

/** Medida del carnet en milímetros, para explicarla en la interfaz. */
export const MM_CARNET_IMPRENTA = {
  ancho: Math.round((DISEÑO.ancho / DISEÑO.dpi) * 25.4),
  alto: Math.round((DISEÑO.alto / DISEÑO.dpi) * 25.4),
};
