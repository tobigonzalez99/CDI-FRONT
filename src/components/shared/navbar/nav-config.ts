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

/**
 * Menú público. Mantener el orden de aparición: lo consumen tanto el navbar
 * de escritorio como el menú móvil, así que se define una sola vez.
 */
export const NAV_ENTRIES: NavEntry[] = [
  { label: "Historia", href: "/historia" },
  { label: "Galería", href: "/galeria" },
  {
    label: "Fútbol",
    href: "/futbol",
    children: [
      {
        label: "Fútbol Masculino",
        href: "/futbol/masculino",
        description: "Primera y Tercera división",
      },
      {
        label: "Fútbol Femenino",
        href: "/futbol/femenino",
        description: "Plantel femenino del club",
      },
      {
        label: "Inferiores",
        href: "/futbol/inferiores",
        description: "Categorías formativas",
      },
      {
        label: "Escuelita",
        href: "/futbol/escuelita",
        description: "Iniciación deportiva",
      },
    ],
  },
  { label: "Socio", href: "/socio" },
];

export interface Miga {
  label: string;
  href: string;
}

/**
 * Ruta de migas de pan para una sección, derivada del propio menú.
 * Así el título y la jerarquía salen de una sola fuente: si cambia el menú,
 * cambian las migas. Siempre arranca en Inicio.
 */
export function construirMigas(href: string): Miga[] {
  const inicio: Miga = { label: "Inicio", href: "/" };

  for (const entry of NAV_ENTRIES) {
    if (entry.href === href) {
      return [inicio, { label: entry.label, href: entry.href }];
    }

    if (hasChildren(entry)) {
      const hijo = entry.children.find((child) => child.href === href);
      if (hijo) {
        return [
          inicio,
          { label: entry.label, href: entry.href },
          { label: hijo.label, href: hijo.href },
        ];
      }
    }
  }

  return [inicio];
}
