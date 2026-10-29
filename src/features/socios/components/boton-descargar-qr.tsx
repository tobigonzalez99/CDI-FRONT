"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  MM_QR_IMPRENTA,
  nombreDeArchivo,
  svgDeQrParaImprenta,
} from "@/features/socios/lib/carnet";
import type { CarnetSocio } from "@/types/socio";

interface BotonDescargarQrProps {
  socio: CarnetSocio;
  size?: React.ComponentProps<typeof Button>["size"];
}

/**
 * Descarga solo el código QR, para mandárselo a quien imprime los carnets
 * físicos.
 *
 * Es el mismo código que el del carnet digital: el socio termina con un solo
 * QR, en el teléfono y en la tarjeta de plástico, y los dos abren la misma
 * página.
 */
export function BotonDescargarQr({ socio, size }: BotonDescargarQrProps) {
  const contenedor = useRef<HTMLDivElement>(null);

  const { carnetUrl } = socio;

  function descargar() {
    const dibujado = contenedor.current?.querySelector("svg");
    if (!dibujado) return;

    try {
      const archivo = svgDeQrParaImprenta(dibujado);
      const url = URL.createObjectURL(
        new Blob([archivo], { type: "image/svg+xml;charset=utf-8" }),
      );

      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreDeArchivo("qr", socio.numeroSocio, socio.apellido, "svg");
      enlace.click();

      // Liberar la dirección en el mismo instante puede cortar la descarga.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("No pudimos preparar el código QR", {
        description: "Probá de nuevo. Si vuelve a fallar, avisanos.",
      });
    }
  }

  if (!carnetUrl) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        disabled
        title="Este socio todavía no tiene código de carnet."
      >
        <Printer aria-hidden />
        QR para imprenta
      </Button>
    );
  }

  return (
    <>
      <Button type="button" variant="outline" size={size} onClick={descargar}>
        <Printer aria-hidden />
        QR para imprenta
      </Button>

      {/*
        El QR se dibuja fuera de la pantalla y de ahí se arma el archivo: así
        el que se imprime es exactamente el mismo que el del carnet digital, y
        no hay dos formas distintas de generarlo que puedan separarse.

        Va en negro sobre blanco, que es el máximo contraste y lo que mejor
        lee cualquier lector sobre tinta.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-[-10000px]"
        style={{ zIndex: -1 }}
      >
        <div ref={contenedor} style={{ width: 256 }}>
          <QRCode value={carnetUrl} level="M" size={256} />
        </div>
      </div>
    </>
  );
}

/** Para explicar en la interfaz qué sale del botón, sin repetir el número. */
export const AYUDA_QR_IMPRENTA = `Sale en SVG de ${MM_QR_IMPRENTA} mm de lado, con el margen blanco que necesita para que se pueda escanear. Al ser vectorial, la imprenta lo puede agrandar sin que se pixele.`;
