import type { Disciplina } from "@/types/disciplina";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavSection extends NavItem {
  children: NavItem[];
}

export type NavEntry = NavItem | NavSection;

export function hasChildren(entry: NavEntry): entry is NavSection {
  return "children" in entry;
}

export const DISCIPLINAS_HREF = "/disciplinas";
export const PROYECTOS_HREF = "/proyectos";

/**
 * Menú público.
 *
 * "Disciplinas" es la única entrada desplegable y sus ítems **no** están acá:
 * salen de `GET /disciplinas`, así que sumar una actividad desde el panel la
 * hace aparecer en el menú sin tocar el código.
 */
export const NAV_ENTRIES: NavEntry[] = [
  { label: "Historia", href: "/historia" },
  { label: "Galería", href: "/galeria" },
  { label: "Disciplinas", href: DISCIPLINAS_HREF },
  { label: "Proyectos", href: PROYECTOS_HREF },
  { label: "Socio", href: "/socio" },
];

export function hrefDeDisciplina(slug: string): string {
  return `${DISCIPLINAS_HREF}/${slug}`;
}

/** Convierte las disciplinas de la API en ítems de menú. */
export function disciplinasComoNavItems(disciplinas: Disciplina[]): NavItem[] {
  return disciplinas.map((disciplina) => ({
    label: disciplina.nombre,
    href: hrefDeDisciplina(disciplina.slug),
    description: disciplina.descripcion ?? undefined,
  }));
}

export interface Miga {
  label: string;
  href: string;
}

/**
 * Inicio no está en NAV_ENTRIES porque no es una sección: es la raíz. Lo usan
 * las migas de pan y, como primer ítem, el menú de navegación.
 */
export const INICIO = { label: "Inicio", href: "/" } as const satisfies NavItem;

/**
 * Ruta de migas de pan para una sección del menú fijo.
 * Las disciplinas arman la suya aparte, porque sus nombres vienen de la API.
 */
export function construirMigas(href: string): Miga[] {
  const entrada = NAV_ENTRIES.find((item) => item.href === href);
  return entrada ? [INICIO, { label: entrada.label, href: entrada.href }] : [INICIO];
}

/** Migas de una disciplina: Inicio › Disciplinas › {nombre}. */
export function migasDeDisciplina(disciplina: Disciplina): Miga[] {
  return [
    INICIO,
    { label: "Disciplinas", href: DISCIPLINAS_HREF },
    { label: disciplina.nombre, href: hrefDeDisciplina(disciplina.slug) },
  ];
}
