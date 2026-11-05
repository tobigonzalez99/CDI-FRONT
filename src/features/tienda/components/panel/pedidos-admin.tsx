"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { BadgePercent, ChevronLeft, ChevronRight, LoaderCircle, PackageCheck, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { EtiquetaEstadoPedido } from "@/features/tienda/components/detalle-pedido";
import { Campo, CLASES_TEXTAREA } from "@/features/tienda/components/panel/campo";
import { useCambiarEstadoPedido, usePedidosAdmin } from "@/features/tienda/hooks/use-tienda-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { cancelarPedidoSchema, type CancelarPedidoFormValues } from "@/lib/validators/tienda";
import { ETIQUETAS_ESTADO_PEDIDO, type EstadoPedido, type PedidoAdmin } from "@/types/tienda";

const VISTAS: { estado?: EstadoPedido; etiqueta: string }[] = [
  { etiqueta: "Todos" },
  { estado: "PENDIENTE_PAGO", etiqueta: "Reservados" },
  { estado: "PAGADO", etiqueta: "A preparar" },
  { estado: "PREPARADO", etiqueta: "Listos para retirar" },
  { estado: "RETIRADO", etiqueta: "Retirados" },
  { estado: "CANCELADO", etiqueta: "Cancelados" },
];

const nombreDe = (pedido: PedidoAdmin) => `${pedido.comprador.nombre} ${pedido.comprador.apellido}`;

/** Quién retira: el comprador, salvo que haya indicado a otra persona. */
function quienRetira(pedido: PedidoAdmin) {
  const { retiraOtraPersona, retiraOtraPersonaDni } = pedido.retiro;
  return retiraOtraPersona
    ? { nombre: retiraOtraPersona, dni: retiraOtraPersonaDni }
    : { nombre: nombreDe(pedido), dni: pedido.comprador.dni };
}

interface Paso {
  estado: EstadoPedido;
  boton: string;
  aviso: (pedido: PedidoAdmin) => string;
}

const RETIRAR: Paso = {
  estado: "RETIRADO",
  boton: "Marcar como retirado",
  aviso: (pedido) => {
    const { nombre, dni } = quienRetira(pedido);
    return `Pedí el DNI antes de entregarlo: lo retira ${nombre}${dni ? `, DNI ${dni}` : ""}.`;
  },
};

/**
 * Los pasos de cada estado, el principal al final. Un pedido pagado puede
 * entregarse en el momento, sin pasar por «listo»: quien paga en el mostrador
 * se lo lleva ahí mismo.
 */
const PASOS: Partial<Record<EstadoPedido, Paso[]>> = {
  PENDIENTE_PAGO: [
    {
      estado: "PAGADO",
      boton: "Marcar como pagado",
      aviso: (pedido) =>
        `Confirmá que cobraste ${formatearMonto(pedido.total)}. La reserva deja de vencer y al comprador le llega un correo.`,
    },
  ],
  PAGADO: [
    RETIRAR,
    {
      estado: "PREPARADO",
      boton: "Marcar como listo",
      aviso: (pedido) => `Le avisamos a ${pedido.comprador.email} que ya puede pasar a retirarlo.`,
    },
  ],
  PREPARADO: [RETIRAR],
};

type PasoElegido = { pedido: PedidoAdmin; paso: Paso };

