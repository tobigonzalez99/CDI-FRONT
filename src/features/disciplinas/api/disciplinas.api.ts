import type { Disciplina } from "@/types/disciplina";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

/** Cada cuánto se vuelve a pedir la lista. Cambia muy de vez en cuando. */
const REVALIDAR_SEGUNDOS = 300;

/**
 * Disciplinas activas, en el orden del menú.
 *
 * Se consulta desde el servidor con `fetch` en vez del cliente de axios: el
 * menú se arma en el render, así que no parpadea ni depende de JavaScript.
 *
 * Si la API no responde devuelve una lista vacía en lugar de propagar el
 * error: el sitio público tiene que seguir en pie aunque el backend esté
 * caído; se perdería el submenú, no la página entera.
 */
export async function obtenerDisciplinas(): Promise<Disciplina[]> {
  if (!baseURL) return [];

  try {
    const respuesta = await fetch(`${baseURL}/disciplinas`, {
      next: { revalidate: REVALIDAR_SEGUNDOS },
    });

    if (!respuesta.ok) return [];

    return (await respuesta.json()) as Disciplina[];
  } catch {
    return [];
  }
}

/** Detalle por slug. `null` cuando no existe, para responder con un 404. */
export async function obtenerDisciplina(slug: string): Promise<Disciplina | null> {
  if (!baseURL) return null;

  try {
    const respuesta = await fetch(`${baseURL}/disciplinas/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDAR_SEGUNDOS },
    });

    if (!respuesta.ok) return null;

    return (await respuesta.json()) as Disciplina;
  } catch {
    return null;
  }
}
