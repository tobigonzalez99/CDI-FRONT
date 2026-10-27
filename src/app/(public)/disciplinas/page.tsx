import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionPage } from "@/components/shared/section-page";
import { hrefDeDisciplina } from "@/components/shared/navbar/nav-config";
import { obtenerDisciplinas } from "@/features/disciplinas/api/disciplinas.api";

export const metadata: Metadata = { title: "Disciplinas" };

export default async function DisciplinasPage() {
  const disciplinas = await obtenerDisciplinas();

  return (
    <SectionPage
      href="/disciplinas"
      title="Disciplinas"
      description="Todas las actividades del club, del plantel mayor a la colonia de verano."
    >
      {disciplinas.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No pudimos cargar las disciplinas. Probá de nuevo en un rato.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {disciplinas.map((disciplina) => (
            <li key={disciplina.id}>
              <Link
                href={hrefDeDisciplina(disciplina.slug)}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-red focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span>
                  <span className="font-heading text-lg font-bold">
                    {disciplina.nombre}
                  </span>
                  {disciplina.descripcion && (
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {disciplina.descripcion}
                    </span>
                  )}
                </span>

                <ArrowRight
                  className="size-5 shrink-0 text-brand-red transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionPage>
  );
}
