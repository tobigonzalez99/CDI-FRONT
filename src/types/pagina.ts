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
   *
   * **Vacío (`""`) es un estado esperado**, no un error: la sección existe y
   * está publicada, pero el club todavía no pasó el texto. Mostrar ahí el
   * estado vacío de la sección.
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

/**
 * Slugs de las secciones que sirve el backend. El texto de las disciplinas
 * no está acá: va en `disciplina.contenido`.
 */
export const PAGINAS = {
  proyectos: "proyectos",
  historia: "historia",
  galeria: "galeria",
  socio: "socio",
} as const;

export type SlugPagina = (typeof PAGINAS)[keyof typeof PAGINAS];

