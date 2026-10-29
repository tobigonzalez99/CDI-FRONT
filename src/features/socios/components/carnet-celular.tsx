import QRCode from "react-qr-code";

import carnetBanner from "@/assets/carnet-banner.png";
import carnetTextura from "@/assets/carnet-textura.png";
import {
  inicialesDe,
  LEYENDA_CARNET,
  ROJO_CARNET,
} from "@/features/socios/lib/carnet";
import { cn } from "@/lib/utils";
import type { CarnetSocio } from "@/types/socio";

/** Ancho de diseño, en píxeles. La imagen se exporta al doble de esto. */
export const ANCHO_CARNET = 420;

/**
 * Un apellido largo no puede desbordar la tarjeta ni cortarse: se achica la
 * tipografía en su lugar.
 */
function tamañoDelNombre(texto: string): string {
  if (texto.length <= 20) return "text-[26px]";
  if (texto.length <= 30) return "text-[21px]";
  return "text-[17px]";
}

interface CarnetCelularProps {
  socio: CarnetSocio;
  /** Enlace que lleva adentro el QR, tal como lo arma el backend. */
  carnetUrl: string;
  className?: string;
}

/**
 * Carnet digital vertical, pensado para el teléfono y para mandarse por
 * WhatsApp. Es el que se exporta como imagen.
 *
 * Los colores van fijos (`bg-white`, `text-black`) y no con los tokens del
 * tema: el carnet se genera desde el panel, que puede estar en modo oscuro, y
 * la imagen tiene que salir siempre igual.
 */
export function CarnetCelular({ socio, carnetUrl, className }: CarnetCelularProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-2xl bg-white", className)}
      style={{ width: ANCHO_CARNET }}
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
        className="h-[108px] w-full object-cover object-left"
      />

      <div
        className="flex flex-col items-center gap-5 px-7 pt-8 pb-6"
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
            className="size-48 rounded-full object-cover shadow-md ring-4 ring-white"
          />
        ) : (
          <div
            className="flex size-48 items-center justify-center rounded-full bg-neutral-200 text-5xl font-bold text-neutral-500 ring-4 ring-white"
            aria-hidden
          >
            {inicialesDe(socio.nombre, socio.apellido)}
          </div>
        )}

        <div className="w-full text-center">
          <p
            className="text-xl leading-tight font-bold uppercase"
            style={{ color: ROJO_CARNET }}
          >
            {socio.tipoSocio.nombre}
          </p>
          <p
            className={cn(
              "mt-1 leading-tight font-bold break-words text-black",
              tamañoDelNombre(`${socio.apellido}, ${socio.nombre}`),
            )}
          >
            {socio.apellido.toUpperCase()}, {socio.nombre.toUpperCase()}
          </p>
          <p className="mt-1.5 text-[15px] text-neutral-600">
            Socio N° {socio.numeroSocio}
          </p>
        </div>

        {/* El recuadro blanco es el margen que un lector de QR necesita para enfocar. */}
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <QRCode value={carnetUrl} size={150} level="M" />
        </div>

        <p className="text-center text-[9px] leading-snug font-medium text-neutral-700">
          {LEYENDA_CARNET}
        </p>
      </div>
    </div>
  );
}
