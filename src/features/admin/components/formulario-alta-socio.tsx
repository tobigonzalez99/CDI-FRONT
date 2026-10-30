"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format } from "date-fns";
import { CalendarCheck, CircleCheck, HandCoins, LoaderCircle, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { useCrearSocio, useTiposSocio } from "@/features/admin/hooks/use-socios";
import { useCuentasActivas } from "@/features/pagos/hooks/use-pagos";
import { PasswordInicialDialog } from "@/features/solicitudes/components/password-inicial-dialog";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { FOTO_ACCEPT, validarFoto } from "@/lib/validators/perfil";
import {
  altaManualSchema,
  MESES_COBRO,
  type AltaManualFormValues,
  type ModoAlta,
} from "@/lib/validators/socio";
import { cn } from "@/lib/utils";
import {
  cuentaParaMedio,
  ETIQUETAS_MEDIO_PAGO,
  MEDIOS_PAGO_MANUALES,
  type MedioPagoManual,
} from "@/types/pago";
import type { CreateSocioInput, CreateSocioResponse } from "@/types/socio";

/** Los campos que el backend puede devolver en `fieldErrors`. */
const CAMPOS = [
  "nombre",
  "apellido",
  "dni",
  "fechaNacimiento",
  "email",
  "telefono",
  "domicilio",
  "localidad",
  "tipoSocioId",
  "vigencia.desde",
  "vigencia.hasta",
  "pago.medioPago",
  "pago.meses",
] as const;

const CLASES_SELECT =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/**
 * Fechas en hora local y no con `toISOString()`: a la noche en Argentina
 * (UTC-3) `toISOString` ya da el día siguiente.
 */
const aFecha = (fecha: Date) => format(fecha, "yyyy-MM-dd");

function valoresIniciales(): AltaManualFormValues {
  const hoy = new Date();
  return {
    nombre: "",
    apellido: "",
    dni: "",
    fechaNacimiento: "",
    email: "",
    telefono: "",
    domicilio: "",
    localidad: "",
    tipoSocioId: "",
    modo: "",
    vigencia: { desde: aFecha(hoy), hasta: aFecha(addMonths(hoy, 1)) },
    pago: { medioPago: "EFECTIVO", meses: "1", comprobante: "" },
  };
}

function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
  className,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-ayuda`} className="text-xs text-muted-foreground">
            {ayuda}
          </p>
        )
      )}
    </div>
  );
}

/** Un título por grupo de campos: once campos de corrido abruman. */
function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 rounded-xl border p-4 sm:p-5">
      <legend className="px-1 font-heading text-base font-bold">{titulo}</legend>
      {children}
    </fieldset>
  );
}

const OPCIONES_MODO: {
  valor: ModoAlta;
  titulo: string;
  detalle: string;
  Icono: typeof CalendarCheck;
}[] = [
  {
    valor: "VENIA_PAGANDO",
    titulo: "Ya venía pagando",
    detalle: "Es socio desde antes. Cargás hasta cuándo tiene la cuota paga.",
    Icono: CalendarCheck,
  },
  {
    valor: "PAGA_AHORA",
    titulo: "Paga ahora en el club",
    detalle: "Se suma hoy y paga en la sede. Se registra el cobro junto con el alta.",
    Icono: HandCoins,
  },
];

/**
 * Alta manual de un socio desde el panel, para los dos casos que no pasan
 * por Mercado Pago: cargar el padrón que hoy está en papel, y sumar a quien
 * paga en la sede.
 *
 * Queda en la misma pantalla después de cada alta, con el formulario vacío:
 * cargar el padrón es cargar muchos seguidos, y volver al listado cada vez
 * sería un paso de más.
 */
export function FormularioAltaSocio() {
  const [foto, setFoto] = useState<File | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [claveInputFoto, setClaveInputFoto] = useState(0);
  const [resultado, setResultado] = useState<CreateSocioResponse | null>(null);
  const [ultimoCargado, setUltimoCargado] = useState<{
    socio: CreateSocioResponse["socio"];
    cobro: number | null;
  } | null>(null);
  /** El total que se mostró al confirmar, para repetirlo en el aviso final. */
  const [cobroEnviado, setCobroEnviado] = useState<number | null>(null);

  const ids = {
    nombre: useId(),
    apellido: useId(),
    dni: useId(),
    fechaNacimiento: useId(),
    email: useId(),
    telefono: useId(),
    domicilio: useId(),
    localidad: useId(),
    tipoSocioId: useId(),
    modo: useId(),
    desde: useId(),
    hasta: useId(),
    medio: useId(),
    meses: useId(),
    comprobante: useId(),
    foto: useId(),
  };

  const tipos = useTiposSocio(true);
  const cuentas = useCuentasActivas();
  const { mutateAsync: crear } = useCrearSocio();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AltaManualFormValues>({
    resolver: zodResolver(altaManualSchema),
    defaultValues: valoresIniciales(),
  });

  const [modo, tipoSocioId, meses, medio] = useWatch({
    control,
    name: ["modo", "tipoSocioId", "pago.meses", "pago.medioPago"],
  });

  const cuenta = cuentas.data
    ? cuentaParaMedio(cuentas.data, medio as MedioPagoManual)
    : undefined;

  const categoria = tipos.data?.find((tipo) => tipo.id === tipoSocioId);
  const cantidadMeses = Number(meses);
  const mesesValidos =
    Number.isInteger(cantidadMeses) &&
    cantidadMeses >= MESES_COBRO.min &&
    cantidadMeses <= MESES_COBRO.max;
  /**
   * Es el mismo cálculo que hace el backend —cuota de la categoría por
   * meses—, solo para que el admin vea cuánto cobrar antes de confirmar. El
   * monto no se envía: lo fija el backend.
   */
  const total =
    categoria?.montoCuota != null && mesesValidos ? categoria.montoCuota * cantidadMeses : null;

  function alElegirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) {
      setFoto(null);
      setErrorFoto(null);
      return;
    }
    const problema = validarFoto(archivo);
    setFoto(problema ? null : archivo);
    setErrorFoto(problema);
  }

  function quitarFoto() {
    setFoto(null);
    setErrorFoto(null);
    setClaveInputFoto((clave) => clave + 1);
  }

  const onSubmit: SubmitHandler<AltaManualFormValues> = async (valores) => {
    if (errorFoto) return;

    const { modo: modoElegido, vigencia, pago, ...datos } = valores;

    const medioElegido = pago.medioPago as MedioPagoManual;
    const cuentaDelCobro = cuentas.data && cuentaParaMedio(cuentas.data, medioElegido);
    if (modoElegido === "PAGA_AHORA" && !cuentaDelCobro) {
      setError("root", {
        type: "manual",
        message: "No encontramos la cuenta para este medio de pago. Avisanos: falta configurarla.",
      });
      return;
    }

    // Solo viaja el bloque del caso elegido: mandar las dos cosas le sumaría
    // al socio meses que no pagó, y el backend lo rechaza.
    const input: CreateSocioInput =
      modoElegido === "PAGA_AHORA" && cuentaDelCobro
        ? {
            ...datos,
            foto,
            pago: {
              cuentaId: cuentaDelCobro.id,
              medioPago: medioElegido,
              meses: Number(pago.meses),
              ...(pago.comprobante.trim() && { comprobante: pago.comprobante.trim() }),
            },
          }
        : { ...datos, foto, vigencia };

    try {
      const respuesta = await crear(input);
      setCobroEnviado(modoElegido === "PAGA_AHORA" ? total : null);
      setResultado(respuesta);
    } catch (error) {
      // Un conflicto trae el campo que choca y, además, un mensaje que dice
      // qué hacer (por ejemplo, que esa persona ya se postuló por la web).
      // Por eso el mensaje general se muestra siempre, no solo cuando no hay
      // campo donde pintarlo.
      aplicarFieldErrors(error, setError, [...CAMPOS]);
      setError("root", { type: "server", message: mensajeDeError(error) });
    }
  };

  /** Al cerrar el aviso de la contraseña, el formulario queda listo para el próximo. */
  function alCerrarContrasena() {
    if (resultado) setUltimoCargado({ socio: resultado.socio, cobro: cobroEnviado });
    setResultado(null);
    setCobroEnviado(null);
    reset(valoresIniciales());
    quitarFoto();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (tipos.isPending || cuentas.isPending) return <Cargando etiqueta="Cargando el formulario…" />;
  if (tipos.isError) {
    return <ErrorConsulta error={tipos.error} onReintentar={() => void tipos.refetch()} />;
  }
  if (cuentas.isError) {
    return <ErrorConsulta error={cuentas.error} onReintentar={() => void cuentas.refetch()} />;
  }

  return (
    <>
      {ultimoCargado && (
        <div
          role="status"
          className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-success/30 bg-success/10 p-4 text-sm"
        >
          <CircleCheck className="size-5 shrink-0 text-success" aria-hidden />
          <p className="min-w-0 flex-1">
            <span className="font-medium">
              {ultimoCargado.socio.nombre} {ultimoCargado.socio.apellido}
            </span>{" "}
            quedó cargado con el número de socio {ultimoCargado.socio.numeroSocio}
            {ultimoCargado.cobro !== null &&
              ` y se registró su cobro de ${formatearMonto(ultimoCargado.cobro)}`}
            . Ya podés cargar el siguiente.
          </p>
          <Link
            href="/admin/socios"
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            Ver el padrón
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
        {errors.root && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}

        <Grupo titulo="Datos personales">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id={ids.nombre} etiqueta="Nombre" error={errors.nombre?.message}>
              <Input
                id={ids.nombre}
                autoComplete="off"
                aria-invalid={Boolean(errors.nombre)}
                {...register("nombre")}
              />
            </Campo>

            <Campo id={ids.apellido} etiqueta="Apellido" error={errors.apellido?.message}>
              <Input
                id={ids.apellido}
                autoComplete="off"
                aria-invalid={Boolean(errors.apellido)}
                {...register("apellido")}
              />
            </Campo>

            <Campo
              id={ids.dni}
              etiqueta="DNI"
              error={errors.dni?.message}
              ayuda="Solo números, sin puntos. Es el usuario con el que va a entrar al sitio."
            >
              <Input
                id={ids.dni}
                inputMode="numeric"
                placeholder="12345678"
                autoComplete="off"
                aria-invalid={Boolean(errors.dni)}
                aria-describedby={errors.dni ? `${ids.dni}-error` : `${ids.dni}-ayuda`}
                {...register("dni")}
              />
            </Campo>

            <Campo
              id={ids.fechaNacimiento}
              etiqueta="Fecha de nacimiento"
              error={errors.fechaNacimiento?.message}
            >
              <Input
                id={ids.fechaNacimiento}
                type="date"
                max={aFecha(new Date())}
                aria-invalid={Boolean(errors.fechaNacimiento)}
                {...register("fechaNacimiento")}
              />
            </Campo>
          </div>
        </Grupo>

        <Grupo titulo="Contacto">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id={ids.email}
              etiqueta="Correo electrónico"
              error={errors.email?.message}
              ayuda="Ahí le van a llegar los avisos de la cuota."
            >
              <Input
                id={ids.email}
                type="email"
                autoComplete="off"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? `${ids.email}-error` : `${ids.email}-ayuda`}
                {...register("email")}
              />
            </Campo>

            <Campo id={ids.telefono} etiqueta="Teléfono" error={errors.telefono?.message}>
              <Input
                id={ids.telefono}
                type="tel"
                autoComplete="off"
                aria-invalid={Boolean(errors.telefono)}
                {...register("telefono")}
              />
            </Campo>

            <Campo id={ids.domicilio} etiqueta="Domicilio" error={errors.domicilio?.message}>
              <Input
                id={ids.domicilio}
                autoComplete="off"
                aria-invalid={Boolean(errors.domicilio)}
                {...register("domicilio")}
              />
            </Campo>

            <Campo id={ids.localidad} etiqueta="Localidad" error={errors.localidad?.message}>
              <Input
                id={ids.localidad}
                autoComplete="off"
                aria-invalid={Boolean(errors.localidad)}
                {...register("localidad")}
              />
            </Campo>
          </div>
        </Grupo>

        <Grupo titulo="Membresía">
          <Campo
            id={ids.tipoSocioId}
            etiqueta="Categoría"
            error={errors.tipoSocioId?.message}
          >
            <select
              id={ids.tipoSocioId}
              className={CLASES_SELECT}
              aria-invalid={Boolean(errors.tipoSocioId)}
              {...register("tipoSocioId")}
            >
              <option value="">Elegí una categoría</option>
              {tipos.data.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                  {tipo.montoCuota !== null && ` — ${formatearMonto(tipo.montoCuota)}`}
                </option>
              ))}
            </select>
          </Campo>

          <div
            role="radiogroup"
            aria-labelledby={ids.modo}
            aria-describedby={errors.modo ? `${ids.modo}-error` : undefined}
            className="grid gap-2"
          >
            <p id={ids.modo} className="text-sm font-medium">
              ¿Cómo se suma?
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPCIONES_MODO.map(({ valor, titulo, detalle, Icono }) => (
                <label
                  key={valor}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                    "has-[:checked]:border-primary has-[:checked]:bg-primary/5",
                    "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  )}
                >
                  <input
                    type="radio"
                    value={valor}
                    className="mt-1 accent-primary"
                    {...register("modo")}
                  />
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2 font-medium">
                      <Icono className="size-4" aria-hidden />
                      {titulo}
                    </span>
                    <span className="text-xs text-muted-foreground">{detalle}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.modo && (
              <p id={`${ids.modo}-error`} role="alert" className="text-sm text-destructive">
                {errors.modo.message}
              </p>
            )}
          </div>

          {modo === "VENIA_PAGANDO" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                id={ids.desde}
                etiqueta="Socio desde"
                error={errors.vigencia?.desde?.message}
              >
                <Input
                  id={ids.desde}
                  type="date"
                  aria-invalid={Boolean(errors.vigencia?.desde)}
                  {...register("vigencia.desde")}
                />
              </Campo>

              <Campo
                id={ids.hasta}
                etiqueta="Cuota paga hasta"
                error={errors.vigencia?.hasta?.message}
                ayuda="El último día que tiene la cuota al día, según lo que ya pagó."
              >
                <Input
                  id={ids.hasta}
                  type="date"
                  aria-invalid={Boolean(errors.vigencia?.hasta)}
                  aria-describedby={
                    errors.vigencia?.hasta ? `${ids.hasta}-error` : `${ids.hasta}-ayuda`
                  }
                  {...register("vigencia.hasta")}
                />
              </Campo>
            </div>
          )}

          {modo === "PAGA_AHORA" && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo
                  id={ids.medio}
                  etiqueta="Medio de pago"
                  error={errors.pago?.medioPago?.message}
                  ayuda={cuenta && `Entra en la cuenta «${cuenta.nombre}».`}
                >
                  <select
                    id={ids.medio}
                    className={CLASES_SELECT}
                    aria-invalid={Boolean(errors.pago?.medioPago)}
                    {...register("pago.medioPago")}
                  >
                    {MEDIOS_PAGO_MANUALES.map((medio) => (
                      <option key={medio} value={medio}>
                        {ETIQUETAS_MEDIO_PAGO[medio]}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo
                  id={ids.meses}
                  etiqueta="Meses que paga"
                  error={errors.pago?.meses?.message}
                  ayuda={`Entre ${MESES_COBRO.min} y ${MESES_COBRO.max}. La cuota queda al día desde hoy por esos meses.`}
                >
                  <Input
                    id={ids.meses}
                    type="number"
                    inputMode="numeric"
                    min={MESES_COBRO.min}
                    max={MESES_COBRO.max}
                    aria-invalid={Boolean(errors.pago?.meses)}
                    aria-describedby={
                      errors.pago?.meses ? `${ids.meses}-error` : `${ids.meses}-ayuda`
                    }
                    {...register("pago.meses")}
                  />
                </Campo>

                <Campo
                  id={ids.comprobante}
                  etiqueta="Comprobante (opcional)"
                  error={errors.pago?.comprobante?.message}
                >
                  <Input
                    id={ids.comprobante}
                    autoComplete="off"
                    placeholder="Ej: número de recibo"
                    aria-invalid={Boolean(errors.pago?.comprobante)}
                    {...register("pago.comprobante")}
                  />
                </Campo>
              </div>

              {/*
                El total se muestra grande porque es lo que hay que cobrarle en
                la mano. Si todavía falta la categoría, se dice qué falta en
                lugar de mostrar un número a medias.
              */}
              <div className="rounded-xl bg-muted/50 p-4" aria-live="polite">
                <p className="text-xs text-muted-foreground">Total a cobrar</p>
                {total !== null ? (
                  <p className="mt-1 font-heading text-2xl font-bold">
                    {formatearMonto(total)}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {cantidadMeses} {cantidadMeses === 1 ? "mes" : "meses"} ×{" "}
                      {formatearMonto(categoria!.montoCuota!)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {!categoria
                      ? "Elegí la categoría para ver el total."
                      : categoria.montoCuota === null
                        ? "Esta categoría no tiene una cuota cargada."
                        : "Indicá cuántos meses paga."}
                  </p>
                )}
              </div>
            </div>
          )}
        </Grupo>

        <Grupo titulo="Foto para el carnet">
          <Campo
            id={ids.foto}
            etiqueta="Foto (opcional)"
            error={errorFoto ?? undefined}
            ayuda="Si no la tenés a mano, el socio la sube después desde su perfil. JPG, PNG o WEBP, hasta 5 MB."
          >
            <Input
              id={ids.foto}
              key={claveInputFoto}
              type="file"
              accept={FOTO_ACCEPT}
              onChange={alElegirFoto}
              aria-invalid={Boolean(errorFoto)}
              aria-describedby={errorFoto ? `${ids.foto}-error` : `${ids.foto}-ayuda`}
            />
          </Campo>

          {foto && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleCheck className="size-3.5 text-success" aria-hidden />
              {foto.name}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={quitarFoto}
                aria-label="Quitar la foto elegida"
              >
                <X className="size-3" aria-hidden />
              </Button>
            </p>
          )}
        </Grupo>

        <Button type="submit" size="lg" className="h-12 text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <UserPlus className="size-4" aria-hidden />
          )}
          {isSubmitting
            ? "Cargando…"
            : modo === "PAGA_AHORA" && total !== null
              ? `Cargar socio y registrar ${formatearMonto(total)}`
              : "Cargar socio"}
        </Button>
      </form>

      <PasswordInicialDialog resultado={resultado} onClose={alCerrarContrasena} />
    </>
  );
}
