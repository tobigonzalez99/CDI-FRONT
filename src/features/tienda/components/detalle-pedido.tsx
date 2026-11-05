import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Ban, Check, Clock, Store, Undo2 } from "lucide-react";

import { FotoProducto } from "@/features/tienda/components/foto-producto";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import {
  ETIQUETAS_ARREPENTIMIENTO,
  ETIQUETAS_ESTADO_PEDIDO,
  type EstadoPedido,
  type Pedido,
} from "@/types/tienda";

function fechaHora(fecha: string): string {
  return format(parseISO(fecha), "dd/MM 'a las' HH:mm");
}

/** El camino de un pedido. Cancelado lo corta: se muestra aparte. */
const ETAPAS: { estado: EstadoPedido; titulo: string; detalle: string }[] = [
  { estado: "PENDIENTE_PAGO", titulo: "Pedido reservado", detalle: "Lo pagás al retirarlo en el club." },
  { estado: "PAGADO", titulo: "Pagado", detalle: "Lo estamos preparando." },
  { estado: "PREPARADO", titulo: "Listo para retirar", detalle: "Te avisamos por correo. Llevá tu DNI." },
  { estado: "RETIRADO", titulo: "Retirado", detalle: "¡Que lo disfrutes!" },
];

export function EtiquetaEstadoPedido({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        estado === "CANCELADO" && "bg-destructive/10 text-destructive",
        estado === "DEVUELTO" && "bg-muted text-muted-foreground",
        estado === "PENDIENTE_PAGO" && "bg-amber-100 text-amber-900",
        (estado === "PAGADO" || estado === "PREPARADO") && "bg-sky-100 text-sky-900",
        estado === "RETIRADO" && "bg-emerald-100 text-emerald-900",
      )}
    >
      {ETIQUETAS_ESTADO_PEDIDO[estado]}
    </span>
  );
}

/**
 * Un pedido, tal como lo ve el comprador: estado, qué compró, cuánto pagó y
 * dónde retirarlo. No muestra el DNI, a propósito.
 */
