"use client";

import { CircleCheck, CircleX, LoaderCircle, QrCode, TriangleAlert } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ClubLogo } from "@/components/shared/club-logo";
import { useCarnet } from "@/features/carnet/hooks/use-carnet";
import { esApiError, mensajeDeError } from "@/lib/api/errors";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { CarnetPublico, SituacionCarnet } from "@/types/carnet";

/**
 * Lo que tiene que leer de un vistazo quien cobra la entrada.
 *
 * El color nunca va solo: cada caso trae ícono y texto propios, porque esto
 * se mira a contraluz, apurado y en cualquier teléfono.
 */
const RESULTADOS: Record<
  SituacionCarnet,
  { titulo: string; detalle: string; clases: string; Icono: typeof CircleCheck }
> = {
  AL_DIA: {
    titulo: "AL DÍA",
    detalle: "Le corresponde el descuento en la entrada.",
    clases: "bg-emerald-600 text-white",
    Icono: CircleCheck,
  },
  CUOTA_VENCIDA: {
    titulo: "CUOTA VENCIDA",
    detalle: "Entrada al precio normal. Puede regularizar la cuota en la sede.",
    clases: "bg-red-600 text-white",
    Icono: CircleX,
  },
  DADO_DE_BAJA: {
    titulo: "DADO DE BAJA",
    detalle: "Ya no es socio. Entrada al precio normal.",
    clases: "bg-red-600 text-white",
    Icono: CircleX,
  },
};

function Encabezado() {
  return (
    <header className="flex items-center gap-3">
      <ClubLogo className="h-14 w-auto" priority />
      <div className="min-w-0">
        <p className="font-heading text-lg leading-tight font-bold">{siteConfig.name}</p>
        <p className="text-sm text-muted-foreground">Control de acceso</p>
      </div>
    </header>
  );
}

/** Marco común de la pantalla: siempre el mismo encabezado, cambia el cuerpo. */
function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-6">
      <Encabezado />
      {children}
    </main>
  );
}

function Resultado({ carnet }: { carnet: CarnetPublico }) {
  const { titulo, detalle, clases, Icono } = RESULTADOS[carnet.situacion];

  return (
    <>
      <section className="flex flex-col items-center gap-3 text-center">
        {/*
          La foto es el control real: el código del carnet es fijo, así que una
          captura de pantalla ajena sirve siempre. Lo único que distingue al
          titular es la cara, y por eso va grande y primero.

          `crossOrigin` no es decorativo: sin él el navegador no deja volcar la
          imagen en un canvas y la descarga del carnet falla.
        */}
        <Avatar className="size-44 rounded-2xl after:rounded-2xl">
          <AvatarImage
            src={carnet.fotoUrl ?? undefined}
            alt={`Foto de ${carnet.nombre} ${carnet.apellido}`}
            crossOrigin="anonymous"
            className="object-cover"
          />
          <AvatarFallback className="rounded-2xl text-4xl font-semibold">
            {carnet.nombre.at(0)}
            {carnet.apellido.at(0)}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-heading text-2xl font-bold">
            {carnet.apellido}, {carnet.nombre}
          </p>
          <p className="text-muted-foreground">
            Socio N° {carnet.numeroSocio} · {carnet.tipoSocio}
          </p>
        </div>
      </section>

      <section
        className={cn("flex flex-col items-center gap-2 rounded-2xl px-5 py-7", clases)}
        role="status"
        aria-live="polite"
      >
        <Icono className="size-12" aria-hidden />
        <p className="font-heading text-4xl font-bold tracking-tight">{titulo}</p>
        <p className="text-center text-sm text-balance opacity-95">{detalle}</p>
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Mirá que la foto sea de la persona que tenés adelante.
      </p>
    </>
  );
}

/** Lo que ve quien escanea un QR que no corresponde a ningún carnet. */
function CarnetInexistente() {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-5 py-12 text-center">
      <QrCode className="size-10 text-muted-foreground" aria-hidden />
      <p className="font-heading text-xl font-bold">Este carnet no existe</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        El código no corresponde a ningún socio del club. Revisá que hayas escaneado
        un carnet del {siteConfig.shortName} y no otro código.
      </p>
    </section>
  );
}

function NoPudimosConsultar({
  error,
  onReintentar,
}: {
  error: unknown;
  onReintentar: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-5 py-12 text-center">
      <TriangleAlert className="size-10 text-muted-foreground" aria-hidden />
      <p className="font-heading text-xl font-bold">No pudimos consultar el carnet</p>
      <p className="max-w-xs text-sm text-muted-foreground">{mensajeDeError(error)}</p>
      <Button type="button" variant="outline" onClick={onReintentar}>
        Reintentar
      </Button>
    </section>
  );
}

/**
 * Pantalla que abre el celular al escanear el QR de un carnet.
 *
 * No muestra la fecha de vencimiento: en la puerta lo único que se decide es
 * si corresponde el descuento, y la fecha es un dato de la ficha del socio.
 */
export function ControlAcceso({ codigo }: { codigo: string }) {
  const { data, isPending, isError, error, refetch } = useCarnet(codigo);

  if (isPending) {
    return (
      <Pantalla>
        <div className="flex flex-1 items-center justify-center" role="status">
          <LoaderCircle className="size-8 animate-spin text-muted-foreground" aria-hidden />
          <span className="sr-only">Consultando el carnet…</span>
        </div>
      </Pantalla>
    );
  }

  if (isError) {
    const inexistente = esApiError(error) && error.code === "NOT_FOUND";

    return (
      <Pantalla>
        {inexistente ? (
          <CarnetInexistente />
        ) : (
          <NoPudimosConsultar error={error} onReintentar={() => void refetch()} />
        )}
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Resultado carnet={data} />
    </Pantalla>
  );
}
