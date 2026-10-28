import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionPage } from "@/components/shared/section-page";
import { PROYECTOS_HREF } from "@/components/shared/navbar/nav-config";
import { obtenerPagina } from "@/features/paginas/api/paginas.api";
import { ContenidoMarkdown } from "@/features/paginas/components/contenido-markdown";
import { formatearFecha } from "@/lib/formato";
import { PAGINA_PROYECTOS } from "@/types/pagina";

/** Bajada de reserva mientras no se pueda leer la de la API. */
const RESUMEN_POR_DEFECTO = "En qué está trabajando el club.";

export async function generateMetadata(): Promise<Metadata> {
  const resultado = await obtenerPagina(PAGINA_PROYECTOS);

  if (resultado.estado !== "ok") {
    return { title: "Proyectos", description: RESUMEN_POR_DEFECTO };
  }

  return {
    title: resultado.pagina.titulo,
    description: resultado.pagina.resumen ?? RESUMEN_POR_DEFECTO,
  };
}

/**
 * Proyectos: la única sección cuyo contenido se edita desde el panel, así que
 * sale entera de `GET /paginas/proyectos` en vez de estar escrita acá.
 */
export default async function ProyectosPage() {
  const resultado = await obtenerPagina(PAGINA_PROYECTOS);

  // Despublicada desde el panel: el club la sacó del sitio a propósito.
  if (resultado.estado === "sin-publicar") notFound();

  // Sin API, la sección sigue existiendo y navegable, con su estado vacío.
  if (resultado.estado === "sin-conexion") {
    return (
      <SectionPage
        href={PROYECTOS_HREF}
        title="Proyectos"
        description={RESUMEN_POR_DEFECTO}
      />
    );
  }

  const { pagina } = resultado;
  const contenido = pagina.contenido.trim();

  return (
    <SectionPage
      href={PROYECTOS_HREF}
      title={pagina.titulo}
      description={pagina.resumen ?? undefined}
    >
      {/*
        Publicada pero todavía sin texto: `undefined` deja que SectionPage
        muestre el mismo "estamos preparando esta sección" que el resto del
        sitio, en vez de una página en blanco.
      */}
      {contenido ? (
        <>
          <ContenidoMarkdown texto={contenido} />

          <p className="mx-auto mt-12 max-w-3xl text-sm text-muted-foreground">
            Actualizado el {formatearFecha(pagina.updatedAt)}.
          </p>
        </>
      ) : undefined}
    </SectionPage>
  );
}
