import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionPage } from "@/components/shared/section-page";
import {
  hasChildren,
  NAV_ENTRIES,
  type NavSection,
} from "@/components/shared/navbar/nav-config";

export const metadata: Metadata = { title: "Fútbol" };

/** Las categorías salen del menú para no mantener la lista en dos lugares. */
const categorias =
  NAV_ENTRIES.find(
    (entry): entry is NavSection => hasChildren(entry) && entry.href === "/futbol",
  )?.children ?? [];

export default function FutbolPage() {
  return (
    <SectionPage
      href="/futbol"
      title="Fútbol"
      description="Todas las categorías del club, del plantel mayor a la escuelita."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {categorias.map((categoria) => (
          <li key={categoria.href}>
            <Link
              href={categoria.href}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-red focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span>
                <span className="font-heading text-lg font-bold">{categoria.label}</span>
                {categoria.description && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {categoria.description}
                  </span>
                )}
              </span>

              <ArrowRight
                className="size-5 shrink-0 text-brand-red transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </SectionPage>
  );
}
