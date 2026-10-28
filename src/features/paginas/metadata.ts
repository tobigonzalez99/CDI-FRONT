import type { Metadata } from "next";

import { obtenerPagina } from "./api/paginas.api";
import type { SlugPagina } from "@/types/pagina";

/**
 * Metadatos de una sección editable.
 *
 * El título y la bajada salen de la API, igual que el encabezado, así que
 * cambiarlos desde el panel también cambia lo que ve Google. Los valores por
 * defecto son el plan B para cuando la API no contesta.
 *
 * El `fetch` es el mismo que hace la página, y Next lo memoriza dentro del
 * render: no son dos viajes al backend.
 */
export async function metadataDeSeccion(
  slug: SlugPagina,
  porDefecto: { title: string; description: string },
): Promise<Metadata> {
  const resultado = await obtenerPagina(slug);

  if (resultado.estado !== "ok") return porDefecto;

  return {
    title: resultado.pagina.titulo,
    description: resultado.pagina.resumen ?? porDefecto.description,
  };
}
