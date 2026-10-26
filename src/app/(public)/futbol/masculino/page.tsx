import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Fútbol Masculino" };

export default function FutbolMasculinoPage() {
  return (
    <SectionPage
      href="/futbol/masculino"
      title="Fútbol Masculino"
      description="Primera y Tercera división del club."
    />
  );
}
