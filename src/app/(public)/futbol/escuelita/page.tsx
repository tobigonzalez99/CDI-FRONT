import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Escuelita" };

export default function FutbolEscuelitaPage() {
  return (
    <SectionPage
      href="/futbol/escuelita"
      title="Escuelita"
      description="Iniciación deportiva para los más chicos."
    />
  );
}
