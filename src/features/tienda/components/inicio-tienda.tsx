"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CreditCard, Receipt, Store } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ErrorConsulta } from "@/components/shared/estado-consulta";
import { AvisoSocio } from "@/features/tienda/components/aviso-socio";
import { FotoProducto } from "@/features/tienda/components/foto-producto";
import {
  TarjetaProducto,
  TarjetaProductoCargando,
} from "@/features/tienda/components/tarjeta-producto";
import {
  useCategoriasTienda,
  useConfiguracionTienda,
  useProductosTienda,
} from "@/features/tienda/hooks/use-tienda";
import { cn } from "@/lib/utils";
import type { FiltrosCatalogo } from "@/types/tienda";

function Seccion({ titulo, filtros, href }: { titulo: string; filtros: FiltrosCatalogo; href: string }) {
  const { data, isPending, isError, error, refetch } = useProductosTienda(filtros);

  if (data && data.data.length === 0) return null;

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
      {isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }, (_, indice) => <TarjetaProductoCargando key={indice} />)
            : data.data.map((producto) => <TarjetaProducto key={producto.id} producto={producto} />)}
        </div>
      )}
    </section>
  );
}

/**
 * Banner: el primer destacado. Hasta que el panel permita elegir uno a mano,
 * lo que el club marca como destacado es lo que quiere vender hoy.
 */
function Banner() {
  const { data } = useProductosTienda({ destacados: true, pageSize: 4 });
  const producto = data?.data.find((item) => item.disponibilidad !== "SIN_STOCK") ?? data?.data[0];

  return (
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
            Tienda oficial
          </p>
          <h1 className="mt-3 font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance md:text-6xl">
            {producto ? producto.nombre : "Llevate el rojo y negro"}
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Camisetas, indumentaria, mates y accesorios del club. Comprás online y retirás en
            el club.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {producto && (
              <Link
                href={`/tienda/productos/${producto.slug}`}
                className={cn(buttonVariants({ size: "lg" }), "h-12 px-7 text-base")}
              >
                Comprar ahora
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
            <Link
              href="/tienda/productos"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 border-white/25 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Ver todos los productos
            </Link>
          </div>
        </div>

        {producto && (
          <FotoProducto
            imagen={producto.imagen}
            alt={producto.nombre}
            priority
            sizes="(min-width: 768px) 384px, 220px"
            className="mx-auto w-full max-w-[220px] rounded-3xl md:max-w-sm"
          />
        )}
      </div>
    </section>
  );
}

export function InicioTienda() {
  const { data: categorias = [] } = useCategoriasTienda();
  const { data: configuracion } = useConfiguracionTienda();

  return (
    <div className="space-y-16 pb-16">
      <Banner />

      <AvisoSocio />

      {categorias.length > 0 && (
        <section className="container mx-auto px-4">
          <h2 className="sr-only">Categorías</h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categorias.map((categoria, indice) => (
              <li key={categoria.id}>
                <Link
                  href={`/tienda/productos?categoria=${categoria.slug}`}
                  className={cn(
                    "group flex h-28 items-end justify-between gap-2 rounded-2xl p-4 font-heading text-lg leading-tight font-bold transition-colors md:h-36",
                    indice % 2 === 0
                      ? "bg-brand-black text-white hover:bg-brand-graphite"
                      : "bg-brand-red text-white hover:bg-brand-red-hover",
                  )}
                >
                  {categoria.nombre}
                  <ArrowUpRight
                    className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Seccion titulo="Destacados" filtros={{ destacados: true, pageSize: 4 }} href="/tienda/productos" />

      {/* Lo que conviene saber antes de comprar, en una línea. */}
      <section className="container mx-auto px-4">
        <ul className="grid gap-3 rounded-2xl border bg-background p-4 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <Store className="size-5 shrink-0 text-brand-red" aria-hidden />
            Retirás en {configuracion?.retiroLugar || "el club"}
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

      <Seccion
        titulo="Novedades"
        filtros={{ orden: "nuevos", pageSize: 4 }}
        href="/tienda/productos?orden=nuevos"
      />
    </div>
  );
}
