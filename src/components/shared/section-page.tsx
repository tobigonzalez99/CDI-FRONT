import Link from "next/link";
import { ChevronRight, Construction, Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { construirMigas, type Miga } from "@/components/shared/navbar/nav-config";
import { cn } from "@/lib/utils";

interface SectionPageProps {
  /** Ruta de esta sección; de acá salen las migas del menú fijo. */
  href: string;
  /**
   * Migas explícitas, para secciones que no están en el menú fijo: las
   * disciplinas vienen de la API y sus nombres no se conocen al compilar.
   */
  migas?: Miga[];
  title: string;
  /** Bajada opcional bajo el título. */
  description?: string;
  /** Contenido real de la sección. Sin él se muestra el estado vacío. */
  children?: React.ReactNode;
}

/**
 * Esqueleto común de las páginas de sección: franja superior con la identidad
 * del club, migas de pan para volver y cuerpo.
 *
 * Mientras no haya contenido cargado muestra un estado vacío en lugar de una
 * página en blanco, para que se note que la sección existe y está en curso.
 */
export function SectionPage({
  href,
  migas: migasExplicitas,
  title,
  description,
  children,
}: SectionPageProps) {
  const migas = migasExplicitas ?? construirMigas(href);

  return (
    <>
      {/* Encabezado */}
      <section className="relative isolate overflow-hidden bg-brand-black text-white">
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
          className="absolute -top-28 -right-20 -z-10 size-96 rounded-full bg-brand-red/25 blur-3xl"
        />

        <div className="container mx-auto px-4 py-14 sm:py-16">
          <nav aria-label="Ruta de navegación">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-white/55">
              {migas.map((miga, indice) => {
                const esUltima = indice === migas.length - 1;

                return (
                  <li key={miga.href} className="flex items-center gap-1.5">
                    {indice > 0 && (
                      <ChevronRight className="size-3.5 text-white/30" aria-hidden />
                    )}
                    {esUltima ? (
                      <span aria-current="page" className="text-white">
                        {miga.label}
                      </span>
                    ) : (
                      <Link
                        href={miga.href}
                        className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
                      >
                        {miga.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mt-4 max-w-2xl text-pretty text-white/65">{description}</p>
          )}
        </div>
      </section>

      {/* Cuerpo */}
      <section className="container mx-auto px-4 py-16">
        {children ?? <EstadoVacio />}
      </section>
    </>
  );
}

/**
 * Lo que se ve mientras la sección no tiene contenido cargado. Exportado
 * porque una sección puede tener algo propio —la foto de una disciplina— y
 * aun así seguir esperando su texto.
 */
export function EstadoVacio() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <Construction className="size-8 text-brand-red" aria-hidden />

      <h2 className="mt-4 font-heading text-lg font-bold">
        Estamos preparando esta sección
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Pronto vas a encontrar acá el contenido del club. Mientras tanto podés seguir
        recorriendo el resto del sitio.
      </p>

      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-7 h-11 px-6")}>
        <Home className="size-4" aria-hidden />
        Volver al inicio
      </Link>
    </div>
  );
}
