import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClubLogo } from "@/components/shared/club-logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <ClubLogo className="h-14" />
        <CardTitle className="font-heading text-xl">Acceso de socios</CardTitle>
        <CardDescription>
          Ingresá con tu DNI y la contraseña que te entregó el club.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
