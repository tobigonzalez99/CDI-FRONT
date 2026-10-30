"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock, KeyRound, LoaderCircle, MailCheck } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePedirRecuperacion } from "@/features/auth/hooks/use-auth-mutations";
import { esApiError, mensajeDeError } from "@/lib/api/errors";
import { siteConfig, whatsappUrl } from "@/lib/site-config";

const recuperarSchema = z.object({
  email: z.string().trim().email("Ingresá un correo electrónico válido"),
});

type RecuperarFormValues = z.infer<typeof recuperarSchema>;

const telefonoSocios = siteConfig.contacto.telefonos[0];

function VolverAlLogin() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Volver al inicio de sesión
    </Link>
  );
}

/**
 * Para quien no puede usar el correo (lo perdió, lo escribió mal al
 * asociarse): la administración le genera una clave nueva a mano.
 */
function SinAccesoAlCorreo() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      ¿No tenés acceso a ese correo?{" "}
      <a
        href={whatsappUrl(
          telefonoSocios.tel,
          "Hola, olvidé mi contraseña del sitio del club y no tengo acceso a mi correo.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline underline-offset-4 hover:no-underline"
      >
        Escribinos por WhatsApp
      </a>
      .
    </p>
  );
}

/**
 * "Olvidé mi contraseña": manda un enlace por correo para elegir una nueva.
 *
 * Después de enviar se muestra siempre lo mismo, sea o no el correo de un
 * socio. Es a propósito: si el mensaje cambiara, este formulario serviría
 * para averiguar quién es socio del club con solo probar correos.
 */
export function RecuperarPasswordForm() {
  const emailId = useId();
  const [enviado, setEnviado] = useState(false);
  const { mutateAsync: pedir } = usePedirRecuperacion();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarFormValues>({
    resolver: zodResolver(recuperarSchema),
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<RecuperarFormValues> = async (valores) => {
    try {
      await pedir(valores);
      setEnviado(true);
    } catch (error) {
      setError("root", {
        type: esApiError(error) && error.code === "TOO_MANY_REQUESTS" ? "limite" : "server",
        message: mensajeDeError(error),
      });
    }
  };

  if (enviado) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <MailCheck className="size-8 text-success" aria-hidden />
          <CardTitle className="font-heading text-xl">Revisá tu correo</CardTitle>
          <CardDescription>
            Si ese correo es de un socio, te mandamos un enlace para elegir una nueva
            contraseña. Revisá también el correo no deseado.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <p className="rounded-lg bg-muted/50 p-3 text-center text-sm text-muted-foreground">
            El enlace sirve durante una hora. Si se te vence, pedí otro.
          </p>
          <Button type="button" variant="outline" onClick={() => setEnviado(false)}>
            Pedir otro enlace
          </Button>
          <SinAccesoAlCorreo />
          <VolverAlLogin />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <KeyRound className="size-8 text-brand-red" aria-hidden />
        <CardTitle className="font-heading text-xl">¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>
          Escribí el correo con el que te asociaste y te mandamos un enlace para elegir
          una nueva.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {errors.root && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {errors.root.type === "limite" && (
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
              )}
              {errors.root.message}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor={emailId}>Correo electrónico</Label>
            <Input
              id={emailId}
              type="email"
              autoComplete="email"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id={`${emailId}-error`} role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {isSubmitting ? "Enviando…" : "Mandarme el enlace"}
          </Button>
        </form>

        <SinAccesoAlCorreo />
        <VolverAlLogin />
      </CardContent>
    </Card>
  );
}
