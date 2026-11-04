import { Check, CircleCheck, Store } from "lucide-react";

import { Retiro } from "@/features/tienda/components/retiro";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

const ETAPAS = [
  { titulo: "Pago confirmado", detalle: "Recibimos tu pago por Mercado Pago." },
  { titulo: "Preparando tu pedido", detalle: "Lo estamos juntando en el club." },
  { titulo: "Listo para retirar", detalle: "Te avisamos por correo. Llevá tu DNI." },
  { titulo: "Retirado", detalle: "¡Que lo disfrutes!" },
];

/**
 * Seguimiento del pedido. El invitado llega acá desde el enlace del correo;
 * el socio, también desde su perfil.
 */
export function SeguimientoPedido({ codigo, nuevo }: { codigo: string; nuevo: boolean }) {
  const etapa = 1;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 md:py-14">
      {nuevo && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <CircleCheck className="size-6 shrink-0" aria-hidden />
          <div>
            <p className="font-heading text-lg font-bold">¡Gracias por tu compra!</p>
            <p className="text-sm">
              Te mandamos un correo con este resumen y el enlace para seguir tu pedido.
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">Pedido</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight">{codigo}</h1>

      <ol className="mt-8 space-y-0">
        {ETAPAS.map((item, indice) => {
          const hecho = indice < etapa;
          const actual = indice === etapa;
          return (
            <li key={item.titulo} className="relative flex gap-4 pb-8 last:pb-0">
              {indice < ETAPAS.length - 1 && (
                <span
                  aria-hidden
                  className={cn("absolute top-8 left-[15px] h-[calc(100%-2rem)] w-0.5", hecho ? "bg-brand-black" : "bg-border")}
                />
              )}
              <span
                className={cn(
                  "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                  hecho && "bg-brand-black text-white",
                  actual && "bg-brand-red text-white ring-4 ring-brand-red/20",
                  !hecho && !actual && "border-2 bg-background",
                )}
              >
                {hecho && <Check className="size-4" aria-hidden />}
              </span>
              <div className={cn(!hecho && !actual && "text-muted-foreground")}>
                <p className="font-semibold">{item.titulo}</p>
                <p className="text-sm text-muted-foreground">{item.detalle}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Store className="size-4" aria-hidden />
            Dónde retirar
          </p>
          <Retiro compacto className="mt-2 text-muted-foreground" />
        </div>
        <div className="rounded-2xl border p-5 text-sm">
          <p className="font-semibold">Resumen</p>
          <p className="mt-2 text-muted-foreground">1 × Camiseta titular 2026 · talle M</p>
          <p className="mt-1 font-heading text-xl font-bold">{formatearMonto(45900)}</p>
        </div>
      </div>
    </div>
  );
}
