"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Clock, LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import {
  useEnviarSolicitud,
  useTiposDisponibles,
} from "@/features/solicitudes/hooks/use-solicitudes";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto } from "@/lib/formato";
import { FOTO_ACCEPT, validarFoto } from "@/lib/validators/perfil";
import { solicitudSchema, type SolicitudFormValues } from "@/lib/validators/solicitud";
import { cn } from "@/lib/utils";

const CAMPOS = [
  "nombre",
  "apellido",
  "dni",
  "email",
  "telefono",
  "domicilio",
  "localidad",
  "fechaNacimiento",
  "tipoSocioId",
  "comentario",
] as const;

const CLASES_SELECT =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/** Campo de texto con etiqueta y error, para no repetir el bloque diez veces. */
function Campo({
  id,
  etiqueta,
  error,
  children,
  className,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormularioSolicitud() {
  const [foto, setFoto] = useState<File | null>(null);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  const [claveInputFoto, setClaveInputFoto] = useState(0);
  const [enviada, setEnviada] = useState(false);
  /** Mensaje del 429: el backend dice cuándo se puede reintentar. */
  const [esperaPorLimite, setEsperaPorLimite] = useState<string | null>(null);

  const ids = {
    nombre: useId(),
    apellido: useId(),
    dni: useId(),
    email: useId(),
    telefono: useId(),
    domicilio: useId(),
    localidad: useId(),
    fechaNacimiento: useId(),
    tipoSocioId: useId(),
    comentario: useId(),
    foto: useId(),
  };

  const tipos = useTiposDisponibles();
  const { mutateAsync: enviar } = useEnviarSolicitud();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      domicilio: "",
      localidad: "",
      fechaNacimiento: "",
      tipoSocioId: "",
      comentario: "",
    },
  });

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

  const onSubmit: SubmitHandler<SolicitudFormValues> = async (valores) => {
    if (!foto) {
      setErrorFoto("Subí una foto para el carnet.");
      return;
    }

    try {
      await enviar({ ...valores, foto });
      reset();
      setFoto(null);
      setClaveInputFoto((clave) => clave + 1);
      setEsperaPorLimite(null);
      setEnviada(true);
    } catch (error) {
      if (esApiError(error) && error.code === "TOO_MANY_REQUESTS") {
        setEsperaPorLimite(error.message);
        return;
      }
      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        setEsperaPorLimite(null);
        setError("root", { type: "server", message: mensajeDeError(error) });
      }
    }
  };

  if (enviada) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
        <CircleCheck className="size-9 text-success" aria-hidden />
        <h3 className="font-heading text-lg font-bold">Recibimos tu solicitud</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          La administración del club la va a revisar. Cuando quede aprobada vas a
          recibir tus datos de acceso para entrar al sitio.
        </p>
        <Button type="button" variant="outline" onClick={() => setEnviada(false)}>
          Enviar otra solicitud
        </Button>
      </div>
    );
  }

  if (tipos.isPending) return <Cargando etiqueta="Cargando las categorías…" />;
  if (tipos.isError) {
    return <ErrorConsulta error={tipos.error} onReintentar={() => void tipos.refetch()} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
      {esperaPorLimite && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm"
        >
          <Clock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          {esperaPorLimite}
        </p>
      )}

      {errors.root && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id={ids.nombre} etiqueta="Nombre" error={errors.nombre?.message}>
          <Input
            id={ids.nombre}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.nombre)}
            {...register("nombre")}
          />
        </Campo>

        <Campo id={ids.apellido} etiqueta="Apellido" error={errors.apellido?.message}>
          <Input
            id={ids.apellido}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.apellido)}
            {...register("apellido")}
          />
        </Campo>

        <Campo id={ids.dni} etiqueta="DNI" error={errors.dni?.message}>
          <Input
            id={ids.dni}
            inputMode="numeric"
            placeholder="12345678"
            aria-invalid={Boolean(errors.dni)}
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
            max={new Date().toISOString().slice(0, 10)}
            aria-invalid={Boolean(errors.fechaNacimiento)}
            {...register("fechaNacimiento")}
          />
        </Campo>

        <Campo id={ids.email} etiqueta="Correo electrónico" error={errors.email?.message}>
          <Input
            id={ids.email}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Campo>

        <Campo id={ids.telefono} etiqueta="Teléfono" error={errors.telefono?.message}>
          <Input
            id={ids.telefono}
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.telefono)}
            {...register("telefono")}
          />
        </Campo>

        <Campo id={ids.domicilio} etiqueta="Domicilio" error={errors.domicilio?.message}>
          <Input
            id={ids.domicilio}
            autoComplete="street-address"
            aria-invalid={Boolean(errors.domicilio)}
            {...register("domicilio")}
          />
        </Campo>

        <Campo id={ids.localidad} etiqueta="Localidad" error={errors.localidad?.message}>
          <Input
            id={ids.localidad}
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.localidad)}
            {...register("localidad")}
          />
        </Campo>
      </div>

      <Campo
        id={ids.tipoSocioId}
        etiqueta="Categoría de socio"
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

      <Campo id={ids.foto} etiqueta="Foto para el carnet" error={errorFoto ?? undefined}>
        <Input
          id={ids.foto}
          key={claveInputFoto}
          type="file"
          accept={FOTO_ACCEPT}
          onChange={alElegirFoto}
          aria-invalid={Boolean(errorFoto)}
          aria-describedby={errorFoto ? `${ids.foto}-error` : `${ids.foto}-ayuda`}
        />
        {!errorFoto && (
          <p id={`${ids.foto}-ayuda`} className="text-xs text-muted-foreground">
            Obligatoria. JPG, PNG o WEBP, hasta 5 MB.
          </p>
        )}
        {foto && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleCheck className="size-3.5 text-success" aria-hidden />
            {foto.name}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setFoto(null);
                setClaveInputFoto((clave) => clave + 1);
              }}
              aria-label="Quitar la foto elegida"
            >
              <X className="size-3" aria-hidden />
            </Button>
          </p>
        )}
      </Campo>

      <Campo
        id={ids.comentario}
        etiqueta="Comentario (opcional)"
        error={errors.comentario?.message}
      >
        <textarea
          id={ids.comentario}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Contanos algo que quieras que sepamos"
          {...register("comentario")}
        />
      </Campo>

      <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  );
}
