"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatosCarnet } from "@/features/socios/components/datos-carnet";
import {
  DPI_IMPRENTA,
  FUENTE_DESCARGA,
  MM_ALTO_DATOS_CARNET,
  MM_ANCHO_CARNET_FISICO,
  nombreDeArchivo,
  PX_ANCHO_CARNET_FISICO,
  pngConResolucion,
} from "@/features/socios/lib/carnet";
import type { CarnetSocio } from "@/types/socio";

/** Ancho al que se dibuja fuera de la pantalla; la imagen sale escalada a 600 dpi. */
const ANCHO_DIBUJO = 420;

/** Cuánto se espera a que aparezca la foto antes de exportar igual. */
const ESPERA_FOTO_MS = 3000;

/**
 * La foto la pone Avatar recién cuando terminó de cargar: hasta entonces
 * muestra las iniciales. Exportar antes dejaría el carnet sin foto.
 */
async function esperarFoto(nodo: HTMLElement, conFoto: boolean) {
  if (!conFoto) return;

  const limite = Date.now() + ESPERA_FOTO_MS;
  while (!nodo.querySelector("img") && Date.now() < limite) {
    await new Promise((listo) => setTimeout(listo, 50));
  }
}

/**
 * Descarga la zona blanca del dorso del carnet físico de un socio: su foto,
 * sus datos, su QR y la leyenda, sin la banda ni la textura.
 *
 * La imprenta ya tiene el diseño fijo del carnet; lo único que cambia de una
 * tarjeta a otra es esto, y cada socio tiene el suyo. Sale a tamaño real
 * —el ancho de una tarjeta estándar— para que el QR quede con la medida que
 * le da el diseño y se pueda leer.
 *
 * Va en una columna del padrón, así que la zona se dibuja solo al apretar el
 * botón: tenerla armada para cada fila sería cargar veinte fotos y veinte QR
 * que casi nunca se usan.
 */
export function BotonDescargarCarnetFisico({ socio }: { socio: CarnetSocio }) {
  const zona = useRef<HTMLDivElement>(null);
  const [generando, setGenerando] = useState(false);

  const { carnetUrl } = socio;
  const nombre = `${socio.nombre} ${socio.apellido}`;

  useEffect(() => {
    if (!generando) return;

    let cancelado = false;

    async function descargar() {
      const nodo = zona.current;
      if (!nodo) return;

      try {
        await esperarFoto(nodo, Boolean(socio.fotoUrl));

        // `cacheBust`: ver BotonDescargarCarnet, por la foto del socio.
        const imagen = await toPng(nodo, {
          pixelRatio: PX_ANCHO_CARNET_FISICO / ANCHO_DIBUJO,
          cacheBust: true,
          backgroundColor: "#FFFFFF",
        });
        const archivo = await pngConResolucion(imagen, DPI_IMPRENTA);
        if (cancelado) return;

        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = nombreDeArchivo(
          "carnet-fisico",
          socio.numeroSocio,
          socio.apellido,
          "png",
        );
        enlace.click();

        // Liberar la dirección en el mismo instante puede cortar la descarga.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch {
        toast.error("No pudimos generar el carnet físico", {
          description:
            "Probá de nuevo. Si vuelve a fallar, puede ser la foto del socio: avisanos.",
        });
      } finally {
        if (!cancelado) setGenerando(false);
      }
    }

    void descargar();
    return () => {
      cancelado = true;
    };
  }, [generando, socio.fotoUrl, socio.numeroSocio, socio.apellido]);

  // Sin código, el carnet saldría con un QR de muestra que no lleva a ningún lado.
  if (!carnetUrl) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled
        aria-label={`${nombre} todavía no tiene código de carnet`}
        title="Todavía no tiene código de carnet"
        onClick={(evento) => evento.stopPropagation()}
      >
        <Download aria-hidden />
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Descargar el carnet físico de ${nombre}`}
        title="Descargar carnet físico"
        disabled={generando}
        onClick={(evento) => {
          // Está dentro de una fila que abre la ficha al hacerle clic.
          evento.stopPropagation();
          setGenerando(true);
        }}
      >
        {generando ? <LoaderCircle className="animate-spin" aria-hidden /> : <Download aria-hidden />}
      </Button>

      {generando && (
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 left-[-10000px]"
          style={{ zIndex: -1 }}
        >
          <div className="@container" style={{ width: ANCHO_DIBUJO, fontFamily: FUENTE_DESCARGA }}>
            <div
              ref={zona}
              className="bg-white"
              style={{ aspectRatio: `${MM_ANCHO_CARNET_FISICO} / ${MM_ALTO_DATOS_CARNET}` }}
            >
              <DatosCarnet socio={socio} className="size-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
