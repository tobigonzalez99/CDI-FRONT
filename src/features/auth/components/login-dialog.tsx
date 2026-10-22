"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClubLogo } from "@/components/shared/club-logo";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const dniId = useId();
  const passwordId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { dni: "", password: "" },
  });

  // TODO(backend): llamar a POST /auth/login con estos valores. Si el usuario
  // conserva la contraseña generada (mustChangePassword), redirigir a
  // /cambiar-password; si no, a /perfil o /admin según el rol.
  const onSubmit: SubmitHandler<LoginFormValues> = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.info("Inicio de sesión pendiente", {
      description: "El formulario ya valida los datos. Falta conectar la API.",
    });
  };

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
      setShowPassword(false);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <ClubLogo className="h-14" />
          <DialogTitle className="font-heading text-xl">
            Acceso de socios
          </DialogTitle>
          <DialogDescription>
            Ingresá con tu DNI y la contraseña que te entregó el club.
          </DialogDescription>
        </DialogHeader>

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
            <div className="relative">
              <Input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? `${passwordId}-error` : undefined}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
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
              onClick={() => handleOpenChange(false)}
            >
              Olvidé mi contraseña
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
