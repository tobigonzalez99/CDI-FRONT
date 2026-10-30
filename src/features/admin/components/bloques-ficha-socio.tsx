"use client";

import { useId, useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, TriangleAlert, UserCheck, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BloqueEditable, Campo, Dato, descripcionDe } from "./bloque-editable";
import {
  useActualizarSocio,
  useReactivarSocio,
  useTiposSocio,
} from "@/features/admin/hooks/use-socios";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import { formatearFecha, formatearMonto, formatearVigencia } from "@/lib/formato";
import {
  construirMembresiaSchema,
  contactoSchema,
  datosPersonalesSchema,
  type ContactoFormValues,
  type DatosPersonalesFormValues,
  type MembresiaFormValues,
} from "@/lib/validators/socio";
import type { Socio, UpdateSocioInput } from "@/types/socio";

const CLASES_SELECT =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Guardado común a los tres bloques: manda al backend, avisa que salió bien
 * y, si algo falló, pinta el error en el campo que corresponde.
 *
 * El aviso de éxito es deliberado: quien usa el panel no es técnico y
 * necesita ver que pasó algo, no deducirlo de que el formulario se cerró.
 */
function useGuardarBloque<T extends FieldValues>(
  socioId: string,
  setError: UseFormSetError<T>,
  campos: ReadonlyArray<Path<T>>,
) {
  const { mutateAsync, isPending } = useActualizarSocio(socioId);

  async function guardar(
    cambios: Omit<UpdateSocioInput, "foto">,
    alTerminar: () => void,
  ) {
    // Sin cambios no hay nada que mandar, pero igual hay que decirlo: si el
    // bloque se cerrara en silencio parecería que se guardó algo.
    if (Object.keys(cambios).length === 0) {
      toast.info("No había cambios para guardar");
      alTerminar();
      return;
    }

    try {
      await mutateAsync(cambios);
      toast.success("Listo, se guardaron los cambios");
      alTerminar();
    } catch (error) {
      const enLosCampos = aplicarFieldErrors(error, setError, campos);

      // En un conflicto el campo dice qué choca, pero el mensaje general dice
      // qué hacer (por ejemplo, resolver la solicitud desde Solicitudes): ese
      // se muestra igual, aunque el error ya esté pintado en el campo.
      const esConflicto = esApiError(error) && error.code === "CONFLICT";

      if (!enLosCampos || esConflicto) {
        toast.error("No pudimos guardar los cambios", {
          description: mensajeDeError(error),
        });
      }
    }
  }

  return { guardar, guardando: isPending };
}

/** Manda solo lo que se tocó: el backend acepta un campo suelto. */
function soloCambiados<T extends Record<string, unknown>>(
  valores: T,
  sucios: Partial<Record<keyof T, unknown>>,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(valores).filter(([clave]) => Boolean(sucios[clave])),
  ) as Partial<T>;
}

/* ------------------------------------------------------------------ */

const CAMPOS_PERSONALES = ["nombre", "apellido", "dni", "fechaNacimiento"] as const;

