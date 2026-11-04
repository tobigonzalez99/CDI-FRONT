import Link from "next/link";
import { ArrowRight, CreditCard, Receipt, Store } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { AvisoSocio } from "@/features/tienda/components/aviso-socio";
import { IlustracionProducto } from "@/features/tienda/components/ilustracion-producto";
import { TarjetaProducto } from "@/features/tienda/components/tarjeta-producto";
import { CATEGORIAS, PRODUCTOS } from "@/features/tienda/maqueta/datos";
import { cn } from "@/lib/utils";

function Seccion({
  titulo,
  href,
  children,
}: {
  titulo: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container mx-auto px-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">{titulo}</h2>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-red hover:underline"
        >
          Ver todo
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">{children}</div>
    </section>
  );
}

export default function TiendaInicioPage() {
  const destacados = PRODUCTOS.filter((producto) => producto.destacado).slice(0, 4);
  const novedades = PRODUCTOS.filter((producto) => producto.nuevo).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Banner: lo que el club quiere vender hoy. En la real se elige desde el panel. */}
      <section className="relative overflow-hidden bg-brand-black text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, var(--brand-red) 0 48px, transparent 48px 96px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/90 to-brand-black/40" />

        <div className="relative container mx-auto grid items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-brand-red-soft uppercase">
              Temporada 2026
            </p>
            <h1 className="mt-3 font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance md:text-6xl">
              La nueva camiseta ya está acá
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Rojo y negro, como siempre. Con el escudo bordado y la tela liviana de la
              temporada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tienda/productos/camiseta-titular-2026"
                className={cn(buttonVariants({ size: "lg" }), "h-12 px-7 text-base")}
              >
                Comprar la camiseta
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/tienda/productos?categoria=camisetas"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Ver todas
              </Link>
            </div>
          </div>

          <IlustracionProducto
            ilustracion="camiseta-titular"
            toma={2}
            className="mx-auto w-full max-w-[220px] rounded-3xl bg-white/5 md:max-w-sm"
          />
        </div>
      </section>

      {/* Lo que conviene saber antes de comprar, en una línea. */}
      <section className="container mx-auto -mt-8 px-4">
        <ul className="grid gap-3 rounded-2xl border bg-background p-4 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <Store className="size-5 shrink-0 text-brand-red" aria-hidden />
            Retirás en la sede del club
          </li>
          <li className="flex items-center gap-3">
            <CreditCard className="size-5 shrink-0 text-brand-red" aria-hidden />
            Pagás con Mercado Pago
          </li>
          <li className="flex items-center gap-3">
            <Receipt className="size-5 shrink-0 text-brand-red" aria-hidden />
            Precios finales, con impuestos
          </li>
        </ul>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="sr-only">Categorías</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIAS.map((categoria) => (
            <li key={categoria.slug}>
              <Link
                href={`/tienda/productos?categoria=${categoria.slug}`}
                className="group relative block overflow-hidden rounded-2xl"
              >
                <IlustracionProducto
                  ilustracion={categoria.ilustracion}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 font-heading text-lg font-bold text-white">
                  {categoria.nombre}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Seccion titulo="Destacados" href="/tienda/productos">
        {destacados.map((producto) => (
          <TarjetaProducto key={producto.slug} producto={producto} />
        ))}
      </Seccion>

      <AvisoSocio />

      <Seccion titulo="Novedades" href="/tienda/productos">
        {novedades.map((producto) => (
          <TarjetaProducto key={producto.slug} producto={producto} />
        ))}
      </Seccion>
    </div>
  );
}
