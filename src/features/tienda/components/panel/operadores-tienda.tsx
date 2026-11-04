"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Check, Copy, KeyRound, LoaderCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ConfirmarDialog } from "@/components/shared/confirmar-dialog";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { Campo } from "@/features/tienda/components/panel/campo";
import {
  useCambiarEstadoOperador,
  useCrearOperador,
  useOperadores,
  useResetearPasswordOperador,
} from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { operadorSchema, type OperadorFormValues } from "@/lib/validators/tienda";
import type { OperadorConPassword, OperadorTienda } from "@/types/tienda";

/**
 * La contraseña inicial se ve una sola vez. No se cierra tocando afuera: un
 * clic al pasar la perdería, y habría que generar otra.
 */
function PasswordOperadorDialog({
  resultado,
  onClose,
}: {
  resultado: OperadorConPassword | null;
  onClose: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!resultado) return;
    try {
      await navigator.clipboard.writeText(resultado.passwordInicial);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <Dialog open={Boolean(resultado)} onOpenChange={(abierto) => !abierto && onClose()} disablePointerDismissal>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-heading">Contraseña de {resultado?.operador.nombre}</DialogTitle>
          <DialogDescription>
            Entra con su DNI ({resultado?.operador.dni}) y esta contraseña. En el primer ingreso
            tiene que elegir una propia. No se puede volver a consultar: copiala ahora.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">Contraseña inicial</p>
          <p className="mt-1 font-mono text-xl font-bold break-all select-all">{resultado?.passwordInicial}</p>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={() => void copiar()}>
          {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copiado ? "Copiada" : "Copiar contraseña"}
        </Button>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Ya la copié, cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AltaOperador({ onCreado }: { onCreado: (resultado: OperadorConPassword) => void }) {
  const id = useId();
  const { mutateAsync: crear } = useCrearOperador();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OperadorFormValues>({
    resolver: zodResolver(operadorSchema),
    defaultValues: { dni: "", nombre: "", apellido: "" },
  });

  const onSubmit: SubmitHandler<OperadorFormValues> = async (valores) => {
    try {
      const resultado = await crear(valores);
      reset();
      onCreado(resultado);
    } catch (error) {
      if (esApiError(error) && error.code === "CONFLICT") {
        setError("dni", { message: "Ese DNI ya tiene un usuario (puede ser un socio)." });
        return;
      }
      if (!aplicarFieldErrors(error, setError, ["dni", "nombre", "apellido"])) {
        toast.error("No pudimos crear el usuario", { description: mensajeDeError(error) });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Nuevo usuario de la tienda</CardTitle>
        <CardDescription>
          Puede cargar productos, stock y fotos, y ver pedidos y ventas. No ve socios ni cuotas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-3">
          <Campo id={`${id}-dni`} etiqueta="DNI" error={errors.dni?.message}>
            <Input id={`${id}-dni`} inputMode="numeric" className="h-10" aria-invalid={Boolean(errors.dni)} {...register("dni")} />
          </Campo>
          <Campo id={`${id}-nombre`} etiqueta="Nombre" error={errors.nombre?.message}>
            <Input id={`${id}-nombre`} className="h-10 uppercase" aria-invalid={Boolean(errors.nombre)} {...register("nombre")} />
          </Campo>
          <Campo id={`${id}-apellido`} etiqueta="Apellido" error={errors.apellido?.message}>
            <Input id={`${id}-apellido`} className="h-10 uppercase" aria-invalid={Boolean(errors.apellido)} {...register("apellido")} />
          </Campo>
          <div className="flex justify-end sm:col-span-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden /> : <UserPlus aria-hidden />}
              Crear usuario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type Accion = { tipo: "estado" | "clave"; operador: OperadorTienda } | null;

/** Usuarios de la tienda (rol TIENDA). Solo los maneja el administrador. */
export function OperadoresTienda() {
  const [resultado, setResultado] = useState<OperadorConPassword | null>(null);
  const [accion, setAccion] = useState<Accion>(null);
  const { data, isPending, isError, error, refetch } = useOperadores();
  const cambiarEstado = useCambiarEstadoOperador();
  const resetear = useResetearPasswordOperador();

  async function confirmar() {
    if (!accion) return;
    const { operador } = accion;
    try {
      if (accion.tipo === "estado") {
        await cambiarEstado.mutateAsync({ id: operador.id, activo: !operador.activo });
        toast.success(operador.activo ? "Usuario desactivado: ya no puede entrar" : "Usuario activado");
      } else {
        setResultado(await resetear.mutateAsync(operador.id));
      }
      setAccion(null);
    } catch (problema) {
      toast.error("No pudimos hacer el cambio", { description: mensajeDeError(problema) });
    }
  }

  return (
    <RequireAuth roles={["ADMIN"]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Usuarios de la tienda</h1>
          <p className="text-sm text-muted-foreground">
            Quienes atienden la tienda. Entran con su DNI y ven solo el panel de la tienda.
          </p>
        </div>

        <AltaOperador onCreado={setResultado} />

        {isPending ? (
          <Cargando etiqueta="Cargando los usuarios…" />
        ) : isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay usuarios de la tienda.</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {data.map((operador) => (
              <li
                key={operador.id}
                className={cn("flex flex-wrap items-center gap-3 px-4 py-3", !operador.activo && "bg-muted/50")}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {operador.apellido}, {operador.nombre}
                    {!operador.activo && <span className="ml-2 text-xs font-normal text-muted-foreground">Desactivado</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    DNI {operador.dni} ·{" "}
                    {operador.mustChangePassword
                      ? "Todavía no eligió su contraseña"
                      : operador.lastLoginAt
                        ? `Último ingreso: ${format(parseISO(operador.lastLoginAt), "dd/MM/yyyy HH:mm")}`
                        : "Nunca entró"}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setAccion({ tipo: "clave", operador })}>
                  <KeyRound aria-hidden />
                  Nueva contraseña
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAccion({ tipo: "estado", operador })}
                >
                  {operador.activo ? "Desactivar" : "Activar"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <ConfirmarDialog
          open={Boolean(accion)}
          onOpenChange={(abierto) => !abierto && setAccion(null)}
          titulo={
            accion?.tipo === "clave"
              ? `¿Generar una contraseña nueva para ${accion.operador.nombre}?`
              : accion?.operador.activo
                ? `¿Desactivar a ${accion.operador.nombre}?`
                : `¿Activar a ${accion?.operador.nombre}?`
          }
          descripcion={
            accion?.tipo === "clave"
              ? "La que tiene deja de servir. Le vas a tener que pasar la nueva, y la cambia en su próximo ingreso."
              : accion?.operador.activo
                ? "Se le corta la sesión en el momento y no puede volver a entrar hasta que lo actives."
                : "Puede volver a entrar con su DNI y su contraseña."
          }
          textoConfirmar={
            accion?.tipo === "clave" ? "Generar contraseña" : accion?.operador.activo ? "Desactivar" : "Activar"
          }
          variante={accion?.tipo === "estado" && !accion.operador.activo ? "success" : "danger"}
          ejecutando={cambiarEstado.isPending || resetear.isPending}
          onConfirmar={() => void confirmar()}
        />

        <PasswordOperadorDialog resultado={resultado} onClose={() => setResultado(null)} />
      </div>
    </RequireAuth>
  );
}
