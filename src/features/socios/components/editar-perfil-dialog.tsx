"use client";

import { useEffect, useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, LoaderCircle, Lock, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActualizarMiPerfil } from "@/features/socios/hooks/use-actualizar-perfil";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import {
  editarMiPerfilSchema,
  FOTO_ACCEPT,
  validarFoto,
  type EditarMiPerfilFormValues,
} from "@/lib/validators/perfil";
import type { Socio } from "@/types/socio";

const CAMPOS = ["telefono", "domicilio", "localidad"] as const;

interface EditarPerfilDialogProps {
  socio: Socio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarPerfilDialog({
  socio,
  open,
  onOpenChange,
}: EditarPerfilDialogProps) {
  /**
   * Archivo elegido junto a su object URL de vista previa. Van juntos para
   * poder liberar la URL anterior en cuanto se reemplaza: si no, cada foto
   * elegida dejaría un blob retenido en memoria.
   */
  const [fotoElegida, setFotoElegida] = useState<{ archivo: File; url: string } | null>(
    null,
  );
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  /** Cambiarla remonta el input y lo vacía, sin tener que tocar un ref. */
  const [claveInputFoto, setClaveInputFoto] = useState(0);

  const telefonoId = useId();
  const domicilioId = useId();
  const localidadId = useId();
  const fotoId = useId();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditarMiPerfilFormValues>({
    resolver: zodResolver(editarMiPerfilSchema),
    defaultValues: {
      telefono: socio.telefono,
      domicilio: socio.domicilio,
      localidad: socio.localidad,
    },
  });

  const { mutateAsync: actualizar } = useActualizarMiPerfil();

  // Al desmontar, libera la vista previa que haya quedado abierta.
  useEffect(() => {
    return () => {
      if (fotoElegida) URL.revokeObjectURL(fotoElegida.url);
    };
  }, [fotoElegida]);

  function limpiarFoto() {
    setFotoElegida((previa) => {
      if (previa) URL.revokeObjectURL(previa.url);
      return null;
    });
    setErrorFoto(null);
    setClaveInputFoto((clave) => clave + 1);
  }

  function alElegirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return limpiarFoto();

    const problema = validarFoto(archivo);
    if (problema) {
      setFotoElegida((previa) => {
        if (previa) URL.revokeObjectURL(previa.url);
        return null;
      });
      setErrorFoto(problema);
      return;
    }

    setErrorFoto(null);
    setFotoElegida((previa) => {
      if (previa) URL.revokeObjectURL(previa.url);
      return { archivo, url: URL.createObjectURL(archivo) };
    });
  }

  function cerrar(abierto: boolean) {
    if (!abierto) {
      reset({
        telefono: socio.telefono,
        domicilio: socio.domicilio,
        localidad: socio.localidad,
      });
      limpiarFoto();
    }
    onOpenChange(abierto);
  }

  const onSubmit: SubmitHandler<EditarMiPerfilFormValues> = async (valores) => {
    if (!isDirty && !fotoElegida) {
      toast.info("No hay cambios para guardar");
      return;
    }

    try {
      await actualizar({ ...valores, foto: fotoElegida?.archivo });
      toast.success("Tus datos quedaron actualizados");
      cerrar(false);
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        toast.error("No pudimos guardar los cambios", {
          description: mensajeDeError(error),
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Editar mis datos</DialogTitle>
          <DialogDescription>
            Podés actualizar tu teléfono, tu domicilio y tu foto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {/* Datos que identifican a la persona: los cambia la administración. */}
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              Estos datos los modifica la administración del club
            </p>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">DNI</dt>
                <dd className="text-sm font-medium">{socio.dni}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Correo electrónico</dt>
                <dd className="text-sm font-medium break-all">{socio.email}</dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={telefonoId}>Teléfono</Label>
            <Input
              id={telefonoId}
              autoComplete="tel"
              aria-invalid={Boolean(errors.telefono)}
              aria-describedby={errors.telefono ? `${telefonoId}-error` : undefined}
              {...register("telefono")}
            />
            {errors.telefono && (
              <p id={`${telefonoId}-error`} role="alert" className="text-sm text-destructive">
                {errors.telefono.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={domicilioId}>Domicilio</Label>
            <Input
              id={domicilioId}
              autoComplete="street-address"
              aria-invalid={Boolean(errors.domicilio)}
              aria-describedby={errors.domicilio ? `${domicilioId}-error` : undefined}
              {...register("domicilio")}
            />
            {errors.domicilio && (
              <p id={`${domicilioId}-error`} role="alert" className="text-sm text-destructive">
                {errors.domicilio.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={localidadId}>Localidad</Label>
            <Input
              id={localidadId}
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.localidad)}
              aria-describedby={errors.localidad ? `${localidadId}-error` : undefined}
              {...register("localidad")}
            />
            {errors.localidad && (
              <p id={`${localidadId}-error`} role="alert" className="text-sm text-destructive">
                {errors.localidad.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={fotoId}>Foto del carnet</Label>
            <Input
              id={fotoId}
              key={claveInputFoto}
              type="file"
              accept={FOTO_ACCEPT}
              onChange={alElegirFoto}
              aria-invalid={Boolean(errorFoto)}
              aria-describedby={errorFoto ? `${fotoId}-error` : `${fotoId}-ayuda`}
            />
            {errorFoto ? (
              <p id={`${fotoId}-error`} role="alert" className="text-sm text-destructive">
                {errorFoto}
              </p>
            ) : (
              <p id={`${fotoId}-ayuda`} className="text-xs text-muted-foreground">
                JPG, PNG o WEBP, hasta 5 MB. Si no elegís ninguna, se mantiene la actual.
              </p>
            )}

            {fotoElegida && (
              <div className="flex items-center gap-3 rounded-lg border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob), no optimizable */}
                <img
                  src={fotoElegida.url}
                  alt="Vista previa de la foto elegida"
                  className="size-14 rounded-md object-cover"
                />
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ImageUp className="size-3.5" aria-hidden />
                  Se reemplazará al guardar
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto"
                  onClick={limpiarFoto}
                  aria-label="Quitar la foto elegida"
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => cerrar(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {isSubmitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
