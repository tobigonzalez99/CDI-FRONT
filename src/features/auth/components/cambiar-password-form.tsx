"use client";

import { useId } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { useCambiarPasswordInicial } from "@/features/auth/hooks/use-auth-mutations";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import {
  forcedChangePasswordSchema,
  type ForcedChangePasswordFormValues,
} from "@/lib/validators/auth";

const CAMPOS = ["newPassword", "confirmPassword"] as const;

/**
 * HU-03: cambio obligatorio de la contraseña generada por el club.
 * Mientras no se complete, el backend responde 403 en el resto de la API.
 */
export function CambiarPasswordForm() {
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForcedChangePasswordFormValues>({
    resolver: zodResolver(forcedChangePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const { mutateAsync: cambiar } = useCambiarPasswordInicial();

  const onSubmit: SubmitHandler<ForcedChangePasswordFormValues> = async (valores) => {
    try {
      await cambiar(valores);
      toast.success("Listo, tu contraseña quedó actualizada");
    } catch (error) {
      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        toast.error("No pudimos cambiar la contraseña", {
          description: mensajeDeError(error),
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <ShieldCheck className="size-8 text-brand-red" aria-hidden />
        <CardTitle className="font-heading text-xl">Creá tu contraseña</CardTitle>
        <CardDescription>
          Por seguridad, reemplazá la contraseña que te entregó el club por una
          personal. Debe tener al menos 8 caracteres, una letra y un número.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={newPasswordId}>Contraseña nueva</Label>
            <PasswordInput
              id={newPasswordId}
              autoComplete="new-password"
              autoFocus
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={
                errors.newPassword ? `${newPasswordId}-error` : undefined
              }
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p
                id={`${newPasswordId}-error`}
                role="alert"
                className="text-sm text-destructive"
              >
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

          <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            )}
            {isSubmitting ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
