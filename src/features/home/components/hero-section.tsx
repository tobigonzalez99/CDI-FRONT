import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER: datos del próximo partido. Vendrán del backend / carga del admin.
 */
const PROXIMO_PARTIDO = {
  torneo: "Liga Tresarroyense de Fútbol",
  local: "Independencia",
  visitante: "A confirmar",
  fecha: "Domingo 15:30",
  sede: "Estadio del club · Adolfo Gonzáles Chaves",
};

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-black text-white">
      {/*
        PLACEHOLDER visual: hasta tener fotos oficiales, el fondo se arma con
        capas CSS (franjas rojo/negro + viñeta). Al sumar una imagen real,
        reemplazar este bloque por un <Image fill /> con el mismo overlay.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, var(--brand-red) 0 40px, transparent 40px 120px)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-24 -z-10 size-[32rem] rounded-full bg-brand-red/25 blur-3xl"
      />

      <div className="container mx-auto grid gap-12 px-4 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/80 uppercase">
            <MapPin className="size-3.5 text-brand-red-soft" aria-hidden />
            Adolfo Gonzáles Chaves
          </p>

          <h1 className="mt-6 font-heading text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Los colores que nos
            <span className="text-brand-red-soft"> unen</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-pretty text-white/70">
            Somos mucho más que fútbol: somos el club del barrio, las inferiores,
            la escuelita y las familias que cada fin de semana llenan la cancha.
            Sumate y viví el club desde adentro.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {/*
              Son enlaces con apariencia de botón, no <Button render={<Link/>}>:
              así el lector de pantalla los anuncia como enlaces, que es lo que
              realmente hacen (navegar), y no como botones.
            */}
            <Link
              href="/socio"
              className={cn(buttonVariants({ size: "lg" }), "h-12 px-7 text-base")}
            >
              Asociate
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="#proximo-partido"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Próximo partido
            </Link>
          </div>
        </div>

        {/* Tarjeta del próximo partido */}
        <aside
          id="proximo-partido"
          aria-labelledby="proximo-partido-titulo"
          className="scroll-mt-28 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8"
        >
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-brand-red-soft uppercase">
            <CalendarDays className="size-4" aria-hidden />
            Próximo partido
          </div>

          <h2 id="proximo-partido-titulo" className="sr-only">
            Próximo partido del club
          </h2>

          <p className="mt-4 text-sm text-white/50">{PROXIMO_PARTIDO.torneo}</p>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span className="font-heading text-lg font-bold text-balance sm:text-xl">
              {PROXIMO_PARTIDO.local}
            </span>
            <span className="rounded-md bg-brand-red px-2.5 py-1 text-xs font-bold tracking-wider uppercase">
              vs
            </span>
            <span className="text-right font-heading text-lg font-bold text-balance text-white/60 sm:text-xl">
              {PROXIMO_PARTIDO.visitante}
            </span>
          </div>

          <dl className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Fecha</dt>
              <dd className="text-right font-medium">{PROXIMO_PARTIDO.fecha}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Sede</dt>
              <dd className="text-right font-medium">{PROXIMO_PARTIDO.sede}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
