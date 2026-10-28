import { notFound } from "next/navigation";

import { SectionPage } from "@/components/shared/section-page";
import { ContenidoMarkdown } from "./contenido-markdown";
import { obtenerPagina } from "../api/paginas.api";
import { formatearFecha } from "@/lib/formato";
import { cn } from "@/lib/utils";
import type { SlugPagina } from "@/types/pagina";

interface SeccionEditableProps {
  slug: SlugPagina;
  /** Ruta de la sección, para las migas de pan. */
  href: string;
  /** Encabezado mientras no se pueda leer el de la API. */
  porDefecto: { titulo: string; resumen: string };
  /**
   * Lo propio de la sección —un formulario, una grilla de fotos— debajo del
   * texto editable. Sin esto y sin texto, la sección muestra su estado vacío.
   */
  children?: React.ReactNode;
}

/**
 * Sección cuyo texto escribe el club desde el panel.
 *
 * Es el molde de Historia, Galería, Socio y Proyectos: las cuatro son la
 * misma página con distinto slug, así que la diferencia vive en los datos y
 * no en cuatro archivos casi iguales.
 */
export async function SeccionEditable({
  slug,
  href,
  porDefecto,
  children,
}: SeccionEditableProps) {
  const resultado = await obtenerPagina(slug);

  // Despublicada desde el panel: el club la sacó del sitio a propósito.
  if (resultado.estado === "sin-publicar") notFound();

  // Sin API la sección sigue en pie y navegable, con lo que sepamos de ella.
  if (resultado.estado === "sin-conexion") {
    return (
      <SectionPage href={href} title={porDefecto.titulo} description={porDefecto.resumen}>
        {children}
      </SectionPage>
    );
  }

  const { pagina } = resultado;
  const contenido = pagina.contenido.trim();

  /*
    Publicada pero todavía sin texto y sin nada propio: el cuerpo queda en
    `undefined` —no en un fragmento vacío— para que SectionPage muestre su
    estado vacío en lugar de una página en blanco.
  */
  const cuerpo =
    contenido || children ? (
      <>
        {contenido && (
          <div className={cn(children && "mb-14")}>
            <ContenidoMarkdown texto={contenido} />

            <p className="mx-auto mt-10 max-w-3xl text-sm text-muted-foreground">
              Actualizado el {formatearFecha(pagina.updatedAt)}.
            </p>
          </div>
        )}

        {children}
      </>
    ) : undefined;

  return (
    <SectionPage
      href={href}
      title={pagina.titulo}
      description={pagina.resumen ?? undefined}
    >
      {cuerpo}
    </SectionPage>
  );
}
