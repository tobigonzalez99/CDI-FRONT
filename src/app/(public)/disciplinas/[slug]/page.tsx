import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { EstadoVacio, SectionPage } from "@/components/shared/section-page";
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
  // disciplina, igual que su imagen.
  const contenido = disciplina.contenido?.trim();
  const { imagenUrl } = disciplina;

  return (
    <SectionPage
      href={hrefDeDisciplina(disciplina.slug)}
      migas={migasDeDisciplina(disciplina)}
      title={disciplina.nombre}
      description={disciplina.descripcion ?? undefined}
    >
      {contenido || imagenUrl ? (
        <>
          {imagenUrl && (
            // Ilustra una sección que el encabezado ya nombra, así que va sin
            // texto alternativo: repetirlo solo haría ruido en un lector.
            <div className="relative mx-auto mb-12 aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-muted">
              <Image
                src={imagenUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 48rem, 100vw"
                className="object-cover"
                /*
                  En desarrollo el backend es localhost, y el optimizador de
                  Next rechaza los hosts que resuelven a una IP privada por
                  SSRF. Servirla sin optimizar evita bajarle la guardia al
                  optimizador; en producción, con un dominio real, se optimiza
                  como cualquier otra.
                */
                unoptimized={process.env.NODE_ENV !== "production"}
              />
            </div>
          )}

          {contenido ? <ContenidoMarkdown texto={contenido} /> : <EstadoVacio />}
        </>
      ) : undefined}
    </SectionPage>
  );
}
