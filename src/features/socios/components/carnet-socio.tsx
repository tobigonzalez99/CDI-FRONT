"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, QrCode, RotateCcw } from "lucide-react";

import carnetBanner from "@/assets/carnet-banner.png";
import carnetFrente from "@/assets/carnet-frente.png";
import carnetTextura from "@/assets/carnet-textura.png";
import { Button } from "@/components/ui/button";
import { BotonDescargarCarnet } from "@/features/socios/components/boton-descargar-carnet";
import { CarnetCelular } from "@/features/socios/components/carnet-celular";
import { DatosCarnet } from "@/features/socios/components/datos-carnet";
import { EstadoCuotaBadge } from "@/features/socios/components/estado-cuota-badge";
import { QrGrandeDialog } from "@/features/socios/components/qr-grande-dialog";
import { pagaCuota, textoVigencia } from "@/features/socios/lib/cuota";
import { diasHasta } from "@/lib/formato";
import type { CarnetSocio } from "@/types/socio";

/** Proporción de las dos caras del diseño, para que no se deformen. */
const PROPORCION = "1993 / 1107";

/** Aviso cuando la cuota está por vencer, para que no lo tome por sorpresa. */
const DIAS_PARA_AVISAR = 7;

/**
 * Cara con los datos del socio: es la que se muestra en la entrada, así que
 * es la que aparece primero.
 *
 * Está reconstruida en HTML y no es una imagen, porque cada socio lleva su
 * foto, su nombre y su categoría. Las medidas van en `cqw` —porcentaje del
 * ancho de la propia tarjeta— para que todo escale junto, igual que lo haría
 * una imagen, en el escritorio. En el teléfono esta tarjeta no se muestra.
 */
function Dorso({ socio }: { socio: CarnetSocio }) {
  return (
    <div className="@container flex size-full flex-col overflow-hidden rounded-[2cqw] bg-white shadow-lg ring-1 ring-black/10 transition-shadow duration-300 group-hover:shadow-2xl">
      {/*
        Sin `priority`: en el teléfono la tarjeta está oculta y así el
        navegador se ahorra bajar la banda; en la computadora entra en
        pantalla al cargar y se baja igual.
      */}
      <Image
        src={carnetBanner}
        alt=""
        aria-hidden
        className="h-[32%] w-full object-cover"
      />

      <DatosCarnet
        socio={socio}
        className="h-[68%]"
        style={{
          backgroundImage: `url(${carnetTextura.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}

/** Cara institucional: no lleva datos de nadie, así que es el diseño tal cual. */
function Frente() {
  return (
    <Image
      src={carnetFrente}
      alt="Frente del carnet de socio del Club Deportivo Independencia"
      className="size-full rounded-[2cqw] object-cover shadow-lg ring-1 ring-black/10 transition-shadow duration-300 group-hover:shadow-2xl"
    />
  );
}

/** HU-04: carnet digital del socio. */
export function CarnetSocioCard({ socio }: { socio: CarnetSocio }) {
  const [verFrente, setVerFrente] = useState(false);
  const [verQr, setVerQr] = useState(false);

  const diasRestantes = diasHasta(socio.vigencia.hasta);
  // A quien no paga cuota no se le vence nada: no se le avisa.
  const porVencer =
    pagaCuota(socio.tipoSocio) &&
    socio.estadoCuota === "AL_DIA" &&
    diasRestantes >= 0 &&
    diasRestantes <= DIAS_PARA_AVISAR;

  return (
    // Más angosto que la página: a todo el ancho el carnet se veía más grande
    // que uno de verdad. Los botones de abajo acompañan ese mismo ancho.
    <div className="mx-auto w-full max-w-xl space-y-3">
      {/*
        En el teléfono va el carnet vertical y nada más. El horizontal
        reproduce el carnet físico, que es apaisado: metido en una pantalla
        angosta queda chico, con el QR ilegible y la foto del tamaño de una
        uña. Son dos formatos para dos lugares, no el mismo achicado.
      */}
      <div className="sm:hidden">
        <CarnetCelular
          socio={socio}
          carnetUrl={socio.carnetUrl}
          className="mx-auto max-w-[300px] shadow-lg ring-1 ring-black/10"
        />
      </div>

      {/*
        Al pasar el mouse la tarjeta se agranda apenas; para darla vuelta hay
        que hacerle clic. Girarla con solo pasar el mouse se vería bien un
        segundo y sería incómodo de usar: en un teléfono no existe el "pasar
        el mouse", y en la computadora la tarjeta volvería al lado anterior
        apenas corrés el mouse para leerla.
      */}
      <div
        className="group relative hidden cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 sm:block"
        style={{ perspective: "1600px" }}
      >
        {/*
          Las transformaciones van en estilos en línea y no en clases: una
          clase arbitraria con `rotateY()` no siempre llega a generarse, y si
          no se genera la tarjeta deja de girar sin ningún aviso.
        */}
        <div
          className="relative w-full transition-transform duration-500 motion-reduce:transition-none"
          style={{
            aspectRatio: PROPORCION,
            transformStyle: "preserve-3d",
            transform: verFrente ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
            aria-hidden={verFrente}
          >
            <Dorso socio={socio} />
          </div>

          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            aria-hidden={!verFrente}
          >
            <Frente />
          </div>
        </div>

        {/*
          La zona de clic va encima de la tarjeta y no envolviéndola: dentro de
          un <button>, un lector de pantalla leería toda la tarjeta como el
          nombre del botón y se perdería el contenido. Queda fuera del recorrido
          del teclado porque el botón «Ver el frente», acá abajo, hace lo mismo
          y sí está rotulado.
        */}
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 z-10"
          onClick={() => setVerFrente((actual) => !actual)}
        />
      </div>

      {/* Lo que el diseño del carnet no contempla y el socio igual necesita. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="font-medium">Socio N° {socio.numeroSocio}</span>

        <EstadoCuotaBadge estado={socio.estadoCuota} />

        <span className="text-muted-foreground">{textoVigencia(socio)}</span>

        {porVencer && (
          <span className="font-medium text-amber-600">
            {diasRestantes === 0
              ? "Vence hoy"
              : `Vence en ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/*
          En el carnet el QR entra chico, porque ese es el lugar que le da el
          diseño. Para que otra cámara lo lea desde la pantalla hace falta
          verlo en grande, y eso es lo que hace este botón.
        */}
        {socio.carnetUrl && (
          <Button type="button" size="sm" onClick={() => setVerQr(true)}>
            <QrCode aria-hidden />
            Mostrar el QR
          </Button>
        )}

        <BotonDescargarCarnet
          socio={socio}
          etiqueta="Descargar para el celular"
          size="sm"
        />

        {/* Sin tarjeta horizontal en el teléfono, no hay nada que dar vuelta. */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto max-sm:hidden"
          onClick={() => setVerFrente((actual) => !actual)}
        >
          <RotateCcw aria-hidden />
          {verFrente ? "Ver el dorso" : "Ver el frente"}
        </Button>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        {socio.carnetUrl
          ? "Mostrá el QR en la entrada: al escanearlo se ve tu foto y si tu cuota está al día."
          : "Tu carnet todavía no tiene código QR. Pedilo en la sede y te lo generan."}
      </p>

      {socio.carnetUrl && (
        <QrGrandeDialog
          socio={socio}
          carnetUrl={socio.carnetUrl}
          open={verQr}
          onOpenChange={setVerQr}
        />
      )}
    </div>
  );
}
