"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Search, ShoppingBag, UserRound } from "lucide-react";

import { ClubLogo } from "@/components/shared/club-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMaqueta } from "@/features/tienda/maqueta/maqueta-context";
import { CATEGORIAS } from "@/features/tienda/maqueta/datos";
import { cn } from "@/lib/utils";

/** "Todos" adelante: ver el catálogo completo no depende de abrir los filtros. */
const SECCIONES = [
  { href: "/tienda/productos", nombre: "Todos" },
  ...CATEGORIAS.map((categoria) => ({
    href: `/tienda/productos?categoria=${categoria.slug}`,
    nombre: categoria.nombre,
  })),
];

/**
 * Encabezado propio de la tienda.
 *
 * La tienda se abre en otra pestaña y se presenta como un sitio aparte: no
 * lleva el menú del club ni un "volver a la web". Sí comparte la sesión, así
 * que el socio que ya entró en la web aparece acá con su nombre.
 */
export function TiendaHeader() {
  const pathname = usePathname();
  const { visitante, setVisitante, cantidadTotal, setCarritoAbierto } = useMaqueta();

  return (
    <header className="sticky top-0 z-40 bg-brand-black text-white">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link
          href="/tienda"
          aria-label="Tienda oficial del Club Deportivo Independencia, ir al inicio"
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
        >
          <ClubLogo className="h-10" priority />
          <span className="font-heading leading-none">
            <span className="block text-[11px] font-medium tracking-[0.2em] text-white/60 uppercase">
              Tienda oficial
            </span>
            <span className="block text-base font-bold tracking-tight">CDI</span>
          </span>
        </Link>

        <nav aria-label="Categorías" className="mx-auto hidden items-center gap-1 md:flex">
          {SECCIONES.map((seccion) => (
            <Link
              key={seccion.href}
              href={seccion.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {seccion.nombre}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link
            href="/tienda/productos"
            aria-label="Buscar productos"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-lg" }),
              "text-white hover:bg-white/10 hover:text-white",
            )}
          >
            <Search className="size-5" aria-hidden />
          </Link>

          {visitante === "socio" ? (
            <button
              type="button"
              onClick={() => setVisitante("invitado")}
              title="En la maqueta: volver a ver la tienda como invitado"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/10"
            >
              <UserRound className="size-5" aria-hidden />
              <span className="hidden leading-tight sm:block">
                <span className="block font-medium">María</span>
                <span className="block text-[11px] text-white/60">Socio Activo</span>
              </span>
            </button>
          ) : (
            <Button
              variant="ghost"
              className="h-9 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setVisitante("socio")}
              title="En la maqueta: ver la tienda como socio"
            >
              <LogIn className="size-4" aria-hidden />
              <span className="hidden sm:inline">Ingresar</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-lg"
            className={cn(
              "relative text-white hover:bg-white/10 hover:text-white",
              pathname.startsWith("/tienda/checkout") && "pointer-events-none opacity-40",
            )}
            aria-label={`Abrir el carrito, ${cantidadTotal} productos`}
            onClick={() => setCarritoAbierto(true)}
          >
            <ShoppingBag className="size-5" aria-hidden />
            {cantidadTotal > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-brand-red text-[11px] font-bold">
                {cantidadTotal}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* En el teléfono las categorías van en una tira que se desliza. */}
      <nav
        aria-label="Categorías"
        className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-2 [scrollbar-width:none] md:hidden"
      >
        {SECCIONES.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/85"
          >
            {seccion.nombre}
          </Link>
        ))}
      </nav>
    </header>
  );
}
