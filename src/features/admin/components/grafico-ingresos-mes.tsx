import {
  formatearMes,
  formatearMesCorto,
  formatearMonto,
  formatearMontoCompacto,
} from "@/lib/formato";
import type { IngresosDelMes } from "@/types/pago";

/** Redondea el tope del eje hacia arriba para que las marcas queden limpias. */
function calcularTope(maximo: number): number {
  if (maximo <= 0) return 1;
  const magnitud = 10 ** Math.floor(Math.log10(maximo));
  return Math.ceil(maximo / magnitud) * magnitud;
}

/**
 * Ingresos mes a mes.
 *
 * Una sola serie, así que no lleva leyenda: el título ya dice qué se grafica.
 * Se rotula únicamente el mes más alto; el resto lo cuentan el eje, el tooltip
 * y la tabla de abajo. Un número sobre cada columna se vuelve ruido.
 */
export function GraficoIngresosMes({ datos }: { datos: IngresosDelMes[] }) {
  if (datos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Todavía no hay ingresos registrados en este período.
      </p>
    );
  }

  const maximo = Math.max(...datos.map((d) => d.total));
  const indiceMaximo = datos.findIndex((d) => d.total === maximo);
  const tope = calcularTope(maximo);
  const marcas = [tope, tope / 2, 0];

  return (
    <figure className="space-y-4">
      <div className="flex gap-3">
        {/* Eje vertical */}
        <div
          aria-hidden
          className="flex h-48 w-16 shrink-0 flex-col justify-between text-right text-xs text-muted-foreground tabular-nums"
        >
          {marcas.map((marca) => (
            <span key={marca}>{formatearMontoCompacto(marca)}</span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {/* Las líneas de referencia van detrás de las columnas, en gris tenue. */}
          <div className="relative h-48">
            <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
              {marcas.map((marca) => (
                <div key={marca} className="h-px w-full bg-border" />
              ))}
            </div>

            {/*
              `items-stretch` + `h-full` en cada columna: sin un alto definido
              en el padre, el porcentaje de la barra no tiene contra qué
              resolverse y las columnas colapsan.
            */}
            <ul className="absolute inset-0 flex items-stretch gap-2">
              {datos.map((mes, indice) => {
                const altura = Math.max((mes.total / tope) * 100, 1);
                // Con empate se rotula solo el primero, para no repetir el dato.
                const esMaximo = mes.total === maximo && indice === indiceMaximo;

                return (
                  <li
                    key={mes.mes}
                    className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    {esMaximo && (
                      <span className="mb-1 text-xs font-semibold tabular-nums">
                        {formatearMontoCompacto(mes.total)}
                      </span>
                    )}

                    {/* Columna: 4px redondeado arriba, recta sobre la base. */}
                    <div
                      className="w-full max-w-6 rounded-t-[4px] bg-chart-mark transition-opacity group-hover:opacity-85 group-focus-within:opacity-85"
                      style={{ height: `${altura}%` }}
                    />

                    {/*
                      El botón hace que el dato sea alcanzable con teclado y da
                      un área de toque más grande que la columna.
                    */}
                    <button
                      type="button"
                      className="absolute inset-0 cursor-default rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={`${formatearMes(mes.mes)}: ${formatearMonto(mes.total)} en ${mes.cantidad} ${mes.cantidad === 1 ? "pago" : "pagos"}`}
                    />

                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border bg-popover px-3 py-2 text-xs whitespace-nowrap shadow-md group-hover:block group-focus-within:block"
                    >
                      <p className="font-medium capitalize">{formatearMes(mes.mes)}</p>
                      <p className="tabular-nums">{formatearMonto(mes.total)}</p>
                      <p className="text-muted-foreground">
                        {mes.cantidad} {mes.cantidad === 1 ? "pago" : "pagos"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Eje horizontal */}
          <ul aria-hidden className="mt-2 flex gap-2">
            {datos.map((mes) => (
              <li
                key={mes.mes}
                className="min-w-0 flex-1 text-center text-xs text-muted-foreground"
              >
                {formatearMesCorto(mes.mes)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Alternativa textual: los mismos datos sin depender del gráfico. */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Ver los datos en una tabla
        </summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th scope="col" className="py-1.5 font-medium">
                Mes
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Total
              </th>
              <th scope="col" className="py-1.5 text-right font-medium">
                Pagos
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((mes) => (
              <tr key={mes.mes} className="border-b last:border-0">
                <td className="py-1.5 capitalize">{formatearMes(mes.mes)}</td>
                <td className="py-1.5 text-right tabular-nums">
                  {formatearMonto(mes.total)}
                </td>
                <td className="py-1.5 text-right tabular-nums">{mes.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
