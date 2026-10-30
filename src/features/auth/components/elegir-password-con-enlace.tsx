"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LinkIcon, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { validarEnlacePassword } from "@/features/auth/api/auth.api";
import { useElegirPasswordConEnlace } from "@/features/auth/hooks/use-auth-mutations";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import {
  forcedChangePasswordSchema,
  type ForcedChangePasswordFormValues,
} from "@/lib/validators/auth";
import type { PasswordLinkInfo } from "@/types/auth";

const CAMPOS = ["newPassword", "confirmPassword"] as const;

/** Ruta limpia, sin el token, que queda en la barra apenas se lee. */
const RUTA = "/elegir-password";

/**
 * Lee el token de la URL **una sola vez** y lo saca de la barra.
 *
 * Mientras el token está en la barra queda en el historial del navegador, en
 * una captura de pantalla o en el `Referer` de lo que se cargue después; y
 * con él cualquiera elige la contraseña. Por eso se guarda solo en memoria.
 *
 * El ref evita que, en desarrollo, React ejecute el efecto dos veces y la
 * segunda lea la barra ya limpia y crea que no había token.
 */
function useTokenDeLaUrl(): string | null | undefined {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const leido = useRef(false);

  useEffect(() => {
    if (leido.current) return;
    leido.current = true;

    const valor = new URLSearchParams(window.location.search).get("token");
    window.history.replaceState(null, "", RUTA);
    setToken(valor || null);
  }, []);

  return token;
}

function Cargando() {
  return (
    <div className="flex justify-center py-16" role="status" aria-live="polite">
      <LoaderCircle className="size-7 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Revisando el enlace…</span>
    </div>
  );
}

/** El enlace no existe, ya se usó o se venció. La salida es pedir otro. */
function EnlaceInvalido() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <LinkIcon className="size-8 text-muted-foreground" aria-hidden />
        <CardTitle className="font-heading text-xl">Este enlace ya no sirve</CardTitle>
        <CardDescription>
          Puede que ya lo hayas usado o que se haya vencido: los de recuperación duran
          una hora y los de bienvenida, siete días. Pedí uno nuevo y te llega al correo.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Link
          href="/recuperar-password"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
        >
          Pedir un enlace nuevo
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 w-full")}
        >
          Ir a iniciar sesión
        </Link>
      </CardContent>
    </Card>
  );
}

function FormularioNuevaPassword({
  token,
  info,
  onEnlaceVencido,
}: {
  token: string;
  info: PasswordLinkInfo;
  onEnlaceVencido: () => void;
}) {
  const newPasswordId = useId();
  const confirmPasswordId = useId();
  const { mutateAsync: elegir } = useElegirPasswordConEnlace();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForcedChangePasswordFormValues>({
    resolver: zodResolver(forcedChangePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit: SubmitHandler<ForcedChangePasswordFormValues> = async (valores) => {
    try {
      await elegir({ token, ...valores });
    } catch (error) {
      // Se pudo vencer entre que abrió el correo y que eligió la contraseña.
      if (esApiError(error) && error.code === "INVALID_TOKEN") {
        onEnlaceVencido();
        return;
      }
      if (esApiError(error) && error.code === "ACCOUNT_DISABLED") {
        setError("root", {
          type: "server",
          message:
            "Tu cuenta está dada de baja, así que no podés entrar al sitio. Si querés volver a ser socio, comunicate con el club.",
        });
        return;
      }
      // Un error de validación no gasta el enlace: puede corregir y reintentar.
      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        setError("root", { type: "server", message: mensajeDeError(error) });
      }
    }
  };

  const bienvenida = info.tipo === "BIENVENIDA";
  const ocupado = isSubmitting || isSubmitSuccessful;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        {bienvenida ? (
          <ShieldCheck className="size-8 text-brand-red" aria-hidden />
        ) : (
          <KeyRound className="size-8 text-brand-red" aria-hidden />
        )}
        <CardTitle className="font-heading text-xl">
          {bienvenida ? `¡Hola, ${info.nombre}!` : "Elegí una nueva contraseña"}
        </CardTitle>
        <CardDescription>
          {bienvenida
            ? "Ya sos socio del club. Elegí tu contraseña para entrar al sitio: con ella y tu DNI vas a ver tu carnet y tu cuota."
            : `${info.nombre}, elegí la contraseña con la que vas a entrar de ahora en más.`}{" "}
          Tiene que tener al menos 8 caracteres, una letra y un número.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          {errors.root && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {errors.root.message}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor={newPasswordId}>Contraseña nueva</Label>
            <PasswordInput
              id={newPasswordId}
              autoComplete="new-password"
              autoFocus
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={errors.newPassword ? `${newPasswordId}-error` : undefined}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p id={`${newPasswordId}-error`} role="alert" className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={confirmPasswordId}>Repetir contraseña</Label>
            <PasswordInput
              id={confirmPasswordId}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? `${confirmPasswordId}-error` : undefined
              }
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p
                id={`${confirmPasswordId}-error`}
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="h-11 w-full" disabled={ocupado}>
            {ocupado && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            {isSubmitSuccessful ? "Entrando…" : isSubmitting ? "Guardando…" : "Guardar y entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Página a la que llevan los dos correos —la bienvenida al socio nuevo y la
 * recuperación de contraseña—. Al guardar, el backend deja la sesión iniciada
 * y la persona entra directo a su sección.
 */
export function ElegirPasswordConEnlace() {
  const token = useTokenDeLaUrl();
  const [vencido, setVencido] = useState(false);

  const enlace = useQuery({
    queryKey: ["enlace-password", token],
    queryFn: () => validarEnlacePassword({ token: token! }),
    enabled: Boolean(token),
    // Un enlace inválido no se vuelve válido reintentando.
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  if (token === undefined) return <Cargando />;
  if (token === null || vencido) return <EnlaceInvalido />;
  if (enlace.isPending) return <Cargando />;

  if (enlace.isError) {
    if (esApiError(enlace.error) && enlace.error.code === "INVALID_TOKEN") {
      return <EnlaceInvalido />;
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <TriangleAlert className="size-8 text-muted-foreground" aria-hidden />
          <CardTitle className="font-heading text-xl">No pudimos revisar el enlace</CardTitle>
          <CardDescription>{mensajeDeError(enlace.error)}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void enlace.refetch()}
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormularioNuevaPassword
      token={token}
      info={enlace.data}
      onEnlaceVencido={() => setVencido(true)}
    />
  );
}
