"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, LoaderCircle, ShoppingBag, Store, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cargando } from "@/components/shared/estado-consulta";
import { useSession } from "@/features/auth/hooks/use-session";
import { obtenerMiPerfil } from "@/features/socios/api/perfil.api";
import { textoProblema } from "@/features/tienda/components/carrito-drawer";
import { FotoProducto } from "@/features/tienda/components/foto-producto";
import { EtiquetaPreventa, NotaPreventa } from "@/features/tienda/components/preventa";
import { Campo, CLASES_TEXTAREA } from "@/features/tienda/components/panel/campo";
import { useCarrito } from "@/features/tienda/carrito/carrito-context";
import { guardarTokenSeguimiento } from "@/features/tienda/lib/seguimiento";
import {
  useConfiguracionTienda,
  useCotizacion,
  useCrearPedido,
} from "@/features/tienda/hooks/use-tienda";
import { esApiError, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/tienda";
import type { Cotizacion } from "@/types/tienda";

const PASOS = ["Tus datos", "Retiro", "Revisión"] as const;

function Pasos({ actual }: { actual: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Pasos de la compra">
      {PASOS.map((paso, indice) => {
        const hecho = indice < actual;
        const activo = indice === actual;
        return (
          <li key={paso} className="flex flex-1 items-center gap-2" aria-current={activo ? "step" : undefined}>
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                hecho && "bg-brand-black text-white",
                activo && "bg-brand-red text-white",
                !hecho && !activo && "bg-muted text-muted-foreground",
              )}
            >
              {hecho ? <Check className="size-4" aria-hidden /> : indice + 1}
            </span>
            <span className={cn("hidden text-sm sm:inline", activo ? "font-semibold" : "text-muted-foreground")}>
              {paso}
            </span>
            {indice < PASOS.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

/** Lo que se compra, con los precios de la cotización: la API manda. */
function Resumen({ cotizacion, cargando }: { cotizacion: Cotizacion | undefined; cargando: boolean }) {
  return (
    <div className="rounded-2xl border p-5">
      <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
        Tu pedido
        {cargando && <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-label="Actualizando" />}
      </h2>

      {!cotizacion ? (
        <Cargando etiqueta="Calculando el total…" />
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {cotizacion.lineas.map((linea) => {
              const problema = textoProblema(linea);
              return (
                <li key={linea.varianteId} className="flex items-start gap-3">
                  <div className="relative">
                    <FotoProducto
                      imagen={linea.imagenUrl ? { id: linea.varianteId, url: linea.imagenUrl, ancho: 1, alto: 1 } : null}
                      alt=""
                      sizes="56px"
                      className="w-14 rounded-lg"
                    />
                    <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-black text-[11px] font-bold text-white">
                      {linea.cantidad}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">{linea.productoNombre}</p>
                    {linea.talle && <p className="text-xs text-muted-foreground">Talle {linea.talle}</p>}
                    {linea.preventa && <EtiquetaPreventa chica className="mt-1 inline-block" />}
                    {problema && (
                      <p className="mt-1 flex items-start gap-1 text-xs font-medium text-destructive">
                        <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                        {problema}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-medium tabular-nums">{formatearMonto(linea.subtotal)}</p>
                </li>
              );
            })}
          </ul>

          {cotizacion.lineas.some((linea) => linea.preventa) && <NotaPreventa className="mt-4" />}

          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatearMonto(cotizacion.subtotal)}</dd>
            </div>
            {cotizacion.descuentoMonto > 0 && (
              <div className="flex justify-between text-brand-red">
                <dt>Descuento de socio ({cotizacion.descuentoPorcentaje}%)</dt>
                <dd className="tabular-nums">− {formatearMonto(cotizacion.descuentoMonto)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Retiro en el club</dt>
              <dd>Sin cargo</dd>
            </div>
            <div className="flex items-baseline justify-between border-t pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-heading text-2xl font-bold tabular-nums">{formatearMonto(cotizacion.total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">Precio final, con impuestos incluidos.</p>
        </>
      )}
    </div>
  );
}

/**
 * Compra en tres pasos cortos. La API vuelve a cotizar al confirmar: si algo
 * cambió (precio, stock), no crea nada y se muestra qué pasó.
 *
 * Hasta que esté la pasarela, el pedido se reserva y se paga al retirarlo.
 */
export function Checkout() {
  const id = useId();
  const router = useRouter();
  const { items, itemsParaApi, vaciar, setAbierto } = useCarrito();
  const { user, isPending: cargandoSesion } = useSession();
  const { data: configuracion } = useConfiguracionTienda();
  const [paso, setPaso] = useState(0);

  const esSocio = user?.rol === "SOCIO";
  const { data: perfil } = useQuery({
    queryKey: ["socios", "mi-perfil"],
    queryFn: obtenerMiPerfil,
    enabled: esSocio,
  });

  const { data: cotizacion, isFetching, refetch } = useCotizacion(itemsParaApi);
  const { mutateAsync: confirmar } = useCrearPedido();

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    values: {
      esInvitado: !esSocio,
      comprador: { nombre: "", apellido: "", dni: "", email: "", telefono: "" },
      retiraOtro: false,
      retira: { nombre: "", dni: "" },
      notas: "",
      acepta: false,
    },
    resetOptions: { keepDirtyValues: true },
  });

  const retiraOtro = useWatch({ control, name: "retiraOtro" });
  const acepta = useWatch({ control, name: "acepta" });

  async function siguiente() {
    const campos =
      paso === 0
        ? (["comprador"] as const)
        : (["retira", "notas"] as const);
    if (await trigger(campos)) setPaso(paso + 1);
  }

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (valores) => {
    try {
      const { seguimientoToken } = await confirmar({
        items: itemsParaApi,
        comprador: valores.esInvitado ? valores.comprador : undefined,
        retira: valores.retiraOtro ? valores.retira : undefined,
        notas: valores.notas || undefined,
      });

      guardarTokenSeguimiento(seguimientoToken);
      vaciar();
      router.replace("/tienda/pedido?nuevo=1");
    } catch (error) {
      // Algo cambió desde la cotización: no se creó nada. Se vuelve a cotizar
      // para mostrar qué, y se lo manda a revisar el carrito.
      if (esApiError(error) && error.code === "CONFLICT") {
        await refetch();
        toast.error("Algo cambió mientras comprabas", {
          description: "Revisá lo marcado en rojo: puede que quede menos stock.",
        });
        return;
      }
      if (esApiError(error) && error.code === "TOO_MANY_REQUESTS") {
        toast.error("Demasiados intentos seguidos", { description: "Esperá un minuto y probá de nuevo." });
        return;
      }
      toast.error("No pudimos confirmar tu pedido", { description: mensajeDeError(error) });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="font-heading text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-sm text-muted-foreground">Agregá algún producto para seguir con la compra.</p>
        <Link href="/tienda/productos" className={buttonVariants({ size: "lg" })}>
          Ver productos
        </Link>
      </div>
    );
  }

  if (cargandoSesion) return <Cargando etiqueta="Preparando tu compra…" />;

  const invalida = cotizacion && !cotizacion.valida;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Finalizar compra</h1>
      <div className="mt-6 max-w-xl">
        <Pasos actual={paso} />
        <p className="mt-2 text-sm font-semibold sm:hidden">
          Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-2xl border p-5 md:p-8">
          {invalida && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Hay productos que cambiaron.</p>
                <p>
                  Ajustalos en el carrito para seguir.{" "}
                  <button type="button" className="font-semibold underline" onClick={() => setAbierto(true)}>
                    Abrir el carrito
                  </button>
                </p>
              </div>
            </div>
          )}

          {paso === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Tus datos</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {esSocio
                    ? "Compramos a tu nombre, con los datos de tu ficha de socio."
                    : "No hace falta crear una cuenta. Te mandamos el pedido por correo, con el enlace para seguirlo."}
                </p>
              </div>

              {esSocio ? (
                <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Nombre</dt>
                    <dd className="font-medium">
                      {user.nombre} {user.apellido}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">DNI</dt>
                    <dd className="font-medium">{user.dni}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Correo</dt>
                    <dd className="font-medium break-all">{perfil?.email ?? "…"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Teléfono</dt>
                    <dd className="font-medium">{perfil?.telefono ?? "…"}</dd>
                  </div>
                </dl>
              ) : (
                <>
                  {!user && (
                    <p className="rounded-lg bg-muted p-3 text-sm">
                      ¿Sos socio? <span className="font-medium">Ingresá arriba y pagás con tu descuento.</span>
                    </p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Campo id={`${id}-nombre`} etiqueta="Nombre" error={errors.comprador?.nombre?.message}>
                      <Input
                        id={`${id}-nombre`}
                        autoComplete="given-name"
                        className="h-11 uppercase"
                        aria-invalid={Boolean(errors.comprador?.nombre)}
                        {...register("comprador.nombre")}
                      />
                    </Campo>
                    <Campo id={`${id}-apellido`} etiqueta="Apellido" error={errors.comprador?.apellido?.message}>
                      <Input
                        id={`${id}-apellido`}
                        autoComplete="family-name"
                        className="h-11 uppercase"
                        aria-invalid={Boolean(errors.comprador?.apellido)}
                        {...register("comprador.apellido")}
                      />
                    </Campo>
                    <Campo
                      id={`${id}-dni`}
                      etiqueta="DNI"
                      ayuda="Te lo pedimos al retirar."
                      error={errors.comprador?.dni?.message}
                    >
                      <Input
                        id={`${id}-dni`}
                        inputMode="numeric"
                        className="h-11"
                        aria-invalid={Boolean(errors.comprador?.dni)}
                        {...register("comprador.dni")}
                      />
                    </Campo>
                    <Campo id={`${id}-telefono`} etiqueta="Teléfono" error={errors.comprador?.telefono?.message}>
                      <Input
                        id={`${id}-telefono`}
                        type="tel"
                        autoComplete="tel"
                        className="h-11"
                        aria-invalid={Boolean(errors.comprador?.telefono)}
                        {...register("comprador.telefono")}
                      />
                    </Campo>
                    <Campo
                      id={`${id}-email`}
                      etiqueta="Correo electrónico"
                      className="sm:col-span-2"
                      error={errors.comprador?.email?.message}
                    >
                      <Input
                        id={`${id}-email`}
                        type="email"
                        autoComplete="email"
                        className="h-11"
                        aria-invalid={Boolean(errors.comprador?.email)}
                        {...register("comprador.email")}
                      />
                    </Campo>
                  </div>
                </>
              )}
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Retiro</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Por ahora la tienda no hace envíos: retirás en el club.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border-2 border-brand-black p-4">
                <Store className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div className="text-sm">
                  {configuracion?.retiroLugar || configuracion?.retiroDireccion ? (
                    <>
                      <p className="font-semibold">{configuracion.retiroLugar || "En el club"} · sin cargo</p>
                      {configuracion.retiroDireccion && (
                        <p className="text-muted-foreground">{configuracion.retiroDireccion}</p>
                      )}
                      {configuracion.retiroHorarios && (
                        <p className="text-muted-foreground">{configuracion.retiroHorarios}</p>
                      )}
                    </>
                  ) : (
                    <p className="font-semibold">El club te va a avisar dónde y cuándo retirarlo.</p>
                  )}
                  <p className="mt-2">Lo pagás al retirarlo. Llevá el DNI de quien lo retira.</p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-brand-red" {...register("retiraOtro")} />
                Lo retira otra persona
              </label>
              {retiraOtro && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo id={`${id}-retira-nombre`} etiqueta="Nombre y apellido de quien retira" error={errors.retira?.nombre?.message}>
                    <Input
                      id={`${id}-retira-nombre`}
                      className="h-11"
                      aria-invalid={Boolean(errors.retira?.nombre)}
                      {...register("retira.nombre")}
                    />
                  </Campo>
                  <Campo id={`${id}-retira-dni`} etiqueta="Su DNI" error={errors.retira?.dni?.message}>
                    <Input
                      id={`${id}-retira-dni`}
                      inputMode="numeric"
                      className="h-11"
                      aria-invalid={Boolean(errors.retira?.dni)}
                      {...register("retira.dni")}
                    />
                  </Campo>
                </div>
              )}

              <Campo
                id={`${id}-notas`}
                etiqueta="Notas para el club"
                ayuda="Opcional. Hasta 300 caracteres."
                error={errors.notas?.message}
              >
                <textarea id={`${id}-notas`} rows={3} className={CLASES_TEXTAREA} {...register("notas")} />
              </Campo>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Revisá tu pedido</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fijate que los talles y las cantidades estén bien antes de confirmar.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                <Store className="mt-0.5 size-5 shrink-0" aria-hidden />
                <p>
                  <span className="font-semibold">Pagás al retirar en el club.</span> Al confirmar te
                  reservamos los productos y te mandamos por correo hasta cuándo.
                </p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-0.5 size-4 accent-brand-red" {...register("acepta")} />
                <span>
                  Leí y acepto los <a href="#" className="font-medium underline">términos y condiciones</a> y la{" "}
                  <a href="#" className="font-medium underline">política de privacidad</a>.
                </span>
              </label>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
            {paso > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setPaso(paso - 1)} disabled={isSubmitting}>
                <ChevronLeft className="size-4" aria-hidden />
                Volver
              </Button>
            ) : (
              <span />
            )}
            {paso < PASOS.length - 1 ? (
              <Button type="button" size="lg" className="h-11 px-6" onClick={() => void siguiente()}>
                Continuar
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="h-11 px-6"
                disabled={!acepta || isSubmitting || !cotizacion || invalida}
              >
                {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
                Confirmar pedido
              </Button>
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-24">
          <Resumen cotizacion={cotizacion} cargando={isFetching} />
        </aside>
      </div>
    </div>
  );
}
