"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { EtiquetaEstadoPedido } from "@/features/tienda/components/detalle-pedido";
import { Campo, CLASES_TEXTAREA } from "@/features/tienda/components/panel/campo";
import { useArrepentimientos, useResolverArrepentimiento } from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import {
  resolverArrepentimientoSchema,
  type ResolverArrepentimientoFormValues,
} from "@/lib/validators/tienda";
import { ETIQUETAS_MEDIO_PAGO } from "@/types/pago";
import {
  ETIQUETAS_ARREPENTIMIENTO,
  type Arrepentimiento,
  type EstadoArrepentimiento,
} from "@/types/tienda";

const VISTAS: { estado?: EstadoArrepentimiento; etiqueta: string }[] = [
  { estado: "PENDIENTE", etiqueta: "Pendientes" },
  { estado: "ACEPTADO", etiqueta: "Aceptados" },
  { estado: "RECHAZADO", etiqueta: "Rechazados" },
  { etiqueta: "Todos" },
];

const COLOR_ESTADO: Record<EstadoArrepentimiento, string> = {
  PENDIENTE: "bg-amber-100 text-amber-900",
  ACEPTADO: "bg-emerald-100 text-emerald-900",
  RECHAZADO: "bg-muted text-muted-foreground",
};

type Decision = { caso: Arrepentimiento; resultado: "ACEPTADO" | "RECHAZADO" };

function DecisionDialog({
  decision,
  abierto,
  onClose,
}: {
  decision: Decision | null;
  abierto: boolean;
  onClose: () => void;
}) {
  const id = useId();
  const { mutateAsync: resolver } = useResolverArrepentimiento();
  const acepta = decision?.resultado === "ACEPTADO";
  // Sin retirar, las unidades nunca salieron del club: vuelven solas.
  const seRetiro = acepta && decision?.caso.pedido.estado === "RETIRADO";

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResolverArrepentimientoFormValues>({
    resolver: zodResolver(resolverArrepentimientoSchema),
    values: { resultado: decision?.resultado ?? "ACEPTADO", nota: "", reponerStock: true },
  });

  function cerrar() {
    reset();
    onClose();
  }

  const onSubmit: SubmitHandler<ResolverArrepentimientoFormValues> = async (valores) => {
    if (!decision) return;
    try {
      await resolver({
        id: decision.caso.id,
        resultado: valores.resultado,
        nota: valores.nota || undefined,
        reponerStock: seRetiro ? valores.reponerStock : undefined,
      });
      toast.success(`${decision.caso.tramite}: ${acepta ? "aceptado" : "rechazado"}`);
      cerrar();
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["nota"])) {
        toast.error("No pudimos resolver el trámite", { description: mensajeDeError(error) });
        cerrar();
      }
    }
  };

  const pedido = decision?.caso.pedido;
  const hayDinero = pedido?.estado !== "PENDIENTE_PAGO";

  return (
    <Dialog open={abierto} onOpenChange={(sigue) => !sigue && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {acepta ? "Aceptar" : "Rechazar"} {decision?.caso.tramite}
          </DialogTitle>
          <DialogDescription>
            Al comprador le llega un correo con el resultado. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {acepta && pedido && (
            <>
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
                El pedido {pedido.codigo} pasa a devuelto y deja de contar en las ventas.
                {hayDinero &&
                  ` El panel no mueve dinero: ${formatearMonto(pedido.total)} los devuelve el club por fuera.`}
              </p>
              {seRetiro && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4 accent-brand-red" {...register("reponerStock")} />
                  Volver a poner las unidades a la venta
                </label>
              )}
            </>
          )}
          <Campo
            id={`${id}-nota`}
            etiqueta={acepta ? "Nota (opcional)" : "Motivo"}
            ayuda="Lo ve el comprador."
            error={errors.nota?.message}
          >
            <textarea
              id={`${id}-nota`}
              rows={3}
              className={CLASES_TEXTAREA}
              aria-invalid={Boolean(errors.nota)}
              {...register("nota")}
            />
          </Campo>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={cerrar} disabled={isSubmitting}>
              Volver
            </Button>
            <Button type="submit" variant={acepta ? "default" : "danger"} disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
              {acepta ? "Aceptar" : "Rechazar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TarjetaCaso({
  caso,
  onDecidir,
}: {
  caso: Arrepentimiento;
  onDecidir: (resultado: Decision["resultado"]) => void;
}) {
  const { pedido } = caso;

  return (
    <article className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-bold">{caso.tramite}</h2>
            <span
              className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", COLOR_ESTADO[caso.estado])}
            >
              {ETIQUETAS_ARREPENTIMIENTO[caso.estado]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pedido el {format(parseISO(caso.createdAt), "dd/MM/yyyy 'a las' HH:mm")}
          </p>
        </div>
        <p className="font-heading text-xl font-bold tabular-nums">{formatearMonto(pedido.total)}</p>
      </div>

      <div className="mt-4 space-y-1 border-t pt-4 text-sm">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{pedido.codigo}</span>
          <EtiquetaEstadoPedido estado={pedido.estado} />
        </p>
        <p className="text-muted-foreground">
          {pedido.comprador.nombre} {pedido.comprador.apellido} · DNI {pedido.comprador.dni} ·{" "}
          {pedido.comprador.telefono} · <span className="break-all">{pedido.comprador.email}</span>
        </p>
        {pedido.medioPago && (
          <p className="text-muted-foreground">Pagó con {ETIQUETAS_MEDIO_PAGO[pedido.medioPago]}</p>
        )}
      </div>

      <ul className="mt-4 space-y-1 border-t pt-4 text-sm">
        {pedido.items.map((item, indice) => (
          <li key={`${item.productoNombre}-${item.talle ?? ""}-${indice}`}>
            {item.cantidad} × {item.productoNombre}
            {item.talle && <span className="text-muted-foreground"> · talle {item.talle}</span>}
          </li>
        ))}
      </ul>

      {caso.estado !== "PENDIENTE" && (
        <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">
          {caso.resueltoEn && format(parseISO(caso.resueltoEn), "dd/MM/yyyy HH:mm")}
          {caso.resueltoPor && ` · ${caso.resueltoPor}`}
          {caso.nota && ` · ${caso.nota}`}
        </p>
      )}

      {caso.estado === "PENDIENTE" && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="ghost" size="sm" onClick={() => onDecidir("RECHAZADO")}>
            Rechazar
          </Button>
          <Button size="sm" onClick={() => onDecidir("ACEPTADO")}>
            Aceptar
          </Button>
        </div>
      )}
    </article>
  );
}

