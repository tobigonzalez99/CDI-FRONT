import type { ISODateString } from "./api";

/**
 * Sección de contenido editable desde el panel. Hoy: Proyectos (`/proyectos`).
 *
 * No se crean ni se borran desde el sistema: cada página necesita su ruta acá,
 * así que las crea la semilla del backend y el admin solo edita su contenido.
 */
export interface Pagina {
  id: string;
  /** Identifica la página y su ruta: `proyectos` → `/proyectos`. */
  slug: string;
  titulo: string;
  /** Bajada breve para el encabezado de la sección. */
  resumen: string | null;
  /**
   * Cuerpo en **Markdown, no HTML**: lo escribe una persona desde el panel, y
   * volcarlo con `innerHTML` permitiría inyectar scripts. Renderizarlo como
   * Markdown o como texto plano.
   */
  contenido: string;
  /** Una página despublicada responde 404 en el sitio público. */
  publicada: boolean;
  /** Última edición, para mostrar "actualizado el…". */
  updatedAt: ISODateString;
}

export interface UpdatePaginaInput {
  titulo?: string;
  resumen?: string | null;
  contenido?: string;
  publicada?: boolean;
}

/** Slugs de las páginas que existen hoy. */
export const PAGINA_PROYECTOS = "proyectos";
