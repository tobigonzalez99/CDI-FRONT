"use client";

import { Check, HeartHandshake, Info, Shirt, Star, Trophy } from "lucide-react";

import {
  CATEGORIAS_SOCIO,
  normalizarNombre,
  type CategoriaSocio,
  type IdCategoria,
} from "@/features/socios/data/categorias";
import { useTiposDisponibles } from "@/features/solicitudes/hooks/use-solicitudes";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { TipoSocio } from "@/types/socio";

const ICONOS: Record<IdCategoria, typeof Star> = {
  activo: Star,
  protector: HeartHandshake,
  juvenil: Shirt,
  campeon: Trophy,
};

function Precio({
  nombreEnSistema,
  tipos,
  cargando,
}: {
  nombreEnSistema: string;
  tipos: TipoSocio[] | undefined;
  cargando: boolean;
}) {
  if (cargando) {
    return <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" aria-hidden />;
  }

  const tipo = tipos?.find(
    (candidato) => normalizarNombre(candidato.nombre) === normalizarNombre(nombreEnSistema),
  );

  // Sin precio cargado no se muestra uno inventado: se manda a preguntar.
  if (tipo?.montoCuota == null) {
    return <p className="font-heading text-lg font-semibold">Consultá en la sede</p>;
  }

  return (
    <p className="flex items-baseline gap-1.5">
      <span className="font-heading text-4xl font-extrabold tracking-tight">
        {formatearMonto(tipo.montoCuota)}
      </span>
      <span className="text-sm text-muted-foreground">por mes</span>
    </p>
  );
}

function TarjetaCategoria({
  categoria,
  tipos,
  cargando,
}: {
  categoria: CategoriaSocio;
  tipos: TipoSocio[] | undefined;
  cargando: boolean;
}) {
  const Icono = ICONOS[categoria.id];
  const { cuota } = categoria;

  return (
    <article
      aria-labelledby={`categoria-${categoria.id}`}
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6",
        categoria.destacada
          ? "border-brand-red shadow-lg ring-1 ring-brand-red/20"
          : "border-border",
      )}
    >
      {categoria.destacada && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white">
          Todos los beneficios
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
          <Icono className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3
            id={`categoria-${categoria.id}`}
            className="font-heading text-lg leading-tight font-bold"
          >
            {categoria.nombre}
          </h3>
          <p className="text-sm text-muted-foreground">{categoria.paraQuien}</p>
        </div>
      </div>

      {/* Juvenil y Campeón no tienen cuota: no se les muestra precio. */}
      {cuota && (
        <div className="mt-6">
          <Precio nombreEnSistema={cuota.nombreEnSistema} tipos={tipos} cargando={cargando} />
        </div>
      )}

      <p className="mt-4 text-sm text-pretty text-muted-foreground">{categoria.descripcion}</p>

      {categoria.beneficios.length > 0 && (
        <ul className="mt-5 space-y-3 border-t border-border pt-5">
          {categoria.beneficios.map((beneficio) => (
            <li key={beneficio} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-brand-red" aria-hidden />
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      )}

      {categoria.aclaracion && (
        <p className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden />
          {categoria.aclaracion}
        </p>
      )}
    </article>
  );
}

/**
 * Las cuatro categorías de socio, con lo que incluye cada una. Son solo
 * información: la categoría se elige en el formulario de la solicitud.
 */
export function CategoriasSocio() {
  const tipos = useTiposDisponibles();

  return (
    <section aria-labelledby="categorias-titulo">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-wider text-brand-red uppercase">
          Categorías
        </p>
        <h2
          id="categorias-titulo"
          className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
        >
          Elegí cómo ser parte del Ventarrón
        </h2>
        <p className="mt-4 text-pretty text-muted-foreground">
          Hay una categoría para cada forma de acompañar al club. Fijate qué incluye cada
          una.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIAS_SOCIO.map((categoria) => (
          <TarjetaCategoria
            key={categoria.id}
            categoria={categoria}
            tipos={tipos.data}
            cargando={tipos.isPending}
          />
        ))}
      </div>
    </section>
  );
}
