import type { Metadata } from "next";
import Link from "next/link";
import { Home, Search } from "lucide-react";

import { Navbar } from "@/components/shared/navbar/navbar";
import { Footer } from "@/components/shared/footer";
import { buttonVariants } from "@/components/ui/button";
import { hasChildren, NAV_ENTRIES } from "@/components/shared/navbar/nav-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Página no encontrada" };

/** Sugerencias de navegación: las secciones principales del menú. */
const secciones = NAV_ENTRIES.map((entry) =>
  hasChildren(entry) ? { label: entry.label, href: entry.href } : entry,
);

/**
 * 404 global.
 *
 * Vive en app/ para atrapar cualquier URL inexistente, así que no hereda el
 * layout público: monta Navbar y Footer por su cuenta para que la página
 * siga siendo navegable y no deje al visitante en un callejón sin salida.
 */
export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className="relative isolate flex flex-1 items-center overflow-hidden bg-brand-black text-white">
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
          className="absolute -top-32 -right-24 -z-10 size-[30rem] rounded-full bg-brand-red/25 blur-3xl"
        />

        <div className="container mx-auto px-4 py-24 text-center">
          <p className="font-heading text-7xl font-extrabold tracking-tight text-brand-red-soft sm:text-8xl">
            404
          </p>

          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Esta pelota se fue afuera
          </h1>

          <p className="mx-auto mt-4 max-w-md text-pretty text-white/65">
            La página que buscás no existe o cambió de lugar. Probá desde el menú o volvé
            al inicio.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-12 px-7 text-base")}>
              <Home className="size-4" aria-hidden />
              Ir al inicio
            </Link>

            <Link
              href="/futbol"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white",
              )}
            >
              <Search className="size-4" aria-hidden />
              Ver las categorías
            </Link>
          </div>

          <nav aria-label="Secciones del sitio" className="mt-12">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {secciones.map((seccion) => (
                <li key={seccion.href}>
                  <Link
                    href={seccion.href}
                    className="text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
                  >
                    {seccion.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <Footer />
    </>
  );
}
