"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClubLogo } from "@/components/shared/club-logo";
import { LoginForm } from "@/features/auth/components/login-form";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Acceso rápido desde la navbar. El formulario es el mismo que el de /login. */
export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <ClubLogo className="h-14" />
          <DialogTitle className="font-heading text-xl">Acceso de socios</DialogTitle>
          <DialogDescription>
            Ingresá con tu DNI y la contraseña que te entregó el club.
          </DialogDescription>
        </DialogHeader>

        <LoginForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
