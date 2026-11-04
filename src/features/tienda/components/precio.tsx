"use client";

import { BadgePercent } from "lucide-react";

import { useMiDescuento } from "@/features/tienda/hooks/use-tienda";
import { precioConDescuento } from "@/features/tienda/lib/precio";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { Disponibilidad, ProductoResumen } from "@/types/tienda";

/**
 * Precio de un producto según quién mira. Siempre es el precio final, con
 * impuestos: lo exige la ley.
 *
 * - Socio con descuento: el de lista tachado y el suyo en rojo.
 * - Socio sin descuento (otra categoría, cuota vencida, de baja): el de lista,
 *   sin la referencia de "Socios", que en su caso no aplica y confundiría.
 * - Invitado: el de lista y, debajo, la referencia de cuánto paga un socio.
 */
export function Precio({
  producto,
  grande = false,
}: {
  producto: Pick<ProductoResumen, "precio" | "precioSocio">;
  grande?: boolean;
}) {
  const { esSocio, descuento } = useMiDescuento();
  const tamaño = grande ? "text-3xl" : "text-lg";

  if (descuento?.motivo === "APLICA" && descuento.porcentaje > 0) {
    return (
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground line-through">
          {formatearMonto(producto.precio)}
        </p>
        <p className={cn("flex flex-wrap items-center gap-1.5 font-heading font-bold text-brand-red", tamaño)}>
          {formatearMonto(precioConDescuento(producto.precio, descuento.porcentaje))}
          <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-white uppercase">
            Socio −{descuento.porcentaje}%
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <p className={cn("font-heading font-bold", tamaño)}>{formatearMonto(producto.precio)}</p>
      {!esSocio && producto.precioSocio !== null && (
        <p className="flex items-center gap-1 text-xs font-medium text-brand-red">
          <BadgePercent className="size-3.5" aria-hidden />
          Socios: {formatearMonto(producto.precioSocio)}
        </p>
      )}
    </div>
  );
}

/** "Sin stock" o "Últimas unidades", para la tarjeta y la ficha. */
export function AvisoStock({
  disponibilidad,
  className,
}: {
  disponibilidad: Disponibilidad;
  className?: string;
}) {
  if (disponibilidad === "SIN_STOCK") {
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

  if (disponibilidad === "ULTIMAS_UNIDADES") {
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
