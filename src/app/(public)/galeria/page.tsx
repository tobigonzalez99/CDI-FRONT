import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Galería" };

export default function GaleriaPage() {
  return (
    <SectionPage
      href="/galeria"
      title="Galería"
      description="Fotos y videos de los partidos, los planteles y la vida del club."
    />
  );
}