export function BloqueDatosPersonales({ socio }: { socio: Socio }) {
  const [editando, setEditando] = useState(false);
  const nombreId = useId();
  const apellidoId = useId();
  const dniId = useId();
  const nacimientoId = useId();

  const valoresIniciales: DatosPersonalesFormValues = {
    nombre: socio.nombre,
    apellido: socio.apellido,
    dni: socio.dni,
    fechaNacimiento: socio.fechaNacimiento,
  };

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<DatosPersonalesFormValues>({
    resolver: zodResolver(datosPersonalesSchema),
    defaultValues: valoresIniciales,
  });

  const { guardar, guardando } = useGuardarBloque(socio.id, setError, [
    ...CAMPOS_PERSONALES,
  ]);

  function cancelar() {
    reset(valoresIniciales);
    setEditando(false);
  }

  return (
    <BloqueEditable
      titulo="Datos personales"
      editando={editando}
      guardando={guardando}
      onEditar={() => setEditando(true)}
      onCancelar={cancelar}
      onGuardar={handleSubmit((valores) =>
        guardar(soloCambiados(valores, dirtyFields), () => {
          reset(valores);
          setEditando(false);
        }),
      )}
      lectura={
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="Nombre" valor={socio.nombre} />
          <Dato etiqueta="Apellido" valor={socio.apellido} />
          <Dato etiqueta="DNI" valor={socio.dni} />
          <Dato
            etiqueta="Fecha de nacimiento"
            valor={formatearFecha(socio.fechaNacimiento)}
          />
        </dl>
      }
      edicion={
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id={nombreId} etiqueta="Nombre" error={errors.nombre?.message}>
              <Input
                id={nombreId}
                aria-invalid={Boolean(errors.nombre)}
                aria-describedby={descripcionDe(nombreId, Boolean(errors.nombre))}
                {...register("nombre")}
              />
            </Campo>

            <Campo id={apellidoId} etiqueta="Apellido" error={errors.apellido?.message}>
              <Input
                id={apellidoId}
                aria-invalid={Boolean(errors.apellido)}
                aria-describedby={descripcionDe(apellidoId, Boolean(errors.apellido))}
                {...register("apellido")}
              />
            </Campo>
          </div>

          <Campo
            id={dniId}
            etiqueta="DNI"
            error={errors.dni?.message}
            ayuda={
              <span className="flex items-start gap-1.5">
                <TriangleAlert className="mt-px size-3.5 shrink-0 text-brand-red" aria-hidden />
                El DNI es el usuario con el que el socio entra al sitio. Si lo cambiás,
                va a tener que ingresar con el nuevo.
              </span>
            }
          >
            <Input
              id={dniId}
              inputMode="numeric"
              aria-invalid={Boolean(errors.dni)}
              aria-describedby={descripcionDe(dniId, Boolean(errors.dni), true)}
              {...register("dni")}
            />
          </Campo>

          <Campo
            id={nacimientoId}
            etiqueta="Fecha de nacimiento"
            error={errors.fechaNacimiento?.message}
          >
            <Input
              id={nacimientoId}
              type="date"
              aria-invalid={Boolean(errors.fechaNacimiento)}
              aria-describedby={descripcionDe(
                nacimientoId,
                Boolean(errors.fechaNacimiento),
              )}
              {...register("fechaNacimiento")}
            />
          </Campo>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */

const CAMPOS_CONTACTO = ["email", "telefono", "domicilio", "localidad"] as const;

export function BloqueContacto({ socio }: { socio: Socio }) {
  const [editando, setEditando] = useState(false);
  const emailId = useId();
  const telefonoId = useId();
  const domicilioId = useId();
  const localidadId = useId();

  const valoresIniciales: ContactoFormValues = {
    email: socio.email,
    telefono: socio.telefono,
    domicilio: socio.domicilio,
    localidad: socio.localidad,
  };

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(contactoSchema),
    defaultValues: valoresIniciales,
  });

  const { guardar, guardando } = useGuardarBloque(socio.id, setError, [
    ...CAMPOS_CONTACTO,
  ]);

  function cancelar() {
    reset(valoresIniciales);
    setEditando(false);
  }

  return (
    <BloqueEditable
      titulo="Contacto"
      editando={editando}
      guardando={guardando}
      onEditar={() => setEditando(true)}
      onCancelar={cancelar}
      onGuardar={handleSubmit((valores) =>
        guardar(soloCambiados(valores, dirtyFields), () => {
          reset(valores);
          setEditando(false);
        }),
      )}
      lectura={
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato etiqueta="Correo electrónico" valor={socio.email} />
          <Dato etiqueta="Teléfono" valor={socio.telefono} />
          <Dato etiqueta="Domicilio" valor={socio.domicilio} />
          <Dato etiqueta="Localidad" valor={socio.localidad} />
        </dl>
      }
      edicion={
        <>
          <Campo
            id={emailId}
            etiqueta="Correo electrónico"
            error={errors.email?.message}
            ayuda="Es el correo por el que el club se comunica con el socio."
          >
            <Input
              id={emailId}
              type="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={descripcionDe(emailId, Boolean(errors.email), true)}
              {...register("email")}
            />
          </Campo>

          <Campo id={telefonoId} etiqueta="Teléfono" error={errors.telefono?.message}>
            <Input
              id={telefonoId}
              type="tel"
              aria-invalid={Boolean(errors.telefono)}
              aria-describedby={descripcionDe(telefonoId, Boolean(errors.telefono))}
              {...register("telefono")}
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id={domicilioId}
              etiqueta="Domicilio"
              error={errors.domicilio?.message}
            >
              <Input
                id={domicilioId}
                aria-invalid={Boolean(errors.domicilio)}
                aria-describedby={descripcionDe(domicilioId, Boolean(errors.domicilio))}
                {...register("domicilio")}
              />
            </Campo>

            <Campo
              id={localidadId}
              etiqueta="Localidad"
              error={errors.localidad?.message}
            >
              <Input
                id={localidadId}
                aria-invalid={Boolean(errors.localidad)}
                aria-describedby={descripcionDe(localidadId, Boolean(errors.localidad))}
                {...register("localidad")}
              />
            </Campo>
          </div>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */

const CAMPOS_MEMBRESIA = ["tipoSocioId", "vigencia.hasta"] as const;

/**
 * De la vigencia solo se edita el vencimiento.
 *
 * Es el único extremo que se corrige en la práctica: cuando se anula un
 * cobro, la fecha hasta la que el socio estaba al día queda adelantada y hay
 * que retrocederla a mano. El inicio se muestra pero no se toca, así que no
 * hay manera de dejar la vigencia dada vuelta por accidente.
 */
export function BloqueMembresia({ socio }: { socio: Socio }) {
  const [editando, setEditando] = useState(false);
  const categoriaId = useId();
  const vencimientoId = useId();

  const { data: tipos, isPending: cargandoTipos } = useTiposSocio();

  const valoresIniciales: MembresiaFormValues = {
    tipoSocioId: socio.tipoSocio.id,
    vigencia: { hasta: socio.vigencia.hasta },
  };

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<MembresiaFormValues>({
    resolver: zodResolver(construirMembresiaSchema(socio.vigencia.desde)),
    defaultValues: valoresIniciales,
  });

  const { guardar, guardando } = useGuardarBloque(socio.id, setError, [
    ...CAMPOS_MEMBRESIA,
  ]);

  function cancelar() {
    reset(valoresIniciales);
    setEditando(false);
  }

  const cuota = socio.tipoSocio.montoCuota;

  return (
    <BloqueEditable
      titulo="Membresía"
      editando={editando}
      guardando={guardando}
      onEditar={() => setEditando(true)}
      onCancelar={cancelar}
      onGuardar={handleSubmit((valores) =>
        guardar(
          {
            ...(dirtyFields.tipoSocioId ? { tipoSocioId: valores.tipoSocioId } : {}),
            ...(dirtyFields.vigencia?.hasta
              ? { vigencia: { hasta: valores.vigencia.hasta } }
              : {}),
          },
          () => {
            reset(valores);
            setEditando(false);
          },
        ),
      )}
      lectura={
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato
            etiqueta="Categoría"
            valor={
              cuota === null
                ? socio.tipoSocio.nombre
                : `${socio.tipoSocio.nombre} · ${formatearMonto(cuota)}`
            }
          />
          <Dato
            etiqueta="Vigencia"
            valor={formatearVigencia(socio.vigencia.desde, socio.vigencia.hasta)}
          />
        </dl>
      }
      edicion={
        <>
          <Campo
            id={categoriaId}
            etiqueta="Categoría"
            error={errors.tipoSocioId?.message}
          >
            <select
              id={categoriaId}
              className={CLASES_SELECT}
              disabled={cargandoTipos}
              aria-invalid={Boolean(errors.tipoSocioId)}
              aria-describedby={descripcionDe(categoriaId, Boolean(errors.tipoSocioId))}
              {...register("tipoSocioId")}
            >
              {/* Mientras cargan las categorías, al menos se ve la actual. */}
              {tipos ? (
                tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                    {tipo.montoCuota !== null && ` · ${formatearMonto(tipo.montoCuota)}`}
                  </option>
                ))
              ) : (
                <option value={socio.tipoSocio.id}>{socio.tipoSocio.nombre}</option>
              )}
            </select>
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-0.5">
              <Label className="text-sm">Al día desde</Label>
              <p className="pt-2 text-sm text-muted-foreground">
                {formatearFecha(socio.vigencia.desde)}
              </p>
            </div>

            <Campo
              id={vencimientoId}
              etiqueta="Al día hasta"
              error={errors.vigencia?.hasta?.message}
              ayuda="Si anulaste un cobro, corregí acá hasta cuándo quedó cubierto."
            >
              <Input
                id={vencimientoId}
                type="date"
                min={socio.vigencia.desde}
                aria-invalid={Boolean(errors.vigencia?.hasta)}
                aria-describedby={descripcionDe(
                  vencimientoId,
                  Boolean(errors.vigencia?.hasta),
                  true,
                )}
                {...register("vigencia.hasta")}
              />
            </Campo>
          </div>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */

/**
 * Aviso de que el socio está dado de baja, con la vuelta atrás a mano.
 *
 * Va arriba de todo en la ficha porque cambia cómo se lee el resto: los datos
 * siguen ahí, pero la persona no puede entrar al sitio hasta que se la
 * reactive.
 */
export function AvisoSocioDeBaja({ socio }: { socio: Socio }) {
  const [confirmando, setConfirmando] = useState(false);
  const { mutateAsync: reactivar, isPending } = useReactivarSocio();

  if (socio.estado !== "BAJA") return null;

  async function confirmarReactivacion() {
    try {
      await reactivar(socio.id);
      setConfirmando(false);
      toast.success(`${socio.nombre} vuelve a ser socio activo`, {
        description: "Ya puede iniciar sesión de nuevo.",
      });
    } catch (error) {
      toast.error("No pudimos reactivar al socio", {
        description: mensajeDeError(error),
      });
    }
  }

  return (
    <>
      <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-4">
        <p className="flex items-center gap-2 text-sm font-medium">
          <UserMinus className="size-4 shrink-0 text-destructive" aria-hidden />
          Este socio está dado de baja
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sus datos y su historial de pagos se conservan, pero no puede iniciar
          sesión hasta que lo reactives.
        </p>

        <Button
          type="button"
          variant="success"
          size="lg"
          className="mt-3"
          onClick={() => setConfirmando(true)}
          disabled={isPending}
        >
          {isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <UserCheck aria-hidden />
          )}
          Reactivar socio
        </Button>
      </div>

      <ConfirmarDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        variante="success"
        titulo="¿Reactivar al socio?"
        descripcion={`${socio.nombre} ${socio.apellido} vuelve a ser socio activo, con su misma ficha y su misma vigencia, y puede volver a iniciar sesión.`}
        textoConfirmar="Reactivar"
        ejecutando={isPending}
        onConfirmar={() => void confirmarReactivacion()}
      />
    </>
  );
}
