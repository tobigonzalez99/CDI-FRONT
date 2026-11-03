import QRCode from "react-qr-code";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QrPlaceholder } from "@/features/socios/components/qr-placeholder";
import {
  AZUL_QR,
  inicialesDe,
  LEYENDA_CARNET,
  ROJO_CARNET,
} from "@/features/socios/lib/carnet";
import { cn } from "@/lib/utils";
import type { CarnetSocio } from "@/types/socio";

/**
 * El nombre y el apellido van en cuerpo grande, pero un apellido largo no
 * puede romper la tarjeta ni cortarse: se achica la tipografía en su lugar.
 */
function tamañoDelNombre(texto: string): string {
  if (texto.length <= 10) return "text-[4.8cqw]";
  if (texto.length <= 16) return "text-[3.8cqw]";
  return "text-[3cqw]";
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[2cqw] leading-none font-bold tracking-wide uppercase"
      style={{ color: ROJO_CARNET }}
    >
      {children}
    </p>
  );
}

interface DatosCarnetProps {
  socio: CarnetSocio;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * La zona blanca del dorso: foto, nombre, apellido, categoría, QR y leyenda.
 *
 * El archivo para la imprenta no sale de acá: lo dibuja
 * `generarDorsoParaImprenta` con las medidas exactas del dorso original.
 *
 * Las medidas van en `cqw` del **ancho de la tarjeta entera**: quien la use
 * tiene que ponerla dentro de un `@container` de ese ancho.
 */
export function DatosCarnet({ socio, className, style }: DatosCarnetProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between pt-[1.6cqw] pr-[6cqw] pb-[1.9cqw] pl-[7.5cqw]",
        className,
      )}
      style={style}
    >
      <div className="flex items-start gap-[2.5cqw]">
        {/* El borde circular que trae Avatar por defecto no va: la foto del carnet es rectangular. */}
        <Avatar className="aspect-[49/46] h-auto w-[24.5cqw] shrink-0 rounded-[1.6cqw] after:rounded-[1.6cqw]">
          <AvatarImage
            src={socio.fotoUrl ?? undefined}
            alt={`Foto de ${socio.nombre} ${socio.apellido}`}
            className="object-cover"
          />
          <AvatarFallback className="rounded-[1.6cqw] text-[6cqw] font-semibold">
            {inicialesDe(socio.nombre, socio.apellido)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Etiqueta>Nombre</Etiqueta>
          <p
            className={cn(
              "mt-[0.4cqw] leading-[1.1] font-bold break-words text-black",
              tamañoDelNombre(socio.nombre),
            )}
          >
            {socio.nombre}
          </p>

          <div className="mt-[1.2cqw]">
            <Etiqueta>Apellido</Etiqueta>
            <p
              className={cn(
                "mt-[0.4cqw] leading-[1.1] font-bold break-words text-black",
                tamañoDelNombre(socio.apellido),
              )}
            >
              {socio.apellido}
            </p>
          </div>

          <p
            className="mt-[1.3cqw] text-[2.8cqw] leading-none font-bold uppercase"
            style={{ color: ROJO_CARNET }}
          >
            {socio.tipoSocio.nombre}
          </p>
        </div>

        <div className="w-[18.6cqw] shrink-0 self-center">
          {socio.carnetUrl ? (
            /*
              Lo que lleva el QR es un enlace, no el estado del socio: si
              guardara "está al día" quedaría congelado el día que se generó.
              El enlace lo arma el backend y acá solo se dibuja.
            */
            <QRCode
              value={socio.carnetUrl}
              level="M"
              fgColor={AZUL_QR}
              viewBox="0 0 256 256"
              style={{ width: "100%", height: "auto" }}
              title="Código QR del carnet"
            />
          ) : (
            <QrPlaceholder semilla={`CDI-${socio.numeroSocio}`} className="h-auto w-full" />
          )}
        </div>
      </div>

      <p className="text-center text-[1.8cqw] leading-[1.3] font-bold text-black">
        {LEYENDA_CARNET}
      </p>
    </div>
  );
}
