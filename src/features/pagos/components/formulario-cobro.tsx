"use client";

import { useId, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Receipt } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { SelectorSocio } from "@/features/pagos/components/selector-socio";
import { useCuentasActivas } from "@/features/pagos/hooks/use-pagos";
import { useRegistrarPago } from "@/features/pagos/hooks/use-pago-mutations";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import { formatearMonto, formatearVigencia } from "@/lib/formato";
import { cobroSchema, type CobroFormValues } from "@/lib/validators/pago";
import { cuentaParaMedio, ETIQUETAS_MEDIO_PAGO, MEDIOS_PAGO_MANUALES } from "@/types/pago";
import type { Socio } from "@/types/socio";

const CAMPOS = [
  "socioId",
  "monto",
  "medioPago",
  "fechaPago",
  "meses",
  "comprobante",
  "observaciones",
] as const;

const CLASES_SELECT =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function FormularioCobro() {
  const [socio, setSocio] = useState<Socio | null>(null);
  const cuentas = useCuentasActivas();
  const { mutateAsync: registrar } = useRegistrarPago();

  const ids = {
    monto: useId(),
    medio: useId(),
    fecha: useId(),
    meses: useId(),
    comprobante: useId(),
    observaciones: useId(),
  };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CobroFormValues>({
    resolver: zodResolver(cobroSchema),
    defaultValues: {
      socioId: "",
      monto: undefined,
      medioPago: "EFECTIVO",
      fechaPago: "",
      meses: 1,
      comprobante: "",
      observaciones: "",
    },
  });

  function elegirSocio(elegido: Socio | null) {
    setSocio(elegido);
    setValue("socioId", elegido?.id ?? "", { shouldValidate: Boolean(elegido) });
    // La cuota de su categoría es el monto esperado: se precarga como sugerencia.
    if (elegido?.tipoSocio.montoCuota != null) {
      setValue("monto", elegido.tipoSocio.montoCuota);
    }
  }

  const medio = useWatch({ control, name: "medioPago" });
  const cuenta = cuentas.data ? cuentaParaMedio(cuentas.data, medio) : undefined;

  const onSubmit: SubmitHandler<CobroFormValues> = async (valores) => {
    const cuentaDelCobro = cuentas.data && cuentaParaMedio(cuentas.data, valores.medioPago);
    if (!cuentaDelCobro) {
      toast.error("No encontramos la cuenta para este medio de pago", {
        description: "Avisanos: falta configurar la cuenta del club.",
      });
      return;
    }

    try {
      const pago = await registrar({
        socioId: valores.socioId,
        cuentaId: cuentaDelCobro.id,
        monto: valores.monto,
        medioPago: valores.medioPago,
        meses: valores.meses,
        fechaPago: valores.fechaPago || undefined,
        comprobante: valores.comprobante || undefined,
        observaciones: valores.observaciones || undefined,
      });

      toast.success("Cobro registrado", {
        description: `${formatearMonto(pago.monto)} · cubre del ${formatearVigencia(pago.periodo.desde, pago.periodo.hasta)}`,
      });

      reset();
      setSocio(null);
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        toast.error("No pudimos registrar el cobro", {
          description: mensajeDeError(error),
        });
      }
    }
  };

  if (cuentas.isPending) return <Cargando etiqueta="Cargando las cuentas…" />;
  if (cuentas.isError) {
    return <ErrorConsulta error={cuentas.error} onReintentar={() => void cuentas.refetch()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Registrar un cobro</CardTitle>
        <CardDescription>
          Al registrarlo se extiende la vigencia del socio en la misma operación.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
          <SelectorSocio
            socio={socio}
            onSeleccionar={elegirSocio}
            error={errors.socioId?.message}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={ids.medio}>Medio de pago</Label>
              <select
                id={ids.medio}
                className={CLASES_SELECT}
                aria-invalid={Boolean(errors.medioPago)}
                {...register("medioPago")}
              >
                {MEDIOS_PAGO_MANUALES.map((medio) => (
                  <option key={medio} value={medio}>
                    {ETIQUETAS_MEDIO_PAGO[medio]}
                  </option>
                ))}
              </select>
              {errors.medioPago ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.medioPago.message}
                </p>
              ) : (
                // La cuenta no se elige: sale del medio. Se muestra igual para
                // que quede claro adónde va el dinero.
                cuenta && (
                  <p className="text-xs text-muted-foreground">
                    Entra en la cuenta «{cuenta.nombre}».
                  </p>
                )
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={ids.monto}>Monto</Label>
              <Input
                id={ids.monto}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                aria-invalid={Boolean(errors.monto)}
                {...register("monto")}
              />
              {errors.monto && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.monto.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={ids.meses}>Meses que cubre</Label>
              <Input
                id={ids.meses}
                type="number"
                min="1"
                max="24"
                aria-invalid={Boolean(errors.meses)}
                {...register("meses")}
              />
              {errors.meses && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.meses.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={ids.fecha}>Fecha del cobro</Label>
              <Input
                id={ids.fecha}
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                aria-invalid={Boolean(errors.fechaPago)}
                {...register("fechaPago")}
              />
              {errors.fechaPago ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.fechaPago.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Si la dejás vacía se toma hoy.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={ids.comprobante}>Comprobante (opcional)</Label>
              <Input
                id={ids.comprobante}
                placeholder="N° de recibo o transferencia"
                aria-invalid={Boolean(errors.comprobante)}
                {...register("comprobante")}
              />
              {errors.comprobante && (
                <p role="alert" className="text-sm text-destructive">
                  {errors.comprobante.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={ids.observaciones}>Observaciones (opcional)</Label>
            <textarea
              id={ids.observaciones}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("observaciones")}
            />
            {errors.observaciones && (
              <p role="alert" className="text-sm text-destructive">
                {errors.observaciones.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Receipt className="size-4" aria-hidden />
            )}
            {isSubmitting ? "Registrando…" : "Registrar cobro"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
