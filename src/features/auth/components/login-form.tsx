"use client";

import { useId } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import { useLogin } from "@/features/auth/hooks/use-auth-mutations";
import { aplicarFieldErrors, esApiError, mensajeDeError } from "@/lib/api/errors";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";

const CAMPOS = ["dni", "password"] as const;

interface LoginFormProps {
  /** Lo usa el modal para cerrarse; en la página /login no hace falta. */
  onSuccess?: () => void;
}

/** HU-02: ingreso con DNI y contraseña. Compartido por el modal y /login. */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const dniId = useId();
  const passwordId = useId();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { dni: "", password: "" },
  });

  const { mutateAsync: iniciarSesion } = useLogin();

  const onSubmit: SubmitHandler<LoginFormValues> = async (valores) => {
    try {
      const { user } = await iniciarSesion(valores);
      reset();
      onSuccess?.();

      if (user.mustChangePassword) {
        toast.info("Creá tu contraseña personal", {
          description: "Por seguridad, reemplazá la clave que te dio el club.",
        });
      } else {
        toast.success(`¡Hola, ${user.nombre}!`);
      }
    } catch (error) {
      // Credenciales incorrectas: el mensaje va junto al campo, no en un toast.
      if (esApiError(error) && error.code === "INVALID_CREDENTIALS") {
        setError("password", { type: "server", message: error.message });
        return;
      }

      // Cuenta dada de baja: no es culpa de ningún campo del formulario.
      if (esApiError(error) && error.code === "ACCOUNT_DISABLED") {
        toast.error("Cuenta deshabilitada", { description: error.message });
        return;
      }

      if (!aplicarFieldErrors(error, setError, [...CAMPOS])) {
        toast.error("No pudimos iniciar sesión", {
          description: mensajeDeError(error),
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={dniId}>Número de DNI</Label>
        <Input
          id={dniId}
          inputMode="numeric"
          autoComplete="username"
          placeholder="12345678"
          aria-invalid={Boolean(errors.dni)}
          aria-describedby={errors.dni ? `${dniId}-error` : undefined}
          {...register("dni")}
        />
        {errors.dni && (
          <p id={`${dniId}-error`} role="alert" className="text-sm text-destructive">
            {errors.dni.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={passwordId}>Contraseña</Label>
        <PasswordInput
          id={passwordId}
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p
            id={`${passwordId}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </Button>

      <div className="text-center">
        <Link
          href="/recuperar-password"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => onSuccess?.()}
        >
          Olvidé mi contraseña
        </Link>
      </div>
    </form>
  );
}
