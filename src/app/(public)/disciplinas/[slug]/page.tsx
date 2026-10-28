import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionPage } from "@/components/shared/section-page";
import {
  hrefDeDisciplina,
  migasDeDisciplina,
} from "@/components/shared/navbar/nav-config";
import { ContenidoMarkdown } from "@/features/paginas/components/contenido-markdown";
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

  // El texto de cada actividad no vive en `paginas`: es un campo propio de la
  // disciplina. Mientras esté vacío, la sección muestra su estado vacío.
  const contenido = disciplina.contenido?.trim();

  return (
    <SectionPage
      href={hrefDeDisciplina(disciplina.slug)}
      migas={migasDeDisciplina(disciplina)}
      title={disciplina.nombre}
      description={disciplina.descripcion ?? undefined}
    >
      {contenido ? <ContenidoMarkdown texto={contenido} /> : undefined}
    </SectionPage>
  );
}
