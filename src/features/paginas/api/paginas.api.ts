import type { Pagina } from "@/types/pagina";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

/** Cada cuánto se vuelve a pedir. El contenido lo edita el club, no cambia seguido. */
const REVALIDAR_SEGUNDOS = 300;

/**
 * Por qué no alcanza con `Pagina | null`: no es lo mismo que el club haya
 * despublicado la sección (hay que responder 404, como manda el backend) que
 * que la API no conteste (el sitio tiene que seguir en pie igual).
 */
export type ResultadoPagina =
  | { estado: "ok"; pagina: Pagina }
  | { estado: "sin-publicar" }
  | { estado: "sin-conexion" };

/**
 * Contenido de una página institucional.
 *
 * Se pide desde el servidor con `fetch` en vez del cliente de axios: la
 * sección es pública y se arma en el render, así que llega en el HTML y no
 * depende de JavaScript.
 */
export async function obtenerPagina(slug: string): Promise<ResultadoPagina> {
  if (!baseURL) return { estado: "sin-conexion" };

  try {
    const respuesta = await fetch(`${baseURL}/paginas/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDAR_SEGUNDOS },
    });

    // Despublicada o inexistente: el backend responde 404 en los dos casos.
    if (respuesta.status === 404) return { estado: "sin-publicar" };
    if (!respuesta.ok) return { estado: "sin-conexion" };

    return { estado: "ok", pagina: (await respuesta.json()) as Pagina };
  } catch {
    return { estado: "sin-conexion" };
  }
}
