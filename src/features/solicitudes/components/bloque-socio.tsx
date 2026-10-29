"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Cargando } from "@/components/shared/estado-consulta";
import { HacetesocioCard } from "@/features/solicitudes/components/hacete-socio-card";
import { SocioActivoCard } from "@/features/solicitudes/components/socio-activo-card";
import { useSession } from "@/features/auth/hooks/use-session";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Qué muestra la sección "Socio" según quién la mire.
 *
 * Es el mismo lugar del sitio para los tres casos, con el mismo encuadre: a
 * quien no es socio le ofrece asociarse, y a quien ya lo es le agradece y le
 * deja pedir la baja.
 */
export function BloqueSocio() {
  const { user, isPending } = useSession();

  if (isPending) return <Cargando etiqueta="Cargando…" />;

  if (user?.rol === "SOCIO") return <SocioActivoCard />;

  // El administrador no tiene ficha de socio, así que no le aplica ninguna de
  // las dos: ni asociarse ni darse de baja.
  if (user?.rol === "ADMIN") {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldCheck className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Esta sección es para los socios. Las solicitudes de alta y de baja se
            resuelven desde el panel.
          </p>
          <Link
            href={ROUTES.admin}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-1")}
          >
            Ir al panel
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <HacetesocioCard />;
}
