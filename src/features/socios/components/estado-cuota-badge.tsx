import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EstadoCuota } from "@/types/socio";

const ESTILOS: Record<EstadoCuota, { texto: string; clases: string }> = {
  AL_DIA: {
    texto: "AL DÍA",
    clases: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  PENDIENTE: {
    texto: "PENDIENTE DE PAGO",
    clases: "bg-red-50 text-red-700 ring-red-600/20",
  },
};

/**
 * HU-04: indicador visual del estado de la cuota.
 * El color no es el único indicador: también cambian el ícono y el texto,
 * para que se entienda sin distinguir colores.
 */
export function EstadoCuotaBadge({
  estado,
  className,
}: {
  estado: EstadoCuota;
  className?: string;
}) {
  const { texto, clases } = ESTILOS[estado];
  const Icono = estado === "AL_DIA" ? CircleCheck : CircleAlert;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
        clases,
        className,
      )}
    >
      <Icono className="size-3.5" aria-hidden />
      {texto}
    </span>
  );
}
