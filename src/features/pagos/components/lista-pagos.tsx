import { Ban, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatearFechaCorta, formatearMonto, formatearVigencia } from "@/lib/formato";
import { ETIQUETAS_MEDIO_PAGO, type Pago } from "@/types/pago";

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/**
 * Una fila del historial.
 *
 * Un pago anulado no se oculta: se atenúa y se tacha el monto, y se explica el
 * motivo. El movimiento existió, y para el socio es la diferencia entre "no me
 * registraron el pago" y "me lo registraron y después lo dieron de baja".
 */
function FilaPago({ pago, mostrarSocio }: { pago: Pago; mostrarSocio?: boolean }) {
  return (
    <li
      className={cn(
        "rounded-xl border p-4",
        pago.anulado && "border-dashed bg-muted/40",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-heading text-lg font-bold",
              pago.anulado && "text-muted-foreground line-through",
            )}
          >
            {formatearMonto(pago.monto)}
          </span>

          {pago.anulado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              <Ban className="size-3" aria-hidden />
              Anulado
            </span>
          )}
        </div>

        <span className="text-sm text-muted-foreground">
          {formatearFechaCorta(pago.fechaPago)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {mostrarSocio && (
          <Dato etiqueta="Socio">
            {pago.socio.apellido}, {pago.socio.nombre}
          </Dato>
        )}
        <Dato etiqueta="Medio de pago">{ETIQUETAS_MEDIO_PAGO[pago.medioPago]}</Dato>
        <Dato etiqueta="Cuenta">{pago.cuenta.nombre}</Dato>
        <Dato etiqueta="Período que cubre">
          {formatearVigencia(pago.periodo.desde, pago.periodo.hasta)}
        </Dato>
        {pago.comprobante && <Dato etiqueta="Comprobante">{pago.comprobante}</Dato>}
      </dl>

      {pago.anulado && pago.motivoAnulacion && (
        <p className="mt-4 border-t border-dashed pt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Motivo de la anulación: </span>
          {pago.motivoAnulacion}
          {pago.anuladoEn && (
            <span className="block text-xs">
              Anulado el {formatearFechaCorta(pago.anuladoEn.slice(0, 10))}
              {pago.anuladoPor && ` por ${pago.anuladoPor}`}.
            </span>
          )}
        </p>
      )}
    </li>
  );
}

interface ListaPagosProps {
  pagos: Pago[];
  /** En el panel de administración interesa saber de quién es cada cobro. */
  mostrarSocio?: boolean;
  mensajeVacio?: string;
}

export function ListaPagos({
  pagos,
  mostrarSocio = false,
  mensajeVacio = "Todavía no hay pagos registrados.",
}: ListaPagosProps) {
  if (pagos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-center">
        <Receipt className="size-7 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{mensajeVacio}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {pagos.map((pago) => (
        <FilaPago key={pago.id} pago={pago} mostrarSocio={mostrarSocio} />
      ))}
    </ul>
  );
}
