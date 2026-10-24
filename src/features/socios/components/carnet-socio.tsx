import { CalendarDays, IdCard } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EstadoCuotaBadge } from "@/features/socios/components/estado-cuota-badge";
import { diasHasta, formatearVigencia } from "@/lib/formato";
import type { CarnetSocio } from "@/types/socio";

/** Aviso cuando la cuota está por vencer, para que no lo tome por sorpresa. */
const DIAS_PARA_AVISAR = 7;

function iniciales(nombre: string, apellido: string): string {
  return `${nombre.at(0) ?? ""}${apellido.at(0) ?? ""}`.toUpperCase();
}

/** HU-04: carnet digital del socio. */
export function CarnetSocioCard({ socio }: { socio: CarnetSocio }) {
  const diasRestantes = diasHasta(socio.vigencia.hasta);
  const porVencer =
    socio.estadoCuota === "AL_DIA" &&
    diasRestantes >= 0 &&
    diasRestantes <= DIAS_PARA_AVISAR;

  return (
    <Card className="overflow-hidden border-0 bg-brand-black text-white shadow-lg">
      <div className="flex items-center justify-between bg-brand-red px-5 py-2.5">
        <span className="font-heading text-sm font-bold tracking-wide">
          CARNET DE SOCIO
        </span>
        <span className="font-mono text-sm font-semibold">
          N° {socio.numeroSocio}
        </span>
      </div>

      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <Avatar className="size-24 shrink-0 rounded-lg ring-2 ring-white/20">
          <AvatarImage
            src={socio.fotoUrl ?? undefined}
            alt={`Foto de ${socio.nombre} ${socio.apellido}`}
            className="object-cover"
          />
          <AvatarFallback className="rounded-lg bg-white/10 text-xl font-semibold text-white">
            {iniciales(socio.nombre, socio.apellido)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="font-heading truncate text-xl font-bold">
              {socio.nombre} {socio.apellido}
            </h2>
            <p className="text-sm text-white/70">{socio.tipoSocio.nombre}</p>
          </div>

          <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <IdCard className="size-4 shrink-0 text-white/50" aria-hidden />
              <dt className="sr-only">DNI</dt>
              <dd className="font-mono">{socio.dni}</dd>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-white/50" aria-hidden />
              <dt className="sr-only">Vigencia</dt>
              <dd>{formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <EstadoCuotaBadge estado={socio.estadoCuota} />
            {porVencer && (
              <span className="text-xs text-amber-300">
                {diasRestantes === 0
                  ? "Vence hoy"
                  : `Vence en ${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
