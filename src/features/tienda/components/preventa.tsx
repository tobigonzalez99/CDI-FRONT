import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ISODateString } from "@/types/api";
import type { PreventaProducto } from "@/types/tienda";

/** "12 de noviembre a las 20:00". */
export function fechaCierrePreventa(hasta: ISODateString): string {
  return format(parseISO(hasta), "d 'de' MMMM 'a las' HH:mm", { locale: es });
}

/** Distintivo de un producto, o de un renglón, que se vende a pedido. */
export function EtiquetaPreventa({ chica = false, className }: { chica?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-sky-700 font-semibold tracking-wide text-white uppercase",
        chica ? "px-1.5 py-0.5 text-[10px] leading-none" : "px-2.5 py-1 text-[11px]",
        className,
      )}
    >
      Preventa
    </span>
  );
}

/** En la ficha: hasta cuándo se puede pedir y cuándo llega. */
export function AvisoPreventa({ preventa, className }: { preventa: PreventaProducto; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-sky-950", className)}>
      <CalendarClock className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="text-sm">
        <p className="font-semibold">Preventa hasta el {fechaCierrePreventa(preventa.hasta)}</p>
        <p>
          Se hace a pedido: elegí cualquier talle. Lo retirás cuando llegue al club.
          {preventa.entrega && ` ${preventa.entrega}`}
        </p>
      </div>
    </div>
  );
}

/** En el carrito, la compra y el pedido: lo que está en preventa no se retira enseguida. */
export function NotaPreventa({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-lg bg-sky-50 p-3 text-xs text-sky-950", className)}>
      <CalendarClock className="mt-px size-4 shrink-0" aria-hidden />
      Lo que está en preventa se entrega cuando llegue al club: te avisamos por correo.
    </p>
  );
}
