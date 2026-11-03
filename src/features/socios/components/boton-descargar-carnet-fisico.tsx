"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { IdCard, LoaderCircle } from "lucide-react";
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

interface BotonDescargarCarnetFisicoProps {
  socio: CarnetSocio;
  size?: React.ComponentProps<typeof Button>["size"];
}

/**
 * Descarga la zona blanca del dorso del carnet físico de un socio: su foto,
 * sus datos, su QR y la leyenda, sin la banda ni la textura.
 *
 * La imprenta ya tiene el diseño fijo del carnet; lo único que cambia de una
 * tarjeta a otra es esto, y cada socio tiene el suyo. Sale a tamaño real
 * —el ancho de una tarjeta estándar— para que el QR quede con la medida que
 * le da el diseño y se pueda leer.
 */
export function BotonDescargarCarnetFisico({ socio, size }: BotonDescargarCarnetFisicoProps) {
  const zona = useRef<HTMLDivElement>(null);
  const [generando, setGenerando] = useState(false);

  const { carnetUrl } = socio;

  async function descargar() {
    const nodo = zona.current;
    if (!nodo) return;

    setGenerando(true);
    try {
      // `cacheBust`: ver BotonDescargarCarnet, por la foto del socio.
      const imagen = await toPng(nodo, {
        pixelRatio: PX_ANCHO_CARNET_FISICO / ANCHO_DIBUJO,
        cacheBust: true,
        backgroundColor: "#FFFFFF",
      });
      const archivo = await pngConResolucion(imagen, DPI_IMPRENTA);
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
      setGenerando(false);
    }
  }

  // Sin código, el carnet saldría con un QR de muestra que no lleva a ningún lado.
  if (!carnetUrl) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled
        title="Este socio todavía no tiene código de carnet."
      >
        <IdCard aria-hidden />
        Carnet físico
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => void descargar()}
        disabled={generando}
      >
        {generando ? <LoaderCircle className="animate-spin" aria-hidden /> : <IdCard aria-hidden />}
        {generando ? "Generando…" : "Carnet físico"}
      </Button>

      {/* Dibujada de verdad pero fuera de la pantalla, para poder volcarla a imagen. */}
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
    </>
  );
}

/** Para explicar en la interfaz qué sale del botón, sin repetir las medidas. */
export const AYUDA_CARNET_FISICO = `«Carnet físico» descarga solo la parte blanca del dorso de este socio (foto, datos, QR y leyenda), en PNG de ${MM_ANCHO_CARNET_FISICO.toLocaleString("es-AR")} × ${MM_ALTO_DATOS_CARNET.toLocaleString("es-AR")} mm a ${DPI_IMPRENTA} dpi, con el QR a su tamaño de impresión.`;