/** Pedidos de arrepentimiento: llegan del botón de la tienda y los resuelve el club. */
export function ArrepentimientosAdmin() {
  const [estado, setEstado] = useState<EstadoArrepentimiento | undefined>("PENDIENTE");
  const [pagina, setPagina] = useState(1);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [abierto, setAbierto] = useState(false);

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useArrepentimientos({
    page: pagina,
    pageSize: 20,
    estado,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Arrepentimientos</h1>
        <p className="text-sm text-muted-foreground">
          Quien se arrepiente de una compra tiene 10 días desde que la retiró. Revisá cada caso y
          resolvelo: el comprador recibe la respuesta por correo.
        </p>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-lg border p-1" role="group" aria-label="Qué mostrar">
        {VISTAS.map((vista) => (
          <button
            key={vista.etiqueta}
            type="button"
            aria-pressed={estado === vista.estado}
            onClick={() => {
              setEstado(vista.estado);
              setPagina(1);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              estado === vista.estado
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {vista.etiqueta}
            {vista.estado === "PENDIENTE" && data?.pendientes ? (
              <span className="ml-1.5 tabular-nums opacity-70">{data.pendientes}</span>
            ) : null}
          </button>
        ))}
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando los arrepentimientos…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          {estado === "PENDIENTE" ? "No hay pedidos de arrepentimiento pendientes." : "No hay trámites para mostrar."}
        </p>
      ) : (
        <>
          <div className={cn("space-y-4", isPlaceholderData && "opacity-60")}>
            {data.data.map((caso) => (
              <TarjetaCaso
                key={caso.id}
                caso={caso}
                onDecidir={(resultado) => {
                  setDecision({ caso, resultado });
                  setAbierto(true);
                }}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>
                <ChevronLeft aria-hidden />
                Más nuevos
              </Button>
              <span className="text-sm text-muted-foreground">
                {data.page} de {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagina >= data.totalPages}
                onClick={() => setPagina(pagina + 1)}
              >
                Más viejos
                <ChevronRight aria-hidden />
              </Button>
            </div>
          )}
        </>
      )}

      <DecisionDialog decision={decision} abierto={abierto} onClose={() => setAbierto(false)} />
    </div>
  );
}
