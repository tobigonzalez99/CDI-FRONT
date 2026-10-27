import { formatearMonto } from "@/lib/formato";
import type { TotalPorClave } from "@/types/pago";

/**
 * Desglose ordenado por monto (medio de pago, cuenta).
 *
 * Barras de un solo tono: codifican magnitud, no identidad, y cada una lleva
 * su nombre al lado. Colorear cada fila de distinto obligaría a cruzar una
 * leyenda para leer algo que ya dice el texto.
 */
export function BarrasDesglose({
  datos,
  mensajeVacio = "Sin movimientos en este período.",
}: {
  datos: TotalPorClave[];
  mensajeVacio?: string;
}) {
  if (datos.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{mensajeVacio}</p>;
  }

  const maximo = Math.max(...datos.map((d) => d.total));
  const ordenados = [...datos].sort((a, b) => b.total - a.total);

  return (
    <ul className="space-y-3">
      {ordenados.map((fila) => (
        <li key={fila.clave}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium">{fila.nombre}</span>
            <span className="shrink-0 text-sm tabular-nums">
              {formatearMonto(fila.total)}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-chart-track">
              <div
                className="h-full rounded-full bg-chart-mark"
                style={{ width: `${Math.max((fila.total / maximo) * 100, 2)}%` }}
                role="img"
                aria-label={`${fila.nombre}: ${formatearMonto(fila.total)} en ${fila.cantidad} ${fila.cantidad === 1 ? "pago" : "pagos"}`}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {fila.cantidad} {fila.cantidad === 1 ? "pago" : "pagos"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
