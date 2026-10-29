"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, RotateCcw } from "lucide-react";

import carnetBanner from "@/assets/carnet-banner.png";
import carnetFrente from "@/assets/carnet-frente.png";
import carnetTextura from "@/assets/carnet-textura.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EstadoCuotaBadge } from "@/features/socios/components/estado-cuota-badge";
import { QrPlaceholder } from "@/features/socios/components/qr-placeholder";
import { diasHasta, formatearVigencia } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { CarnetSocio } from "@/types/socio";

/** Rojo de las etiquetas, tomado del diseño original del club. */
const ROJO_CARNET = "#ed3137";

/** Proporción de las dos caras del diseño, para que no se deformen. */
const PROPORCION = "1993 / 1107";

/** Aviso cuando la cuota está por vencer, para que no lo tome por sorpresa. */
const DIAS_PARA_AVISAR = 7;

const LEYENDA =
  "Este carnet es de uso personal e intransferible. Su uso indebido será penado y " +
  "habilita su retención. En caso de extravío se deberá abonar su reposición. En caso " +
  "de hallar este carnet devolverlo al Club Deportivo Independencia en España N°1, " +
  "7513, Adolfo G. Chaves";

function iniciales(nombre: string, apellido: string): string {
  return `${nombre.at(0) ?? ""}${apellido.at(0) ?? ""}`.toUpperCase();
}

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

/**
 * Cara con los datos del socio: es la que se muestra en la entrada, así que
 * es la que aparece primero.
 *
 * Está reconstruida en HTML y no es una imagen, porque cada socio lleva su
 * foto, su nombre y su categoría. Las medidas van en `cqw` —porcentaje del
 * ancho de la propia tarjeta— para que todo escale junto, igual que lo haría
 * una imagen, en el teléfono y en el escritorio.
 */
function Dorso({ socio }: { socio: CarnetSocio }) {
  return (
    <div className="@container flex size-full flex-col overflow-hidden rounded-[2cqw] bg-white shadow-lg ring-1 ring-black/10">
      <Image
        src={carnetBanner}
        alt=""
        aria-hidden
        className="h-[32%] w-full object-cover"
        priority
      />

      <div
        className="flex h-[68%] flex-col justify-between pt-[1.6cqw] pr-[6cqw] pb-[1.9cqw] pl-[7.5cqw]"
        style={{
          backgroundImage: `url(${carnetTextura.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
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
              {iniciales(socio.nombre, socio.apellido)}
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

          <QrPlaceholder
            semilla={`CDI-${socio.numeroSocio}`}
            className="w-[18.6cqw] shrink-0 self-center"
          />
        </div>

        <p className="text-center text-[1.8cqw] leading-[1.3] font-bold text-black">
          {LEYENDA}
        </p>
      </div>
    </div>
  );
}

/** Cara institucional: no lleva datos de nadie, así que es el diseño tal cual. */
function Frente() {
  return (
    <Image
      src={carnetFrente}
      alt="Frente del carnet de socio del Club Deportivo Independencia"
      className="size-full rounded-[2cqw] object-cover shadow-lg ring-1 ring-black/10"
    />
  );
}

/** HU-04: carnet digital del socio. */
export function CarnetSocioCard({ socio }: { socio: CarnetSocio }) {
  const [verFrente, setVerFrente] = useState(false);

  const diasRestantes = diasHasta(socio.vigencia.hasta);
  const porVencer =
    socio.estadoCuota === "AL_DIA" &&
    diasRestantes >= 0 &&
    diasRestantes <= DIAS_PARA_AVISAR;

  return (
    <div className="space-y-3">
      <div style={{ perspective: "1600px" }}>
        {/*
          Las transformaciones van en estilos en línea y no en clases: una
          clase arbitraria con `rotateY()` no siempre llega a generarse, y si
          no se genera la tarjeta deja de girar sin ningún aviso.
        */}
        <div
          className="relative w-full transition-transform duration-500"
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
      </div>

      {/* Lo que el diseño del carnet no contempla y el socio igual necesita. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="font-medium">Socio N° {socio.numeroSocio}</span>

        <EstadoCuotaBadge estado={socio.estadoCuota} />

        <span className="text-muted-foreground">
          {formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)}
        </span>

        {porVencer && (
          <span className="font-medium text-amber-600">
            {diasRestantes === 0
              ? "Vence hoy"
              : `Vence en ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`}
          </span>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => setVerFrente((actual) => !actual)}
        >
          <RotateCcw aria-hidden />
          {verFrente ? "Ver el dorso" : "Ver el frente"}
        </Button>
      </div>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        El código QR todavía no está activo: lo estamos preparando para que al
        escanearlo se vea si tu cuota está al día.
      </p>
    </div>
  );
}
