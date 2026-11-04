import Link from "next/link";

import { FotoProducto } from "@/features/tienda/components/foto-producto";
import { AvisoStock, Precio } from "@/features/tienda/components/precio";
import { cn } from "@/lib/utils";
import type { ProductoResumen } from "@/types/tienda";

/**
 * Producto en una grilla: foto grande, nombre y precio. Toda la tarjeta lleva
 * a la ficha, que es donde se elige el talle.
 */
export function TarjetaProducto({ producto }: { producto: ProductoResumen }) {
  const agotado = producto.disponibilidad === "SIN_STOCK";

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-xl">
        <FotoProducto
          imagen={producto.imagen}
          alt={producto.nombre}
          className={cn(
            "transition-transform duration-300 group-hover:scale-[1.03]",
            agotado && "opacity-50 grayscale",
          )}
        />

        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {producto.nuevo && !agotado && (
            <span className="rounded-full bg-brand-red px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
              Nuevo
            </span>
          )}
          <AvisoStock disponibilidad={producto.disponibilidad} />
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        <h3 className="text-sm leading-snug font-medium">
          <Link
            href={`/tienda/productos/${producto.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {producto.nombre}
          </Link>
        </h3>
        <Precio producto={producto} />
      </div>
    </article>
  );
}

/** Lugar de una tarjeta mientras carga, para que la grilla no salte. */
export function TarjetaProductoCargando() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="aspect-square rounded-xl bg-neutral-100" />
      <div className="mt-3 h-4 w-3/4 rounded bg-neutral-100" />
      <div className="mt-2 h-5 w-1/3 rounded bg-neutral-100" />
    </div>
  );
}
