"use client";

import { Store } from "lucide-react";

import { useConfiguracionTienda } from "@/features/tienda/hooks/use-tienda";
import { cn } from "@/lib/utils";

/**
 * Dónde y cuándo se retira, tal como lo carga el club en el panel. Mientras
 * no lo cargue, se dice lo seguro —que se retira en el club— sin inventar
 * dirección ni horarios.
 */
export function Retiro({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  const { data } = useConfiguracionTienda();

  const lugar = data?.retiroLugar || "el club";
  const detalle = [data?.retiroDireccion, data?.retiroHorarios].filter(Boolean).join(" · ");

  return (
    <p className={cn("flex items-start gap-2 text-sm", className)}>
      <Store className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>
        Retiro en {lugar}
        {detalle && <>: {detalle}</>}.
        {!compacto && " Te avisamos por correo cuando tu pedido esté listo."}
      </span>
    </p>
  );
}
