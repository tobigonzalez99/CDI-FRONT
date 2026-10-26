import type { Metadata } from "next";

import { SectionPage } from "@/components/shared/section-page";

export const metadata: Metadata = { title: "Historia" };

export default function HistoriaPage() {
  return (
    <SectionPage
      href="/historia"
      title="Historia"
      description="Los orígenes del club, sus hitos y la gente que lo construyó desde 1911."
    />
  );
}