export function DetallePedido({ pedido }: { pedido: Pedido }) {
  const cancelado = pedido.estado === "CANCELADO";
  const devuelto = pedido.estado === "DEVUELTO";
  const { arrepentimiento } = pedido;
  const actual = ETAPAS.findIndex((etapa) => etapa.estado === pedido.estado);
  const { retiro } = pedido;
  const hayRetiro = retiro.lugar || retiro.direccion || retiro.horarios;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          Pedido del {format(parseISO(pedido.createdAt), "dd/MM/yyyy")}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{pedido.codigo}</h1>
          <EtiquetaEstadoPedido estado={pedido.estado} />
        </div>
      </div>

      {pedido.estado === "PENDIENTE_PAGO" && pedido.venceEn && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950">
          <Clock className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">Pagás al retirar en el club.</span> Te lo reservamos hasta
            el {fechaHora(pedido.venceEn)}. Si no lo retirás para entonces, se cancela solo.
          </p>
        </div>
      )}

      {arrepentimiento && (
        <div className="flex items-start gap-3 rounded-2xl bg-muted p-5">
          <Undo2 className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">
              Arrepentimiento {arrepentimiento.tramite}:{" "}
              {ETIQUETAS_ARREPENTIMIENTO[arrepentimiento.estado].toLowerCase()}
            </p>
            <p className="text-muted-foreground">
              {arrepentimiento.nota ??
                (arrepentimiento.estado === "PENDIENTE"
                  ? "El club lo está revisando y te responde por correo."
                  : "Te escribimos por correo con el detalle.")}
            </p>
          </div>
        </div>
      )}

      {devuelto ? null : cancelado ? (
        <div className="flex items-start gap-3 rounded-2xl bg-destructive/10 p-5 text-destructive">
          <Ban className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">Este pedido se canceló.</p>
            {pedido.motivoCancelacion && <p>{pedido.motivoCancelacion}.</p>}
            <p className="mt-1">
              Si todavía lo querés, podés{" "}
              <Link href="/tienda/productos" className="font-semibold underline">
                volver a comprarlo
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <ol>
          {ETAPAS.map((etapa, indice) => {
            const hecho = indice < actual;
            const esActual = indice === actual;
            const fecha = pedido.historial.find((item) => item.estado === etapa.estado)?.fecha;
            return (
              <li key={etapa.estado} className="relative flex gap-4 pb-7 last:pb-0">
                {indice < ETAPAS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5",
                      hecho ? "bg-brand-black" : "bg-border",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                    hecho && "bg-brand-black text-white",
                    esActual && "bg-brand-red text-white ring-4 ring-brand-red/20",
                    !hecho && !esActual && "border-2 bg-background",
                  )}
                >
                  {(hecho || esActual) && <Check className="size-4" aria-hidden />}
                </span>
                <div className={cn(!hecho && !esActual && "text-muted-foreground")}>
                  <p className="font-semibold">{etapa.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {[fecha && fechaHora(fecha), (esActual || !hecho) && etapa.detalle]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border p-5">
          <h2 className="font-heading text-lg font-bold">Lo que compraste</h2>
          <ul className="mt-4 space-y-3">
            {pedido.items.map((item, indice) => (
              <li key={`${item.productoNombre}-${item.talle ?? ""}-${indice}`} className="flex items-center gap-3">
                <FotoProducto
                  imagen={item.imagenUrl ? { id: String(indice), url: item.imagenUrl, ancho: 1, alto: 1 } : null}
                  alt=""
                  sizes="56px"
                  className="w-14 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{item.productoNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.cantidad} × {formatearMonto(item.precioFinal)}
                    {item.talle && ` · talle ${item.talle}`}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatearMonto(item.subtotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            {pedido.descuentoMonto > 0 && (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatearMonto(pedido.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-brand-red">
                  <dt>Descuento de socio ({pedido.descuentoPorcentaje}%)</dt>
                  <dd className="tabular-nums">− {formatearMonto(pedido.descuentoMonto)}</dd>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between">
              <dt className="font-semibold">Total</dt>
              <dd className="font-heading text-xl font-bold tabular-nums">{formatearMonto(pedido.total)}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <Store className="size-4" aria-hidden />
              Dónde retirar
            </p>
            {hayRetiro ? (
              <div className="mt-2 text-muted-foreground">
                {retiro.lugar && <p className="font-medium text-foreground">{retiro.lugar}</p>}
                {retiro.direccion && <p>{retiro.direccion}</p>}
                {retiro.horarios && <p>{retiro.horarios}</p>}
              </div>
            ) : (
              <p className="mt-2 text-muted-foreground">El club te va a avisar dónde y cuándo retirarlo.</p>
            )}
            {retiro.retiraOtraPersona && (
              <p className="mt-3 border-t pt-3">
                Lo retira <span className="font-medium">{retiro.retiraOtraPersona}</span>, con su DNI.
              </p>
            )}
          </div>

          <div className="rounded-2xl border p-5 text-sm">
            <p className="font-semibold">A nombre de</p>
            <p className="mt-2">
              {pedido.comprador.nombre} {pedido.comprador.apellido}
            </p>
            <p className="break-all text-muted-foreground">{pedido.comprador.email}</p>
            <p className="text-muted-foreground">{pedido.comprador.telefono}</p>
            {pedido.notas && (
              <p className="mt-3 border-t pt-3 text-muted-foreground">
                <span className="font-medium text-foreground">Notas: </span>
                {pedido.notas}
              </p>
            )}
          </div>

          {!cancelado && !devuelto && !arrepentimiento && (
            <Link
              href={`/tienda/arrepentimiento?pedido=${pedido.codigo}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground underline hover:text-foreground"
            >
              <Undo2 className="size-4" aria-hidden />
              Arrepentirme de esta compra
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
