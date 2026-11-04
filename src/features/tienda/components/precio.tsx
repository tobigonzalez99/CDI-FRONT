"use client";

import { BadgePercent } from "lucide-react";

import { useMaqueta } from "@/features/tienda/maqueta/maqueta-context";
import { DESCUENTO_SOCIO, precioSocio, stockTotal, POCAS_UNIDADES, type ProductoTienda } from "@/features/tienda/maqueta/datos";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Precio de un producto según quién mira.
 *
 * - Invitado: el precio de lista, y debajo cuánto pagaría siendo socio. Es la
 *   invitación a asociarse, en el lugar donde más pesa.
 * - Socio con descuento: el de lista tachado y el suyo en rojo.
 *
 * Siempre es el precio final, con impuestos: lo exige la ley y así lo dice.
 */
export function Precio({
  producto,
  grande = false,
}: {
  producto: ProductoTienda;
  grande?: boolean;
}) {
  const { visitante } = useMaqueta();
  const socio = precioSocio(producto.precio);

  if (visitante === "socio") {
    return (
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground line-through">
          {formatearMonto(producto.precio)}
        </p>
        <p
          className={cn(
            "flex items-center gap-1.5 font-heading font-bold text-brand-red",
            grande ? "text-3xl" : "text-lg",
          )}
        >
          {formatearMonto(socio)}
          <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-white uppercase">
            Socio −{Math.round(DESCUENTO_SOCIO * 100)}%
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <p className={cn("font-heading font-bold", grande ? "text-3xl" : "text-lg")}>
        {formatearMonto(producto.precio)}
      </p>
      <p className="flex items-center gap-1 text-xs font-medium text-brand-red">
        <BadgePercent className="size-3.5" aria-hidden />
        Socios: {formatearMonto(socio)}
      </p>
    </div>
  );
}

/** "Sin stock" o "Últimas unidades", para la tarjeta y la ficha. */
export function AvisoStock({ producto, className }: { producto: ProductoTienda; className?: string }) {
  const stock = stockTotal(producto);

  if (stock === 0) {
    return (
      <span
        className={cn(
          "rounded-full bg-brand-black px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase",
          className,
        )}
      >
        Sin stock
      </span>
    );
  }

  // En los de talle, "últimas" se mira por el total: por talle lo dice el selector.
  if (stock <= POCAS_UNIDADES) {
    return (
      <span
        className={cn(
          "rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-amber-950 uppercase",
          className,
        )}
      >
        Últimas unidades
      </span>
    );
  }

  return null;
}
