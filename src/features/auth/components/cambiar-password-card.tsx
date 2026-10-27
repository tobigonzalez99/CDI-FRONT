"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, KeyRound, LoaderCircle } from "lucide-react";
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
import { useCambiarPassword } from "@/features/auth/hooks/use-auth-mutations";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validators/auth";

const CAMPOS = ["currentPassword", "newPassword", "confirmPassword"] as const;

/** HU-05: cambio voluntario de contraseña desde "Mi Perfil". */
export function CambiarPasswordCard() {
  const [abierto, setAbierto] = useState(false);
  /**
   * Límite de 2 cambios cada 30 días (`PASSWORD_CHANGE_LIMIT`, 429).
   * No va en un toast: el mensaje del backend dice desde cuándo podrá volver a
   * cambiarla, y eso tiene que quedar a la vista, no desaparecer solo.
   */
  const [limiteAlcanzado, setLimiteAlcanzado] = useState<string | null>(null);
  const currentId = useId();
  const nuevaId = useId();
  const confirmarId = useId();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const { mutateAsync: cambiar } = useCambiarPassword();

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (valores) => {
    try {
      await cambiar(valores);
      reset();
      setAbierto(false);
      setLimiteAlcanzado(null);
      toast.success("Tu contraseña quedó actualizada");
    } catch (error) {
      if (esApiError(error) && error.code === "PASSWORD_CHANGE_LIMIT") {
        setLimiteAlcanzado(error.message);
        reset();
        setAbierto(false);
        return;
      }
      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        toast.error("No pudimos cambiar la contraseña", {
          description: mensajeDeError(error),
        });
      }
    }
  };

  function alternar() {
    setAbierto((valor) => {
      if (valor) reset();
      return !valor;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-base">
          <KeyRound className="size-4 text-muted-foreground" aria-hidden />
          Seguridad
        </CardTitle>
        <CardDescription>
          Cambiá tu contraseña cuando quieras para mantener tu cuenta segura.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {limiteAlcanzado && (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm"
          >
            <Clock className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            {limiteAlcanzado}
          </p>
        )}

        {!abierto ? (
          <Button
            type="button"
            variant="outline"
            onClick={alternar}
            disabled={Boolean(limiteAlcanzado)}
          >
            Cambiar contraseña
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={currentId}>Contraseña actual</Label>
              <PasswordInput
                id={currentId}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.currentPassword)}
                aria-describedby={
                  errors.currentPassword ? `${currentId}-error` : undefined
                }
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p id={`${currentId}-error`} role="alert" className="text-sm text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={nuevaId}>Contraseña nueva</Label>
              <PasswordInput
                id={nuevaId}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={errors.newPassword ? `${nuevaId}-error` : undefined}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p id={`${nuevaId}-error`} role="alert" className="text-sm text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={confirmarId}>Repetir contraseña nueva</Label>
              <PasswordInput
                id={confirmarId}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? `${confirmarId}-error` : undefined
                }
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p id={`${confirmarId}-error`} role="alert" className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                )}
                {isSubmitting ? "Guardando…" : "Guardar contraseña"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={alternar}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
