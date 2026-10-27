import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionPage } from "@/components/shared/section-page";
import {
  hrefDeDisciplina,
  migasDeDisciplina,
} from "@/components/shared/navbar/nav-config";
import {
  obtenerDisciplina,
  obtenerDisciplinas,
} from "@/features/disciplinas/api/disciplinas.api";

/** Prerrenderiza las disciplinas que existen hoy; las nuevas salen a demanda. */
export async function generateStaticParams() {
  const disciplinas = await obtenerDisciplinas();
  return disciplinas.map((disciplina) => ({ slug: disciplina.slug }));
}

export async function generateMetadata({ params }: PageProps<"/disciplinas/[slug]">) {
  const { slug } = await params;
  const disciplina = await obtenerDisciplina(slug);

  if (!disciplina) return { title: "Disciplina no encontrada" } satisfies Metadata;

  return {
    title: disciplina.nombre,
    description: disciplina.descripcion ?? undefined,
  } satisfies Metadata;
}

export default async function DisciplinaPage({
  params,
}: PageProps<"/disciplinas/[slug]">) {
  const { slug } = await params;
  const disciplina = await obtenerDisciplina(slug);

  // Un slug que no existe es un 404, no una página vacía.
  if (!disciplina) notFound();

  return (
    <SectionPage
      href={hrefDeDisciplina(disciplina.slug)}
      migas={migasDeDisciplina(disciplina)}
      title={disciplina.nombre}
      description={disciplina.descripcion ?? undefined}
    />
  );
}
