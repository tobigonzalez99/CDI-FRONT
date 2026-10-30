import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { GenerarCarnets } from "@/features/admin/components/generar-carnets";
import { PadronSocios } from "@/features/admin/components/padron-socios";

export const metadata: Metadata = { title: "Socios" };

export default function AdminSociosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Padrón de socios</h1>
          <p className="text-sm text-muted-foreground">
            Buscá, filtrá y consultá la ficha de cada socio con su historial de cobros.
          </p>
        </div>

        <Link href="/admin/socios/nuevo" className={buttonVariants()}>
          <UserPlus aria-hidden />
          Cargar socio
        </Link>
      </div>

      <GenerarCarnets />

      <PadronSocios />
    </div>
  );
}
