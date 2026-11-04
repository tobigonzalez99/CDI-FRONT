import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { BadgePercent, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ETIQUETAS_ESTADO_PEDIDO, PEDIDOS, type EstadoPedido } from "@/features/tienda/maqueta/datos";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos" };

const COLOR_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE_PAGO: "bg-muted text-muted-foreground",
  PAGADO: "bg-amber-100 text-amber-900",
  PREPARADO: "bg-sky-100 text-sky-900",
  RETIRADO: "bg-emerald-100 text-emerald-900",
  CANCELADO: "bg-destructive/10 text-destructive",
};

/** La acción que corresponde a cada estado: un solo botón, el próximo paso. */
const SIGUIENTE: Partial<Record<EstadoPedido, string>> = {
  PAGADO: "Marcar como listo",
  PREPARADO: "Marcar como retirado",
};

const FILTROS = ["A preparar", "Listos para retirar", "Todos"];

export default function PanelPedidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Al marcar un pedido como listo, al comprador le llega un correo para que lo pase a
          buscar. Al entregarlo, pedile el DNI y marcalo como retirado.
        </p>
      </div>

      <div className="inline-flex rounded-lg border p-1" role="group" aria-label="Qué mostrar">
        {FILTROS.map((filtro, indice) => (
          <button
            key={filtro}
            type="button"
            aria-pressed={indice === 2}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              indice === 2 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {filtro}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {PEDIDOS.map((pedido) => (
          <article key={pedido.codigo} className="rounded-2xl border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-bold">{pedido.codigo}</h2>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", COLOR_ESTADO[pedido.estado])}>
                    {ETIQUETAS_ESTADO_PEDIDO[pedido.estado]}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {pedido.comprador}
                  {pedido.esSocio && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-brand-red">
                      <BadgePercent className="size-3.5" aria-hidden />
                      socio
                    </span>
                  )}{" "}
                  · {format(parseISO(pedido.fecha), "dd/MM/yyyy 'a las' HH:mm")}
                </p>
              </div>
              <p className="font-heading text-xl font-bold tabular-nums">{formatearMonto(pedido.total)}</p>
            </div>

            <ul className="mt-4 space-y-1 border-t pt-4 text-sm">
              {pedido.items.map((item) => (
                <li key={`${item.nombre}-${item.talle ?? ""}`} className="flex justify-between gap-3">
                  <span>
                    {item.cantidad} × {item.nombre}
                    {item.talle && <span className="text-muted-foreground"> · talle {item.talle}</span>}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{formatearMonto(item.precio * item.cantidad)}</span>
                </li>
              ))}
            </ul>

            {SIGUIENTE[pedido.estado] && (
              <div className="mt-4 flex justify-end border-t pt-4">
                <Button variant={pedido.estado === "PAGADO" ? "default" : "outline"} size="sm">
                  <PackageCheck aria-hidden />
                  {SIGUIENTE[pedido.estado]}
                </Button>
              </div>
            )}
            {pedido.estado === "PENDIENTE_PAGO" && (
              <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                El stock queda reservado 30 minutos. Si no paga, el pedido se cancela solo.
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
