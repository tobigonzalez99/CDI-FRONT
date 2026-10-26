import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Inferiores" };

export default function FutbolInferioresPage() {
  return (
    <SectionPage
      href="/futbol/inferiores"
      title="Inferiores"
      description="Las categorías formativas del club."
    />
  );
}
