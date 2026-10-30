"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  SearchX,
  TriangleAlert,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ClubLogo } from "@/components/shared/club-logo";
import { useEstadoPago } from "@/features/mercadopago/hooks/use-estado-pago";
import { MI_PERFIL_QUERY_KEY, useMiPerfil } from "@/features/socios/hooks/use-mi-perfil";
import { esApiError, mensajeDeError } from "@/lib/api/errors";
import { formatearFecha } from "@/lib/formato";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { TipoPagoMp } from "@/types/mercadopago";

/** Segundos que se muestra el agradecimiento antes de volver al inicio. */
const SEGUNDOS_AGRADECIMIENTO = 10;

const CLASES_BOTON = cn(buttonVariants({ size: "lg" }), "h-11 w-full");
const CLASES_BOTON_SECUNDARIO = cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 w-full");

/** Marco común: un ícono, un título, un texto y las salidas. */
function Pantalla({
  icono,
  titulo,
  children,
  acciones,
}: {
  icono: React.ReactNode;
  titulo: string;
  children?: React.ReactNode;
  acciones?: React.ReactNode;
}) {
  return (
    <section
      className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8"
      role="status"
      aria-live="polite"
    >
      {icono}
      <h1 className="font-heading text-2xl font-bold text-balance">{titulo}</h1>
      {children && <div className="grid gap-2 text-muted-foreground">{children}</div>}
      {acciones && <div className="mt-2 grid w-full gap-2">{acciones}</div>}
    </section>
  );
}

/** A dónde vuelve la persona según qué pagó: el socio a su perfil, quien se asoció al inicio. */
function SalidaPrincipal({ tipo }: { tipo: TipoPagoMp }) {
  return tipo === "CUOTA" ? (
    <Link href="/perfil" className={CLASES_BOTON}>
      Ir a mi perfil
    </Link>
  ) : (
    <Link href="/" className={CLASES_BOTON}>
      Ir al inicio
    </Link>
  );
}

function Confirmando() {
  return (
    <Pantalla
      icono={<LoaderCircle className="size-12 animate-spin text-muted-foreground" aria-hidden />}
      titulo="Estamos confirmando tu pago"
    >
      <p>Mercado Pago nos está avisando cómo salió. Puede tardar unos segundos.</p>
    </Pantalla>
  );
}

function SeEstaProcesando({ tipo }: { tipo: TipoPagoMp }) {
  return (
    <Pantalla
      icono={<Clock className="size-12 text-amber-500" aria-hidden />}
      titulo="Tu pago se está procesando"
      acciones={<SalidaPrincipal tipo={tipo} />}
    >
      <p>
        No hace falta que pagues de nuevo: cuando se confirme te avisamos por correo.
      </p>
    </Pantalla>
  );
}

/** Cuota pagada: lo que importa es hasta cuándo quedó al día. */
function CuotaPagada() {
  const queryClient = useQueryClient();
  const perfil = useMiPerfil();

  // El perfil puede estar en caché de antes del pago, con la vigencia vieja.
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: MI_PERFIL_QUERY_KEY });
  }, [queryClient]);

  return (
    <Pantalla
      icono={<CircleCheck className="size-12 text-success" aria-hidden />}
      titulo="¡Listo, pagaste tu cuota!"
      acciones={<SalidaPrincipal tipo="CUOTA" />}
    >
      {perfil.data && !perfil.isFetching && (
        <p className="font-medium text-foreground">
          Quedás al día hasta el {formatearFecha(perfil.data.vigencia.hasta)}.
        </p>
      )}
      <p>Te mandamos por correo el detalle del pago.</p>
    </Pantalla>
  );
}

/**
 * El agradecimiento a quien se acaba de asociar. Vuelve solo al inicio a los
 * pocos segundos, con un botón para no esperar.
 */
