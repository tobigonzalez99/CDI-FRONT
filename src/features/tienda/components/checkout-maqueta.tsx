"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Lock, ShoppingBag, Store } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IlustracionProducto } from "@/features/tienda/components/ilustracion-producto";
import { useMaqueta } from "@/features/tienda/maqueta/maqueta-context";
import { RETIRO } from "@/features/tienda/maqueta/datos";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

const PASOS = ["Tus datos", "Retiro", "Revisión", "Pago"] as const;

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

function Resumen() {
  const { items, precioDe, subtotal, total, visitante } = useMaqueta();
  const ahorro = subtotal - total;

  return (
    <div className="rounded-2xl border p-5">
      <h2 className="font-heading text-lg font-bold">Tu pedido</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={`${item.producto.slug}-${item.talle ?? ""}`} className="flex items-center gap-3">
            <div className="relative">
              <IlustracionProducto ilustracion={item.producto.ilustraciones[0]} className="w-14 rounded-lg" />
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand-black text-[11px] font-bold text-white">
                {item.cantidad}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-medium">{item.producto.nombre}</p>
              {item.talle && <p className="text-xs text-muted-foreground">Talle {item.talle}</p>}
            </div>
            <p className="text-sm font-medium tabular-nums">
              {formatearMonto(precioDe(item.producto) * item.cantidad)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatearMonto(subtotal)}</dd>
        </div>
        {visitante === "socio" && ahorro > 0 && (
          <div className="flex justify-between text-brand-red">
            <dt>Descuento de socio</dt>
            <dd className="tabular-nums">− {formatearMonto(ahorro)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Retiro en el club</dt>
          <dd>Sin cargo</dd>
        </div>
        <div className="flex items-baseline justify-between border-t pt-3">
          <dt className="font-semibold">Total</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">{formatearMonto(total)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">Precio final, con impuestos incluidos.</p>
    </div>
  );
}

function Campo({ id, etiqueta, ...props }: { id: string; etiqueta: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Input id={id} className="h-11" {...props} />
    </div>
  );
}

/**
 * Compra en pasos cortos. En la real, cada paso se valida y la API calcula
 * el precio y reserva el stock al pasar al pago.
 */
export function CheckoutMaqueta() {
  const router = useRouter();
  const { items, visitante, total, vaciar } = useMaqueta();
  const [paso, setPaso] = useState(0);
  const [retiraOtro, setRetiraOtro] = useState(false);
  const [acepta, setAcepta] = useState(false);

  const socio = visitante === "socio";

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
        <h1 className="font-heading text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-sm text-muted-foreground">
          En la maqueta, agregá algún producto para recorrer la compra.
        </p>
        <Link href="/tienda/productos" className={buttonVariants({ size: "lg" })}>
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Finalizar compra</h1>
      <div className="mt-6 max-w-2xl">
        <Pasos actual={paso} />
        <p className="mt-2 text-sm font-semibold sm:hidden">
          Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border p-5 md:p-8">
          {paso === 0 && (
            // La clave rearma los campos al cambiar "Ver como" en la maqueta.
            <div key={visitante} className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Tus datos</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {socio
                    ? "Los tomamos de tu ficha de socio. Revisá que el correo esté bien: ahí te avisamos cuando tu pedido esté listo."
                    : "No hace falta crear una cuenta. Te mandamos por correo el enlace para seguir tu pedido."}
                </p>
              </div>
              {!socio && (
                <p className="rounded-lg bg-muted p-3 text-sm">
                  ¿Sos socio?{" "}
                  <span className="font-medium">Ingresá arriba y pagás con tu descuento.</span>
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo id="nombre" etiqueta="Nombre" defaultValue={socio ? "MARÍA" : ""} readOnly={socio} />
                <Campo id="apellido" etiqueta="Apellido" defaultValue={socio ? "GONZÁLEZ" : ""} readOnly={socio} />
                <Campo id="dni" etiqueta="DNI" inputMode="numeric" defaultValue={socio ? "30111222" : ""} readOnly={socio} />
                <Campo id="telefono" etiqueta="Teléfono" type="tel" defaultValue={socio ? "+54 2983 55-1001" : ""} />
                <div className="sm:col-span-2">
                  <Campo
                    id="email"
                    etiqueta="Correo electrónico"
                    type="email"
                    defaultValue={socio ? "maria.gonzalez@example.com" : ""}
                  />
                </div>
              </div>
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
                  <p className="font-semibold">{RETIRO.lugar} · sin cargo</p>
                  <p className="text-muted-foreground">{RETIRO.direccion}</p>
                  <p className="text-muted-foreground">{RETIRO.horarios}</p>
                  <p className="mt-2">Te avisamos por correo cuando tu pedido esté listo. Llevá tu DNI.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={retiraOtro}
                  onChange={(evento) => setRetiraOtro(evento.target.checked)}
                  className="size-4 accent-brand-red"
                />
                Lo retira otra persona
              </label>
              {retiraOtro && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo id="retira-nombre" etiqueta="Nombre y apellido de quien retira" />
                  <Campo id="retira-dni" etiqueta="Su DNI" inputMode="numeric" />
                </div>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-heading text-xl font-bold">Revisá tu pedido</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fijate que los talles y las cantidades estén bien antes de pagar.
                </p>
              </div>
              <dl className="grid gap-3 rounded-xl bg-muted p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Compra a nombre de</dt>
                  <dd className="font-medium">{socio ? "MARÍA GONZÁLEZ · Socio N° 1" : "Invitado"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Retiro</dt>
                  <dd className="font-medium">{retiraOtro ? "Otra persona, con su DNI" : "Vos, con tu DNI"}</dd>
                </div>
              </dl>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(evento) => setAcepta(evento.target.checked)}
                  className="mt-0.5 size-4 accent-brand-red"
                />
                <span>
                  Leí y acepto los <a href="#" className="font-medium underline">términos y condiciones</a> y la{" "}
                  <a href="#" className="font-medium underline">política de privacidad</a>.
                </span>
              </label>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-5 text-center">
              <Lock className="mx-auto size-10 text-brand-red" aria-hidden />
              <div>
                <h2 className="font-heading text-xl font-bold">Pagá con Mercado Pago</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Te llevamos a Mercado Pago para pagar {formatearMonto(total)} con tarjeta, débito o
                  dinero en cuenta. Guardamos tu pedido 30 minutos mientras pagás.
                </p>
              </div>
              <Button
                size="lg"
                className="h-12 w-full max-w-sm text-base"
                onClick={() => {
                  vaciar();
                  router.push("/tienda/pedido/T-0143?nuevo=1");
                }}
              >
                Pagar
              </Button>
              <p className="text-xs text-muted-foreground">En la maqueta no se cobra: te lleva al pedido.</p>
            </div>
          )}

          {paso < 3 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
              {paso > 0 ? (
                <Button variant="ghost" onClick={() => setPaso(paso - 1)}>
                  <ChevronLeft className="size-4" aria-hidden />
                  Volver
                </Button>
              ) : (
                <span />
              )}
              <Button
                size="lg"
                className="h-11 px-6"
                disabled={paso === 2 && !acepta}
                onClick={() => setPaso(paso + 1)}
              >
                {paso === 2 ? "Ir a pagar" : "Continuar"}
              </Button>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <Resumen />
        </aside>
      </div>
    </div>
  );
}
