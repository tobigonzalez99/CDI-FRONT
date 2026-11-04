"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Search, ShoppingBag } from "lucide-react";

import { ClubLogo } from "@/components/shared/club-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { UserMenu } from "@/features/auth/components/user-menu";
import { useSession } from "@/features/auth/hooks/use-session";
import { useCarrito } from "@/features/tienda/carrito/carrito-context";
import { useCategoriasTienda } from "@/features/tienda/hooks/use-tienda";
import { cn } from "@/lib/utils";

/**
 * Encabezado propio de la tienda.
 *
 * La tienda se abre en otra pestaña y se presenta como un sitio aparte: no
 * lleva el menú del club ni un "volver a la web". Sí comparte la sesión, así
 * que el socio que ya entró en la web aparece acá con su nombre.
 */
export function TiendaHeader() {
  const pathname = usePathname();
  const [loginAbierto, setLoginAbierto] = useState(false);
  const { user, isPending } = useSession();
  const { cantidadTotal, setAbierto } = useCarrito();
  const { data: categorias = [] } = useCategoriasTienda();

  /** "Todos los productos" adelante: ver el catálogo completo no depende de abrir los filtros. */
  const secciones = [
    { href: "/tienda/productos", nombre: "Todos los productos" },
    ...categorias.map((categoria) => ({
      href: `/tienda/productos?categoria=${categoria.slug}`,
      nombre: categoria.nombre,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-black text-white">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link
          href="/tienda"
          aria-label="Tienda oficial del Club Deportivo Independencia, ir al inicio"
          className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
        >
          <ClubLogo className="h-10" priority />
          {/* En pantallas muy angostas queda solo el escudo, para que entren los botones. */}
          <span className="font-heading leading-none max-[359px]:hidden">
            <span className="block text-[11px] font-medium tracking-[0.2em] text-white/60 uppercase">
              Tienda oficial
            </span>
            <span className="block text-base font-bold tracking-tight">CDI</span>
          </span>
        </Link>

        <nav aria-label="Categorías" className="mx-auto hidden items-center gap-1 lg:flex">
          {secciones.map((seccion) => (
            <Link
              key={seccion.href}
              href={seccion.href}
              className="rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {seccion.nombre}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
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

          {user ? (
            <UserMenu user={user} enLaTienda />
          ) : (
            <Button
              variant="ghost"
              className="h-9 text-white hover:bg-white/10 hover:text-white"
              disabled={isPending}
              onClick={() => setLoginAbierto(true)}
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
            onClick={() => setAbierto(true)}
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

      {/* En el teléfono y la tableta las categorías van en una tira que se desliza. */}
      <nav
        aria-label="Categorías"
        className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-2 [scrollbar-width:none] lg:hidden"
      >
        {secciones.map((seccion) => (
          <Link
            key={seccion.href}
            href={seccion.href}
            className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/85"
          >
            {seccion.nombre}
          </Link>
        ))}
      </nav>

      <LoginDialog open={loginAbierto} onOpenChange={setLoginAbierto} enLaTienda />
    </header>
  );
}
