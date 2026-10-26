import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig, whatsappUrl } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Recuperar contraseña" };

const telefonoSocios = siteConfig.contacto.telefonos[0];

/**
 * PLACEHOLDER: todavía no hay recuperación automática de contraseña en el
 * backend. Mientras tanto la página explica cómo resolverlo por contacto
 * directo, en vez de dejar el enlace del login apuntando a un 404.
 */
export default function RecuperarPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <KeyRound className="size-8 text-brand-red" aria-hidden />
        <CardTitle className="font-heading text-xl">¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>
          Por ahora la restablece la administración del club. Escribinos y te generamos
          una nueva.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        <a
          href={whatsappUrl(
            telefonoSocios.tel,
            "Hola, olvidé mi contraseña del sitio del club y necesito restablecerla.",
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
        >
          Escribir por WhatsApp
        </a>

        <a
          href={`mailto:${siteConfig.contacto.email}?subject=${encodeURIComponent("Recuperar contraseña")}`}
          className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 w-full")}
        >
          Enviar un correo
        </a>

        <Link
          href="/login"
          className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al inicio de sesión
        </Link>
      </CardContent>
    </Card>
  );
}
