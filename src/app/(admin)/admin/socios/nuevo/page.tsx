import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FormularioAltaSocio } from "@/features/admin/components/formulario-alta-socio";

export const metadata: Metadata = { title: "Cargar socio" };

export default function AdminNuevoSocioPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/admin/socios"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al padrón
        </Link>
        <h1 className="font-heading text-2xl font-bold">Cargar socio</h1>
        <p className="text-sm text-muted-foreground">
          Para sumar al sitio a quien ya es socio del club y viene pagando. Al terminar
          vas a ver su contraseña para entrar: copiala y entregásela.
        </p>
      </div>

      <FormularioAltaSocio />
    </div>
  );
}
