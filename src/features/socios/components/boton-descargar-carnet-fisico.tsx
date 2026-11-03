"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { nombreDeArchivo } from "@/features/socios/lib/carnet";
import {
  generarDorsoParaImprenta,
  MM_CARNET_IMPRENTA,
} from "@/features/socios/lib/carnet-imprenta";
import type { CarnetSocio } from "@/types/socio";

/**
 * Descarga lo que va en la zona blanca del dorso del carnet físico de un
 * socio, del tamaño del carnet y con el resto transparente, para la imprenta.
 */
export function BotonDescargarCarnetFisico({ socio }: { socio: CarnetSocio }) {
  const [generando, setGenerando] = useState(false);

  const { carnetUrl } = socio;
  const nombre = `${socio.nombre} ${socio.apellido}`;

  async function descargar(carnetUrl: string) {
    setGenerando(true);
    try {
      const archivo = await generarDorsoParaImprenta({ ...socio, carnetUrl });
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

      if (!socio.fotoUrl) {
        toast.warning(`${nombre} no tiene foto`, {
          description: "El carnet se descargó con el lugar de la foto vacío.",
        });
      }
    } catch {
      toast.error("No pudimos generar el carnet físico", {
        description:
          "Probá de nuevo. Si vuelve a fallar, puede ser la foto del socio: avisanos.",
      });
    } finally {
      setGenerando(false);
    }
  }

  // Sin código, el carnet saldría sin un QR que lleve a algún lado.
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
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Descargar el carnet físico de ${nombre}`}
      title={`Descargar carnet físico (${MM_CARNET_IMPRENTA.ancho} × ${MM_CARNET_IMPRENTA.alto} mm, para la imprenta)`}
      disabled={generando}
      onClick={(evento) => {
        // Está dentro de una fila que abre la ficha al hacerle clic.
        evento.stopPropagation();
        void descargar(carnetUrl);
      }}
    >
      {generando ? <LoaderCircle className="animate-spin" aria-hidden /> : <Download aria-hidden />}
    </Button>
  );
}
