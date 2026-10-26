import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Fútbol Femenino" };

export default function FutbolFemeninoPage() {
  return (
    <SectionPage
      href="/futbol/femenino"
      title="Fútbol Femenino"
      description="El plantel femenino del club."
    />
  );
}
