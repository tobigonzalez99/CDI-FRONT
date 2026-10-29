import QRCode from "react-qr-code";

import carnetBanner from "@/assets/carnet-banner.png";
import carnetTextura from "@/assets/carnet-textura.png";
import {
  inicialesDe,
  LEYENDA_CARNET,
  ROJO_CARNET,
} from "@/features/socios/lib/carnet";
import { QrPlaceholder } from "@/features/socios/components/qr-placeholder";
import { cn } from "@/lib/utils";
import type { CarnetSocio } from "@/types/socio";

/**
 * Ancho de diseño, en píxeles: el que se usa al exportar la imagen, que sale
 * al doble de esto. En pantalla la tarjeta se adapta al ancho que le den.
 */
export const ANCHO_CARNET = 420;

/**
 * Un apellido largo no puede desbordar la tarjeta ni cortarse: se achica la
 * tipografía en su lugar.
 */
function tamañoDelNombre(texto: string): string {
  if (texto.length <= 20) return "text-[6.2cqw]";
  if (texto.length <= 30) return "text-[5cqw]";
  return "text-[4cqw]";
}

interface CarnetCelularProps {
  socio: CarnetSocio;
  /**
   * Enlace que lleva adentro el QR, tal como lo arma el backend. Es `null`
   * mientras el administrador no haya generado el código de este socio.
   */
  carnetUrl: string | null;
  className?: string;
}

/**
 * Carnet digital vertical: el que ve el socio en el teléfono y el que se
 * exporta como imagen para mandar por WhatsApp.
 *
 * Las medidas van en `cqw` —porcentaje del ancho de la propia tarjeta— para
 * que todo escale junto: la misma tarjeta sirve a 340px en un teléfono y a
 * 420px al exportarla, sin dos juegos de medidas que mantener.
 *
 * Los colores van fijos (`bg-white`, `text-black`) y no con los tokens del
 * tema: el carnet se genera desde el panel, que puede estar en modo oscuro, y
 * la imagen tiene que salir siempre igual.
 */
export function CarnetCelular({ socio, carnetUrl, className }: CarnetCelularProps) {
  return (
    <div
      className={cn(
        "@container w-full overflow-hidden rounded-[3.8cqw] bg-white",
        className,
      )}
    >
      {/*
        La banda es el mismo arte del carnet físico. Se recorta por la derecha
        —donde solo hay trazos— para que el escudo y el nombre del club entren
        en el ancho del teléfono sin achicarse.

        Va como <img> y no como next/image: esta tarjeta se vuelca a un canvas
        para descargarla, y el optimizador agrega una vuelta que no hace falta.
      */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={carnetBanner.src}
        alt=""
        aria-hidden
        className="h-[25.7cqw] w-full object-cover object-left"
      />

      <div
        className="flex flex-col items-center gap-[4.8cqw] px-[6.7cqw] pt-[7.6cqw] pb-[5.7cqw]"
        style={{
          backgroundImage: `url(${carnetTextura.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/*
          `crossOrigin` no es decorativo: sin él el navegador considera
          "contaminado" el canvas y la descarga falla con un error de seguridad.
        */}
        {socio.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={socio.fotoUrl}
            alt={`Foto de ${socio.nombre} ${socio.apellido}`}
            crossOrigin="anonymous"
            className="aspect-square w-[45.7cqw] rounded-full object-cover shadow-md ring-[1cqw] ring-white"
          />
        ) : (
          <div
            className="flex aspect-square w-[45.7cqw] items-center justify-center rounded-full bg-neutral-200 text-[11.4cqw] font-bold text-neutral-500 ring-[1cqw] ring-white"
            aria-hidden
          >
            {inicialesDe(socio.nombre, socio.apellido)}
          </div>
        )}

        <div className="w-full text-center">
          <p
            className="text-[4.8cqw] leading-tight font-bold uppercase"
            style={{ color: ROJO_CARNET }}
          >
            {socio.tipoSocio.nombre}
          </p>
          <p
            className={cn(
              "mt-[0.95cqw] leading-tight font-bold break-words text-black",
              tamañoDelNombre(`${socio.apellido}, ${socio.nombre}`),
            )}
          >
            {socio.apellido.toUpperCase()}, {socio.nombre.toUpperCase()}
          </p>
          <p className="mt-[1.4cqw] text-[3.6cqw] text-neutral-600">
            Socio N° {socio.numeroSocio}
          </p>
        </div>

        {/* El recuadro blanco es el margen que un lector de QR necesita para enfocar. */}
        <div className="rounded-[2.9cqw] bg-white p-[2.9cqw] shadow-sm">
          {carnetUrl ? (
            <QRCode
              value={carnetUrl}
              level="M"
              style={{ width: "35.7cqw", height: "auto" }}
              title="Código QR del carnet"
            />
          ) : (
            <QrPlaceholder
              semilla={`CDI-${socio.numeroSocio}`}
              className="h-auto w-[35.7cqw]"
            />
          )}
        </div>

        <p className="text-center text-[2.14cqw] leading-snug font-medium text-neutral-700">
          {LEYENDA_CARNET}
        </p>
      </div>
    </div>
  );
}