function BienvenidaAlClub() {
  const router = useRouter();
  const [segundos, setSegundos] = useState(SEGUNDOS_AGRADECIMIENTO);

  useEffect(() => {
    if (segundos <= 0) {
      router.push("/");
      return;
    }
    const temporizador = setTimeout(() => setSegundos((actual) => actual - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [segundos, router]);

  return (
    <Pantalla
      icono={<ClubLogo className="h-24 w-auto" priority />}
      titulo={`¡Ya formás parte del ${siteConfig.name}!`}
      acciones={
        <Link href="/" className={CLASES_BOTON}>
          Ir al inicio ahora
        </Link>
      }
    >
      <p className="text-lg font-semibold text-foreground">¡Muchas gracias!</p>
      <p>
        Te mandamos un correo para que elijas tu contraseña y puedas entrar al sitio a
        ver tu carnet. Si no lo ves, revisá el correo no deseado.
      </p>
      {/* Sin aria-live: anunciar cada segundo sería ruido para un lector de pantalla. */}
      <p className="text-sm" aria-live="off">
        Te llevamos al inicio en {segundos} {segundos === 1 ? "segundo" : "segundos"}.
      </p>
    </Pantalla>
  );
}

function PagoRechazado({ tipo }: { tipo: TipoPagoMp }) {
  if (tipo === "CUOTA") {
    return (
      <Pantalla
        icono={<CircleX className="size-12 text-destructive" aria-hidden />}
        titulo="El pago no se aprobó"
        acciones={<SalidaPrincipal tipo="CUOTA" />}
      >
        <p>
          Tu cuota sigue igual que antes y no se te cobró nada. Podés volver a intentarlo
          con otro medio de pago.
        </p>
      </Pantalla>
    );
  }

  // En un alta rechazada no queda nada guardado: hay que completar todo de nuevo.
  return (
    <Pantalla
      icono={<CircleX className="size-12 text-destructive" aria-hidden />}
      titulo="El pago no se aprobó"
      acciones={
        <>
          <Link href="/socio" className={CLASES_BOTON}>
            Volver al formulario
          </Link>
          <Link href="/" className={CLASES_BOTON_SECUNDARIO}>
            Ir al inicio
          </Link>
        </>
      }
    >
      <p>
        No se te cobró nada y no guardamos ninguno de tus datos. Para asociarte, completá
        el formulario de nuevo y probá con otro medio de pago.
      </p>
    </Pantalla>
  );
}

/** Se cobró, pero la cuenta no se pudo crear: el club lo resuelve a mano. */
function EnRevision() {
  return (
    <Pantalla
      icono={<Clock className="size-12 text-amber-500" aria-hidden />}
      titulo="Recibimos tu pago"
      acciones={<SalidaPrincipal tipo="ALTA" />}
    >
      <p>
        El club tiene que revisar tu solicitud y te va a escribir a tu correo. No hace
        falta que pagues de nuevo.
      </p>
    </Pantalla>
  );
}

/**
 * Página a la que vuelve la persona desde Mercado Pago, tanto al pagar la
 * cuota como al asociarse.
 *
 * El resultado sale siempre del backend y nunca de los parámetros que
 * Mercado Pago agrega a la URL: esos cualquiera los puede escribir a mano.
 */
export function ResultadoPago({ referencia }: { referencia: string | null }) {
  const pago = useEstadoPago(referencia ?? "");

  if (!referencia) {
    return (
      <Pantalla
        icono={<SearchX className="size-12 text-muted-foreground" aria-hidden />}
        titulo="No hay ningún pago para mostrar"
        acciones={<SalidaPrincipal tipo="ALTA" />}
      >
        <p>Esta página se abre sola al volver de Mercado Pago.</p>
      </Pantalla>
    );
  }

  if (pago.isPending) return <Confirmando />;

  if (pago.isError) {
    if (esApiError(pago.error) && pago.error.code === "NOT_FOUND") {
      return (
        <Pantalla
          icono={<SearchX className="size-12 text-muted-foreground" aria-hidden />}
          titulo="No encontramos este pago"
          acciones={<SalidaPrincipal tipo="ALTA" />}
        >
          <p>Revisá que hayas llegado desde el enlace de Mercado Pago.</p>
        </Pantalla>
      );
    }

    return (
      <Pantalla
        icono={<TriangleAlert className="size-12 text-muted-foreground" aria-hidden />}
        titulo="No pudimos consultar tu pago"
        acciones={
          <Button type="button" size="lg" className="h-11 w-full" onClick={() => void pago.refetch()}>
            Reintentar
          </Button>
        }
      >
        <p>{mensajeDeError(pago.error)}</p>
        <p>Si ya pagaste, no lo hagas de nuevo: el pago no se pierde.</p>
      </Pantalla>
    );
  }

  const { estado, tipo } = pago.data;

  switch (estado) {
    case "PENDIENTE":
      return pago.agotado ? <SeEstaProcesando tipo={tipo} /> : <Confirmando />;
    case "APROBADO":
      return tipo === "CUOTA" ? <CuotaPagada /> : <BienvenidaAlClub />;
    case "RECHAZADO":
      return <PagoRechazado tipo={tipo} />;
    case "EN_REVISION":
      return <EnRevision />;
  }
}
