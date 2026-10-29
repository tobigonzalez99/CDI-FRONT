"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CarnetCelular } from "@/features/socios/components/carnet-celular";
import { nombreDeArchivo } from "@/features/socios/lib/carnet";
import type { CarnetSocio } from "@/types/socio";

interface BotonDescargarCarnetProps {
  socio: CarnetSocio;
  etiqueta?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}

/**
 * Descarga el carnet digital del socio como PNG, para mandarlo por WhatsApp.
 *
 * La tarjeta se dibuja de verdad —fuera de la pantalla— y se vuelca a una
 * imagen: así lo que se descarga es exactamente lo que se ve, sin mantener en
 * paralelo un dibujo hecho a mano sobre un canvas.
 */
export function BotonDescargarCarnet({
  socio,
  etiqueta = "Descargar carnet",
  variant = "outline",
  size,
  className,
}: BotonDescargarCarnetProps) {
  const tarjeta = useRef<HTMLDivElement>(null);
  const [generando, setGenerando] = useState(false);

  const { carnetUrl } = socio;

  async function descargar() {
    const nodo = tarjeta.current;
    if (!nodo) return;

    setGenerando(true);
    try {
      /*
        `cacheBust` evita un fallo difícil de diagnosticar: si el navegador ya
        tenía la foto del socio en caché de una carga anterior sin CORS, al
        volcarla acá "contamina" el canvas y la exportación falla.
      */
      const imagen = await toPng(nodo, { pixelRatio: 2, cacheBust: true });

      const enlace = document.createElement("a");
      enlace.href = imagen;
      enlace.download = nombreDeArchivo(socio.numeroSocio, socio.apellido);
      enlace.click();
    } catch {
      toast.error("No pudimos generar el carnet", {
        description:
          "Probá de nuevo. Si vuelve a fallar, puede ser la foto del socio: avisanos.",
      });
    } finally {
      setGenerando(false);
    }
  }

  if (!carnetUrl) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled
        title="Este socio todavía no tiene código de carnet."
      >
        <Download aria-hidden />
        {etiqueta}
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => void descargar()}
        disabled={generando}
      >
        {generando ? <LoaderCircle className="animate-spin" aria-hidden /> : <Download aria-hidden />}
        {generando ? "Generando…" : etiqueta}
      </Button>

      {/*
        La tarjeta tiene que estar dibujada y con medidas reales para poder
        fotografiarla, así que no puede ocultarse con `display: none`: se
        manda fuera de la pantalla.
      */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-[-10000px]"
        style={{ zIndex: -1 }}
      >
        <div ref={tarjeta}>
          <CarnetCelular socio={socio} carnetUrl={carnetUrl} />
        </div>
      </div>
    </>
  );
}
