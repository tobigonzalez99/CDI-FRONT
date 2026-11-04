import Link from "next/link";

import { IlustracionProducto } from "@/features/tienda/components/ilustracion-producto";
import { AvisoStock, Precio } from "@/features/tienda/components/precio";
import { stockTotal, type ProductoTienda } from "@/features/tienda/maqueta/datos";
import { cn } from "@/lib/utils";

/**
 * Producto en una grilla: foto grande, nombre y precio. Toda la tarjeta lleva
 * a la ficha, que es donde se elige el talle.
 */
export function TarjetaProducto({ producto }: { producto: ProductoTienda }) {
  const agotado = stockTotal(producto) === 0;

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-xl">
        <IlustracionProducto
          ilustracion={producto.ilustraciones[0]}
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
          <AvisoStock producto={producto} />
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
