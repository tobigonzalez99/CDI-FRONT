"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, LoaderCircle, Undo2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Campo } from "@/features/tienda/components/panel/campo";
import { useSolicitarArrepentimiento } from "@/features/tienda/hooks/use-tienda";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import { arrepentimientoSchema, type ArrepentimientoFormValues } from "@/lib/validators/tienda";
import type { ArrepentimientoCreado } from "@/types/tienda";

/**
 * Botón de arrepentimiento (Res. 424/2020). Lo usa cualquiera, con o sin
 * cuenta: el código, el correo y el DNI juntos identifican la compra.
 */
export function FormularioArrepentimiento({ codigoInicial = "" }: { codigoInicial?: string }) {
  const id = useId();
  const { mutateAsync: solicitar } = useSolicitarArrepentimiento();
  const [creado, setCreado] = useState<ArrepentimientoCreado | null>(null);
  const [problema, setProblema] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ArrepentimientoFormValues>({
    resolver: zodResolver(arrepentimientoSchema),
    defaultValues: { codigo: codigoInicial, email: "", dni: "" },
  });

  const onSubmit: SubmitHandler<ArrepentimientoFormValues> = async (valores) => {
    setProblema(null);
    try {
      setCreado(await solicitar(valores));
    } catch (error) {
      if (esApiError(error) && error.status === 429) {
        setProblema("Hiciste varios intentos seguidos. Esperá un minuto y probá de nuevo.");
      } else if (!aplicarFieldErrors(error, setError, ["codigo", "email", "dni"])) {
        setProblema(mensajeDeError(error));
      }
    }
  };

  if (creado) {
    return (
      <div className="container mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
        <CircleCheck className="size-10 text-emerald-700" aria-hidden />
        <h1 className="font-heading text-3xl font-bold tracking-tight">Recibimos tu pedido</h1>
        <p className="text-sm text-muted-foreground">
          Tu código de trámite es{" "}
          <span className="font-heading text-base font-bold text-foreground">{creado.tramite}</span>, por la
          compra {creado.codigo}. Te lo mandamos también por correo, y el club te va a responder por ahí.
        </p>
        <Link href="/tienda" className={buttonVariants({ size: "lg" })}>
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-10 md:py-14">
      <Undo2 className="size-8 text-brand-red" aria-hidden />
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">Botón de arrepentimiento</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tenés 10 días corridos desde que retiraste tu compra para arrepentirte, sin dar motivo. Completá
        tus datos y te respondemos por correo con un código de trámite.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-4">
        <Campo id={`${id}-codigo`} etiqueta="Número de pedido" error={errors.codigo?.message}>
          <Input
            id={`${id}-codigo`}
            placeholder="Por ejemplo: T-0042"
            className="h-11 uppercase placeholder:normal-case"
            aria-invalid={Boolean(errors.codigo)}
            {...register("codigo")}
          />
        </Campo>
        <Campo id={`${id}-email`} etiqueta="Correo con el que compraste" error={errors.email?.message}>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            className="h-11"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Campo>
        <Campo id={`${id}-dni`} etiqueta="DNI" error={errors.dni?.message}>
          <Input
            id={`${id}-dni`}
            inputMode="numeric"
            className="h-11"
            aria-invalid={Boolean(errors.dni)}
            {...register("dni")}
          />
        </Campo>

        {problema && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {problema}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-2 h-12 text-base" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
          Arrepentirme de la compra
        </Button>
      </form>
    </div>
  );
}