function PasoDialog({
  elegido,
  abierto,
  onClose,
}: {
  elegido: PasoElegido | null;
  abierto: boolean;
  onClose: () => void;
}) {
  const { mutateAsync: cambiar, isPending } = useCambiarEstadoPedido();

  async function confirmar() {
    if (!elegido) return;
    const { pedido, paso } = elegido;
    try {
      await cambiar({ codigo: pedido.codigo, estado: paso.estado });
      toast.success(`${pedido.codigo}: ${ETIQUETAS_ESTADO_PEDIDO[paso.estado]}`);
    } catch (error) {
      toast.error("No pudimos cambiar el pedido", { description: mensajeDeError(error) });
    }
    onClose();
  }

  return (
    <Dialog open={abierto} onOpenChange={(sigue) => !sigue && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {elegido?.pedido.codigo} · {elegido?.paso.boton}
          </DialogTitle>
          <DialogDescription>{elegido?.paso.aviso(elegido.pedido)}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Volver
          </Button>
          <Button type="button" onClick={() => void confirmar()} disabled={isPending}>
            {isPending && <LoaderCircle className="animate-spin" aria-hidden />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelarDialog({
  pedido,
  abierto,
  onClose,
}: {
  pedido: PedidoAdmin | null;
  abierto: boolean;
  onClose: () => void;
}) {
  const id = useId();
  const { mutateAsync: cambiar } = useCambiarEstadoPedido();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelarPedidoFormValues>({
    resolver: zodResolver(cancelarPedidoSchema),
    defaultValues: { motivo: "" },
  });

  function cerrar() {
    reset();
    onClose();
  }

  const onSubmit: SubmitHandler<CancelarPedidoFormValues> = async ({ motivo }) => {
    if (!pedido) return;
    try {
      await cambiar({ codigo: pedido.codigo, estado: "CANCELADO", motivo });
      toast.success(`${pedido.codigo} cancelado`);
      cerrar();
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, ["motivo"])) {
        toast.error("No pudimos cancelar el pedido", { description: mensajeDeError(error) });
        cerrar();
      }
    }
  };

  const habiaPago = pedido?.estado === "PAGADO" || pedido?.estado === "PREPARADO";

  return (
    <Dialog open={abierto} onOpenChange={(sigue) => !sigue && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Cancelar {pedido?.codigo}</DialogTitle>
          <DialogDescription>
            El stock vuelve a la venta y al comprador le llega un correo con el motivo. No se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {habiaPago && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
              Este pedido ya está pagado: el panel no devuelve el dinero. El correo le indica al
              comprador que se acerque a la administración del club por{" "}
              {pedido && formatearMonto(pedido.total)}.
            </p>
          )}
          <Campo
            id={`${id}-motivo`}
            etiqueta="Motivo"
            ayuda="Lo ve el comprador."
            error={errors.motivo?.message}
          >
            <textarea
              id={`${id}-motivo`}
              rows={3}
              className={CLASES_TEXTAREA}
              aria-invalid={Boolean(errors.motivo)}
              {...register("motivo")}
            />
          </Campo>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={cerrar} disabled={isSubmitting}>
              Volver
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
              Cancelar pedido
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TarjetaPedido({
  pedido,
  onAvanzar,
  onCancelar,
}: {
  pedido: PedidoAdmin;
  onAvanzar: (paso: Paso) => void;
  onCancelar: () => void;
}) {
  const pasos = PASOS[pedido.estado] ?? [];
  const { retiro } = pedido;

  return (
    <article className="rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-lg font-bold">{pedido.codigo}</h2>
            <EtiquetaEstadoPedido estado={pedido.estado} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {nombreDe(pedido)}
            {pedido.esSocio && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-brand-red">
                <BadgePercent className="size-3.5" aria-hidden />
                socio
              </span>
            )}{" "}
            · {format(parseISO(pedido.createdAt), "dd/MM/yyyy 'a las' HH:mm")}
          </p>
          <p className="text-sm text-muted-foreground">
            DNI {pedido.comprador.dni} · {pedido.comprador.telefono} ·{" "}
            <span className="break-all">{pedido.comprador.email}</span>
          </p>
        </div>
        <p className="font-heading text-xl font-bold tabular-nums">{formatearMonto(pedido.total)}</p>
      </div>

      <ul className="mt-4 space-y-1 border-t pt-4 text-sm">
        {pedido.items.map((item, indice) => (
          <li key={`${item.productoNombre}-${item.talle ?? ""}-${indice}`} className="flex justify-between gap-3">
            <span>
              {item.cantidad} × {item.productoNombre}
              {item.talle && <span className="text-muted-foreground"> · talle {item.talle}</span>}
            </span>
            <span className="text-muted-foreground tabular-nums">{formatearMonto(item.subtotal)}</span>
          </li>
        ))}
        {pedido.descuentoMonto > 0 && (
          <li className="flex justify-between gap-3 text-brand-red">
            <span>Descuento de socio ({pedido.descuentoPorcentaje}%)</span>
            <span className="tabular-nums">− {formatearMonto(pedido.descuentoMonto)}</span>
          </li>
        )}
      </ul>

      {(retiro.retiraOtraPersona || pedido.notas || pedido.motivoCancelacion || pedido.venceEn) && (
        <div className="mt-4 space-y-1 border-t pt-4 text-sm text-muted-foreground">
          {retiro.retiraOtraPersona && (
            <p>
              Retira <span className="font-medium text-foreground">{retiro.retiraOtraPersona}</span>
              {retiro.retiraOtraPersonaDni && `, DNI ${retiro.retiraOtraPersonaDni}`}.
            </p>
          )}
          {pedido.notas && (
            <p>
              <span className="font-medium text-foreground">Notas: </span>
              {pedido.notas}
            </p>
          )}
          {pedido.estado === "PENDIENTE_PAGO" && pedido.venceEn && (
            <p>
              Reservado hasta el {format(parseISO(pedido.venceEn), "dd/MM 'a las' HH:mm")}. Si no se paga,
              se cancela solo.
            </p>
          )}
          {pedido.motivoCancelacion && (
            <p>
              <span className="font-medium text-foreground">Motivo: </span>
              {pedido.motivoCancelacion}
            </p>
          )}
        </div>
      )}

      <details className="mt-4 border-t pt-4 text-sm">
        <summary className="cursor-pointer text-muted-foreground">Historial</summary>
        <ol className="mt-2 space-y-1">
          {pedido.historial.map((item) => (
            <li key={`${item.estado}-${item.fecha}`} className="text-muted-foreground">
              {format(parseISO(item.fecha), "dd/MM/yyyy HH:mm")} ·{" "}
              <span className="text-foreground">{ETIQUETAS_ESTADO_PEDIDO[item.estado]}</span>
              {item.registradoPor && ` · ${item.registradoPor}`}
            </li>
          ))}
        </ol>
      </details>

      {pasos.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
          <Button variant="ghost" size="sm" onClick={onCancelar}>
            Cancelar pedido
          </Button>
          {pasos.map((paso, indice) => (
            <Button
              key={paso.estado}
              size="sm"
              variant={indice === pasos.length - 1 ? "default" : "outline"}
              onClick={() => onAvanzar(paso)}
            >
              {indice === pasos.length - 1 && <PackageCheck aria-hidden />}
              {paso.boton}
            </Button>
          ))}
        </div>
      )}
    </article>
  );
}

/** Pedidos de la tienda: del pago en el club a la entrega, con el DNI a mano. */
export function PedidosAdmin() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>();
  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState(1);
  // El pedido sigue cargado al cerrar: el diálogo lo muestra mientras se va.
  const [aAvanzar, setAAvanzar] = useState<PasoElegido | null>(null);
  const [aCancelar, setACancelar] = useState<PedidoAdmin | null>(null);
  const [dialogo, setDialogo] = useState<"paso" | "cancelar" | null>(null);
  const buscar = useDebounce(texto.trim());

  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidosAdmin({
    page: pagina,
    pageSize: 20,
    estado,
    buscar: buscar || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Cada cambio le llega por correo al comprador. Al entregar un pedido, pedí el DNI y marcalo
          como retirado.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border p-1" role="group" aria-label="Qué mostrar">
          {VISTAS.map((vista) => {
            const cantidad = vista.estado && data?.contadores?.[vista.estado];
            return (
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
                {cantidad ? <span className="ml-1.5 tabular-nums opacity-70">{cantidad}</span> : null}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Buscar pedidos"
            placeholder="Código, nombre o DNI"
            value={texto}
            onChange={(evento) => {
              setTexto(evento.target.value);
              setPagina(1);
            }}
            className="h-9 pl-9"
          />
        </div>
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando pedidos…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : data.data.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          {buscar ? "No encontramos pedidos con esa búsqueda." : "No hay pedidos para mostrar."}
        </p>
      ) : (
        <>
          <div className={cn("space-y-4", isPlaceholderData && "opacity-60")}>
            {data.data.map((pedido) => (
              <TarjetaPedido
                key={pedido.codigo}
                pedido={pedido}
                onAvanzar={(paso) => {
                  setAAvanzar({ pedido, paso });
                  setDialogo("paso");
                }}
                onCancelar={() => {
                  setACancelar(pedido);
                  setDialogo("cancelar");
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

      <PasoDialog elegido={aAvanzar} abierto={dialogo === "paso"} onClose={() => setDialogo(null)} />
      <CancelarDialog pedido={aCancelar} abierto={dialogo === "cancelar"} onClose={() => setDialogo(null)} />
    </div>
  );
}
